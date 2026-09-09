import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSignature, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

export const PendingContractModal: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const shouldShow = !(user?.role === 'admin' || user?.role === 'superadmin' || location.pathname.includes('/contracts'));

  const { data: pendingContracts } = useQuery({
    queryKey: ['pending-contracts', user?.id],
    queryFn: async () => {
      const res = await api.get('/api/contracts');
      return res.data.data.filter((c: any) => c.status === 'pending' && c.userId === user?.id);
    },
    enabled: !!user,
  });

  // Don't show for admins or if already on contracts page
  if (!shouldShow) {
    return null;
  }

  if (!pendingContracts || pendingContracts.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-bg border border-accent/20 rounded-2xl p-8 w-full max-w-md shadow-2xl relative text-center">
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileSignature size={40} className="text-accent animate-pulse" />
        </div>
        <h3 className="text-2xl font-bold text-txt mb-4">Contrat en attente</h3>
        <p className="text-txt-2 mb-8">
          Vous avez {pendingContracts.length > 1 ? 'des contrats en attente de signature' : 'un contrat en attente de signature'}. 
          Veuillez consulter et signer ce document.
        </p>
        <button
          onClick={() => navigate('/app/contracts')}
          className="w-full flex justify-center items-center gap-2 py-4 bg-accent text-white rounded-xl font-bold hover:bg-accent-hover transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-accent/20"
        >
          Voir le contrat <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
