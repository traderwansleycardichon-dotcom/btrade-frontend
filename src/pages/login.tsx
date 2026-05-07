import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { HeroPane } from '../components/auth/HeroPane';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg flex overflow-hidden">
      <HeroPane />
      
      <main className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 relative overflow-y-auto">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
             <span className="font-black text-white">B</span>
          </div>
          <span className="font-black text-xl tracking-tighter">BTrade</span>
        </div>

        <LoginForm />

        {/* Footer info */}
        <div className="mt-12 text-center">
          <p className="text-[10px] text-txt-3 font-bold uppercase tracking-[0.2em] mb-4">
            Secured by AES-256 Encryption
          </p>
          <div className="flex gap-4 justify-center grayscale opacity-30">
             <div className="w-8 h-4 bg-white/20 rounded" />
             <div className="w-8 h-4 bg-white/20 rounded" />
             <div className="w-8 h-4 bg-white/20 rounded" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
