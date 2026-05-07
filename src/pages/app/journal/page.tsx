import React from 'react';

const JournalPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <h2 className="text-xl font-bold">Journal de Trading</h2>
      
      <div className="glass p-12 rounded-[2.5rem] min-h-[500px] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-win/10 rounded-3xl flex items-center justify-center mb-6 text-win">
           <span className="text-4xl">📖</span>
        </div>
        <h3 className="text-2xl font-bold mb-4">Module Journalisation</h3>
        <p className="text-txt-2 max-w-md mx-auto leading-relaxed">
          Prenez des notes avant, pendant et après vos sessions. Ce module vous permettra d'analyser votre psychologie trade par trade.
        </p>
      </div>
    </div>
  );
};

export default JournalPage;
