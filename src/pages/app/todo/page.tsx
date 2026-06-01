import React, { useState, useEffect } from 'react';
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
import { Plus, GripVertical, Trash2, CheckCircle2, Circle, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../lib/api';
import { format } from 'date-fns';
import Lottie from 'lottie-react';
import confettiData from '../../../assets/confetti.json';

interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  position: number;
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
  const [tasks, setTasks] = useState<Task[]>([]);
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

  const progress = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.isCompleted).length / tasks.length) * 100)
    : 0;

  useEffect(() => {
    if (progress === 100 && tasks.length > 0) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 6000);
      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
    }
  }, [progress, tasks.length]);

  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const res = await api.get(`/api/todo?startDate=${dateStr}&endDate=${dateStr}`);
      const data = res.data;
      if (data.success) {
        setTasks(data.data);
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
        setTasks([...tasks, data.data]);
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
    setTasks(tasks.map(t => t.id === id ? { ...t, isCompleted } : t));
    try {
      await api.put(`/api/todo/${id}`, { isCompleted });
    } catch (err) {
      console.error('Error updating task', err);
      // Revert optimistic update on error
      fetchTasks();
    }
  };

  const deleteTask = async (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    try {
      await api.delete(`/api/todo/${id}`);
    } catch (err) {
      console.error('Error deleting task', err);
      fetchTasks();
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex(t => t.id === active.id);
      const newIndex = tasks.findIndex(t => t.id === over.id);
      
      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      
      // Update positions
      const updatedTasks = newTasks.map((t, index) => ({
        ...t,
        position: index
      }));
      
      setTasks(updatedTasks);

      // Save to backend
      try {
        await api.put('/api/todo/reorder', {
          tasks: newTasks.map((t, index) => ({ id: t.id, order: index }))
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
            Jounen Reyisi ! 🎯
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
            Passez au plan PRO pour continuer à planifier vos journées et recevoir les conseils de l'IA.
          </p>
          <Link to="/app/upgrade" className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors">
            Passer à PRO
          </Link>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Ma To-Do List</h1>
        <p className="text-white/60">
          Planifiez votre journée. L'IA calculera votre taux de réussite chaque soir.
        </p>
      </div>

      {/* Date Navigation & Progress */}
      <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-6">
        <div>
          <h2 className="text-xl font-medium text-white">
            {format(selectedDate, 'EEEE, d MMMM')}
          </h2>
          <p className="text-white/40 text-sm mt-1">
            {tasks.filter(t => t.isCompleted).length} sur {tasks.length} tâches complétées
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-accent">{progress}%</div>
            <div className="text-xs text-white/40">Progression</div>
          </div>
          <div className="w-16 h-16 relative flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="32" cy="32" r="28"
                fill="none"
                stroke="currentColor"
                className="text-white/10"
                strokeWidth="4"
              />
              {/* Progress circle */}
              <circle
                cx="32" cy="32" r="28"
                fill="none"
                stroke="currentColor"
                className="text-accent transition-all duration-1000 ease-out"
                strokeWidth="4"
                strokeDasharray={`${(progress / 100) * 175} 175`}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Add Task Input */}
      <form onSubmit={addTask} className="flex gap-3">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Ajouter une nouvelle tâche..."
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

      {/* Task List */}
      {!loading && tasks.length === 0 ? (
        <div className="text-center py-12 text-white/40 border border-dashed border-white/10 rounded-2xl">
          Aucune tâche pour aujourd'hui. Commencez par en ajouter une !
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={tasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {tasks.map(task => (
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
