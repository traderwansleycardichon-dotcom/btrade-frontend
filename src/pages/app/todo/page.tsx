import React, { useState, useEffect, useMemo } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Trash2, CheckCircle2, Circle, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../lib/api';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, subWeeks, addWeeks, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import Lottie from 'lottie-react';
import confettiData from '../../../assets/confetti.json';

interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  position: number;
  date: string;
}

// Composant pour un élément de liste drag-and-drop
function SortableTaskItem({ 
  task, 
  onToggle, 
  onDelete 
}: { 
  task: Task; 
  onToggle: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl group hover:bg-white/10 transition-colors">
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-white/40 hover:text-white"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <button 
        onClick={() => onToggle(task.id, !task.isCompleted)}
        className="flex-shrink-0"
      >
        {task.isCompleted ? (
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        ) : (
          <Circle className="h-6 w-6 text-white/40 hover:text-white" />
        )}
      </button>

      <span className={`flex-1 text-sm ${task.isCompleted ? 'line-through text-white/40' : 'text-white'}`}>
        {task.title}
      </span>

      <button 
        onClick={() => onDelete(task.id)}
        className="text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}


export default function TodoPage() {
  const { user } = useAuth();
  const [weekTasks, setWeekTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTrialLocked, setIsTrialLocked] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAnimation, setShowAnimation] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Date boundaries for the week
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

  // Generate the 7 days of the currently selected week
  const daysOfWeek = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Tasks for the selected day only
  const dailyTasks = useMemo(() => {
    return weekTasks
      .filter(t => t.date && t.date.split('T')[0] === format(selectedDate, 'yyyy-MM-dd'))
      .sort((a, b) => a.position - b.position);
  }, [weekTasks, selectedDate]);

  // Weekly and Daily progress
  const weeklyProgress = weekTasks.length > 0 
    ? Math.round((weekTasks.filter(t => t.isCompleted).length / weekTasks.length) * 100)
    : 0;

  const dailyProgress = dailyTasks.length > 0
    ? Math.round((dailyTasks.filter(t => t.isCompleted).length / dailyTasks.length) * 100)
    : 0;

  useEffect(() => {
    // Show animation if the entire week is completed OR the day is completed
    if ((weeklyProgress === 100 && weekTasks.length > 0) || (dailyProgress === 100 && dailyTasks.length > 0)) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 6000);
      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
    }
  }, [weeklyProgress, dailyProgress, weekTasks.length, dailyTasks.length]);

  useEffect(() => {
    fetchWeekTasks();
  }, [weekStart]); // Fetch whenever the week changes

  const fetchWeekTasks = async () => {
    try {
      setLoading(true);
      const startDateStr = format(weekStart, 'yyyy-MM-dd');
      const endDateStr = format(weekEnd, 'yyyy-MM-dd');
      const res = await api.get(`/api/todo?startDate=${startDateStr}&endDate=${endDateStr}`);
      const data = res.data;
      if (data.success) {
        setWeekTasks(data.data);
        setIsTrialLocked(data.isTrialLocked);
      }
    } catch (err) {
      console.error('Error fetching tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isTrialLocked) return;

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const res = await api.post('/api/todo', { title: newTaskTitle, date: dateStr });
      const data = res.data;
      if (data.success) {
        setWeekTasks([...weekTasks, data.data]);
        setNewTaskTitle('');
      } else if (data.error?.includes('Trial expired')) {
        setIsTrialLocked(true);
      }
    } catch (err: any) {
      if (err.response?.data?.error?.includes('Trial expired')) {
        setIsTrialLocked(true);
      }
      console.error('Error adding task', err);
    }
  };

  const toggleTask = async (id: string, isCompleted: boolean) => {
    // Optimistic update
    setWeekTasks(weekTasks.map(t => t.id === id ? { ...t, isCompleted } : t));
    try {
      await api.put(`/api/todo/${id}`, { isCompleted });
    } catch (err) {
      console.error('Error updating task', err);
      // Revert optimistic update on error
      fetchWeekTasks();
    }
  };

  const deleteTask = async (id: string) => {
    setWeekTasks(weekTasks.filter(t => t.id !== id));
    try {
      await api.delete(`/api/todo/${id}`);
    } catch (err) {
      console.error('Error deleting task', err);
      fetchWeekTasks();
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = dailyTasks.findIndex(t => t.id === active.id);
      const newIndex = dailyTasks.findIndex(t => t.id === over.id);
      
      const newDailyTasks = arrayMove(dailyTasks, oldIndex, newIndex);
      
      // Update positions
      const updatedDailyTasks = newDailyTasks.map((t, index) => ({
        ...t,
        position: index
      }));
      
      // Merge back into weekTasks
      const newWeekTasks = weekTasks.map(wt => {
        const updated = updatedDailyTasks.find(udt => udt.id === wt.id);
        return updated ? updated : wt;
      });

      setWeekTasks(newWeekTasks);

      // Save to backend
      try {
        await api.put('/api/todo/reorder', {
          items: updatedDailyTasks.map((t, index) => ({ id: t.id, position: index }))
        });
      } catch (err) {
        console.error('Error reordering', err);
      }
    }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out] relative">
      
      {/* Confetti Animation Overlay */}
      {showAnimation && (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
          <Lottie 
            animationData={confettiData} 
            loop={false} 
            className="w-full h-full absolute inset-0"
          />
          <div className="absolute top-20 bg-accent text-white px-6 py-3 rounded-full font-bold shadow-lg animate-bounce z-50">
            Objectif Atteint ! 🎯
          </div>
        </div>
      )}

      {/* Trial Locked Overlay */}
      {isTrialLocked && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-white/10 m-6">
          <div className="h-16 w-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Période d'essai terminée</h2>
          <p className="text-white/60 max-w-md mb-6">
            Votre essai gratuit de 3 jours pour la To-Do List intelligente est expiré. 
            Passez au plan PRO pour continuer à planifier vos semaines et recevoir les conseils de l'IA.
          </p>
          <Link to="/app/upgrade" className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors">
            Passer à PRO
          </Link>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Ma Semaine</h1>
          <p className="text-white/60">
            Planifiez vos tâches pour toute la semaine. Les rappels sont automatiques !
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedDate(subWeeks(selectedDate, 1))}
            className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={20} className="text-white/70" />
          </button>
          <span className="text-sm font-medium text-white/80 min-w-[120px] text-center">
            {format(weekStart, 'd MMM')} - {format(weekEnd, 'd MMM')}
          </span>
          <button 
            onClick={() => setSelectedDate(addWeeks(selectedDate, 1))}
            className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={20} className="text-white/70" />
          </button>
        </div>
      </div>

      {/* Week Days Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
        {daysOfWeek.map(day => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const tasksForDay = weekTasks.filter(t => t.date && t.date.split('T')[0] === format(day, 'yyyy-MM-dd'));
          const completedTasks = tasksForDay.filter(t => t.isCompleted).length;
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={`flex-1 min-w-[100px] p-3 rounded-2xl border transition-all ${
                isSelected 
                  ? 'bg-accent/10 border-accent/50 text-white shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]' 
                  : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="text-xs font-medium uppercase tracking-wider mb-1">
                {format(day, 'EEEE', { locale: fr })}
              </div>
              <div className="text-xl font-bold mb-2">
                {format(day, 'd')}
              </div>
              
              {/* Indicator badges */}
              <div className="flex items-center justify-center gap-1.5">
                {tasksForDay.length > 0 ? (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    completedTasks === tasksForDay.length 
                      ? 'bg-win/20 text-win' 
                      : 'bg-accent/20 text-accent'
                  }`}>
                    {completedTasks}/{tasksForDay.length}
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 font-medium">
                    Vide
                  </span>
                )}
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Daily Progress Info */}
      <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-6">
        <div>
          <h2 className="text-xl font-medium text-white capitalize">
            {format(selectedDate, 'EEEE, d MMMM', { locale: fr })}
          </h2>
          <p className="text-white/40 text-sm mt-1">
            {dailyTasks.filter(t => t.isCompleted).length} sur {dailyTasks.length} tâches complétées aujourd'hui
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right border-r border-white/10 pr-6">
            <div className="text-lg font-bold text-white">{weeklyProgress}%</div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest">Semaine</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-accent">{dailyProgress}%</div>
              <div className="text-xs text-white/40">Ce jour</div>
            </div>
            <div className="w-16 h-16 relative flex items-center justify-center">
              <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke="currentColor"
                  className="text-white/10"
                  strokeWidth="4"
                />
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke="currentColor"
                  className="text-accent transition-all duration-1000 ease-out"
                  strokeWidth="4"
                  strokeDasharray={`${(dailyProgress / 100) * 175} 175`}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Input */}
      <form onSubmit={addTask} className="flex gap-3">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder={`Ajouter une tâche pour ${format(selectedDate, 'EEEE', { locale: fr })}...`}
          className="flex-1 px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors"
          disabled={isTrialLocked}
        />
        <button 
          type="submit"
          disabled={!newTaskTitle.trim() || isTrialLocked}
          className="px-6 py-4 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Ajouter</span>
        </button>
      </form>

      {/* Task List (for selected day) */}
      {!loading && dailyTasks.length === 0 ? (
        <div className="text-center py-12 text-white/40 border border-dashed border-white/10 rounded-2xl">
          Aucune tâche prévue pour ce jour. Ajoutez-en une !
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={dailyTasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {dailyTasks.map(task => (
                <SortableTaskItem 
                  key={task.id} 
                  task={task} 
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
