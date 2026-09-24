import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Loader2, FileCheck2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../lib/api';

interface UserContract {
  id: string;
  status: string;
  createdAt: string;
  signedAt: string | null;
  template: {
    title: string;
  };
}

export default function UserContractsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['user-contracts'],
    queryFn: async () => {
      const res = await api.get('/api/contracts');
      return res.data.data as UserContract[];
    }
  });

  const contracts = data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-txt mb-2">Mes Contrats</h1>
        <p className="text-txt-2 text-sm">
          Consultez et signez vos contrats BEHIND THE TRADES.
        </p>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 text-accent animate-spin" />
          </div>
        ) : contracts.length === 0 ? (
          <div className="dark:bg-white/5 bg-black/5 border border-border rounded-2xl p-12 text-center text-txt-2">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50 text-txt-3" />
            <h3 className="text-xl font-bold text-txt mb-2">Aucun contrat</h3>
            <p>Vous n'avez aucun contrat à signer pour le moment.</p>
          </div>
        ) : (
          contracts.map(contract => (
            <Link
              key={contract.id}
              to={`/app/contracts/${contract.id}`}
              className="dark:bg-white/5 bg-black/5 border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:dark:bg-white/10 bg-black/10 hover:border-border transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg flex-shrink-0 ${contract.status === 'signed' ? 'bg-green-500/10 text-green-500' : 'bg-accent/10 text-accent'}`}>
                  {contract.status === 'signed' ? <FileCheck2 size={24} /> : <FileText size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-txt group-hover:text-accent transition-colors">
                    {contract.template.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-txt-2 mt-1">
                    <span>Reçu le {new Date(contract.createdAt).toLocaleDateString('fr-FR')}</span>
                    {contract.signedAt && (
                      <>
                        <span>•</span>
                        <span className="text-green-500/80">Signé le {new Date(contract.signedAt).toLocaleDateString('fr-FR')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                {contract.status === 'pending' ? (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium border border-yellow-500/20">
                    En attente de signature
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-medium border border-green-500/20">
                    Signé
                  </span>
                )}
                <ChevronRight className="text-txt-3 group-hover:text-txt transition-colors" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
