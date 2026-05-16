import React, { useState } from 'react';
import { PayoutsTable } from '../../../components/trading/PayoutsTable';
import { useAccounts } from '../../../hooks/useAccounts';
import { KpiCard } from '../../../components/ui/KpiCard';
import { AddPayoutModal } from '../../../components/trading/AddPayoutModal';

const PayoutsPage: React.FC = () => {
  const { accounts } = useAccounts();
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const activeAccount = safeAccounts.find(a => a.statut === 'actif') || safeAccounts[0];
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* TODO: Connect to real backend aggregates for Payouts */}
        <KpiCard label="Total Reçu" value="12,482" currency="$" colorClass="text-win" />
        <KpiCard label="En attente" value="3,150" currency="$" colorClass="text-accent" />
        <KpiCard label="Prochain Payout" value="dans 12j" />
        <KpiCard label="Moyenne Mensuelle" value="4,160" currency="$" />
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Retraits & Payouts</h2>
          <p className="text-sm text-txt-2">Historique des retraits de vos comptes funded.</p>
        </div>
        <button 
          onClick={() => activeAccount && setIsModalOpen(true)}
          className="btn-primary"
          disabled={!activeAccount}
        >
          Demander un retrait
        </button>
      </div>

      {activeAccount ? (
        <PayoutsTable accountId={activeAccount.id} />
      ) : (
        <div className="glass p-12 text-center rounded-3xl">
          <p className="text-txt-2 italic">Sélectionnez ou créez un compte actif pour voir l'historique des paiements.</p>
        </div>
      )}

      {activeAccount && (
        <AddPayoutModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          accountId={activeAccount.id}
        />
      )}
    </div>
  );
};

export default PayoutsPage;
