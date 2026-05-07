import React from 'react';
import { GraduationCap, Play, BookOpen, Search, Award } from 'lucide-react';

const FormationPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold">BTrade Academy</h2>
          <p className="text-txt-2 text-sm">Le centre de formation pour devenir un trader rentable et serein.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" />
          <input 
            type="text" 
            placeholder="Rechercher un cours..." 
            className="w-full bg-surface border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent/50 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { title: 'Psychologie du Trading', lessons: 8, duration: '2h 15m', level: 'Débutant', img: '🧠' },
          { title: 'Price Action Masterclass', lessons: 12, duration: '5h 30m', level: 'Avancé', img: '📈' },
          { title: 'Gestion des Risques', lessons: 5, duration: '1h 45m', level: 'Intermédiaire', img: '🛡️' },
        ].map((course, i) => (
          <div key={i} className="glass group overflow-hidden rounded-3xl border border-border hover:border-accent/30 transition-all">
            <div className="h-40 bg-elevated flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
              {course.img}
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest px-2 py-0.5 rounded bg-accent/10">{course.level}</span>
                <span className="text-[10px] font-bold text-txt-3">{course.duration}</span>
              </div>
              <h3 className="text-lg font-bold mb-4">{course.title}</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-txt-2">
                  <BookOpen size={14} />
                  {course.lessons} leçons
                </div>
                <button className="p-2 rounded-xl bg-accent text-white hover:bg-accent-2 transition-colors">
                  <Play size={16} fill="currentColor" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 rounded-3xl">
          <h3 className="text-lg font-bold mb-6">Continuer l'apprentissage</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-6 p-4 rounded-2xl bg-bg/50 border border-border group hover:border-accent/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <GraduationCap size={24} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-txt-3 uppercase mb-1">Dernière leçon vue</div>
                <div className="font-bold">L'importance de la patience en Trading</div>
                <div className="h-1 w-full bg-border rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-accent w-3/4" />
                </div>
              </div>
              <button className="btn-secondary py-2 text-xs">Reprendre</button>
            </div>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 bg-gradient-to-br from-win/5 to-transparent">
          <div className="w-16 h-16 rounded-full bg-win/10 flex items-center justify-center text-win">
            <Award size={32} />
          </div>
          <h3 className="text-lg font-bold">Vos Certifications</h3>
          <p className="text-xs text-txt-2">Validez vos modules pour obtenir vos badges d'expertise.</p>
          <div className="w-full pt-4 border-t border-border">
            <span className="text-[10px] font-bold text-txt-3 uppercase tracking-tighter">0 / 4 Modules Complétés</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormationPage;
