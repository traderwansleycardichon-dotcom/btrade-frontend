import React from 'react';
import { usePlan, FeatureKey } from '../../hooks/usePlan';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface FeatureGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDesc?: string;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ 
  feature, 
  children,
  fallbackTitle = "Fonctionnalité Pro",
  fallbackDesc = "Débloquez cette option et accélérez vos performances de trading avec la puissance du plan Pro."
}) => {
  const { canUse } = usePlan();
  const navigate = useNavigate();

  if (canUse(feature)) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border">
      {/* Blurred preview of the actual content */}
      <div className="pointer-events-none select-none blur-[4px] opacity-25">
        {children}
      </div>

      {/* Overlay Premium styled Behind The Trade */}
      <div className="absolute inset-0 bg-bg/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-3 animate-pulse"
        >
          <Sparkles size={20} />
        </motion.div>
        
        <motion.h3 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-base font-extrabold text-txt tracking-wide mb-1.5"
        >
          {fallbackTitle}
        </motion.h3>
        
        <motion.p 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-xs text-txt-2 max-w-[285px] mb-4 leading-relaxed"
        >
          {fallbackDesc}
        </motion.p>

        <motion.button 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          onClick={() => navigate('/app/upgrade')}
          className="px-4 py-2 text-xs font-bold text-white bg-accent hover:bg-accent/90 rounded-xl transition-all shadow-md hover:scale-105"
        >
          Débloquer le plan Pro
        </motion.button>
      </div>
    </div>
  );
};
