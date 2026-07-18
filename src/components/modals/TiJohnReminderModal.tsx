import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight } from "lucide-react";
import TiJohnReminderImg from "../../assets/tijohn-reminder.jpg";
import { useAuth } from "../../hooks/useAuth";

export const TiJohnReminderModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const hasSeen = localStorage.getItem(`tijohn_reminder_seen_${user.id}`);

    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleClose = () => {
    if (user) {
      localStorage.setItem(`tijohn_reminder_seen_${user.id}`, "true");
    }
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[360px] max-h-[90vh] overflow-y-auto custom-scrollbar bg-bg border border-border/50 rounded-2xl sm:rounded-3xl shadow-2xl z-[130] flex flex-col"
          >
            {/* Image Header */}
            <div className="relative w-full aspect-square bg-surface border-b border-border flex items-center justify-center p-0">
              <img
                src={TiJohnReminderImg}
                alt="Ti John AI Trading Assistant"
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 backdrop-blur text-white rounded-full transition-colors z-10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-5 sm:p-8 flex flex-col items-center text-center relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-4 sm:mb-6 -mt-12 sm:-mt-16 relative z-10 shadow-lg border-4 border-bg">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              <h2 className="text-xl sm:text-2xl font-black mb-3 sm:mb-4">
                Salut, Mwen se <span className="text-accent">Ti John !</span>
              </h2>

              <p className="text-txt-2 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
                Ou kapab klike sou bouton ki anba a dwat lan pou poze m kesyon
                ki gen rapò ak trading, m ap ede w pi byen konprann konsèp la.
              </p>

              <button
                onClick={handleClose}
                className="w-full py-4 bg-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-accent/90 transition-all shadow-[0_0_20px_rgba(243,108,0,0.3)] hover:scale-[1.02]"
              >
                Mwen konprann
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
