import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { useAccounts } from '../../hooks/useAccounts';
import { useToast } from '../../hooks/useToast';

type Account = {
  id: string;
  nom: string | null;
  propFirm: string | null;
  tailleCompte: number | string | null;
  balanceCourante: number | string | null;
  profitTargetPct: number | string | null;
  maxDrawdownPct: number | string | null;
  statut: string;
};

interface Props {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditAccountModal: React.FC<Props> = ({ account, isOpen, onClose }) => {
  const { updateAccount } = useAccounts();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    nom: '',
    prop_firm: '',
    taille_compte: 0,
    balance_courante: 0,
    // Saisi en $ côté UI, converti en % côté backend
    profit_target_amount: 0,
    max_drawdown_amount: 0,
    statut: 'actif',
  });

  useEffect(() => {
    if (!account) return;
    const size = Number(account.tailleCompte || 0);
    const ptPct = Number(account.profitTargetPct || 0);
    const ddPct = Number(account.maxDrawdownPct || 0);
    setForm({
      nom: account.nom || '',
      prop_firm: account.propFirm || '',
      taille_compte: size,
      balance_courante: Number(account.balanceCourante || 0),
      profit_target_amount: size > 0 ? Math.round((size * ptPct) / 100) : 0,
      max_drawdown_amount: size > 0 ? Math.round((size * ddPct) / 100) : 0,
      statut: account.statut || 'actif',
    });
  }, [account]);

  if (!account) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const size = Number(form.taille_compte);
    // $ → % pour le backend (qui stocke en pourcentage)
    const profitTargetPct =
      size > 0 && form.profit_target_amount > 0
        ? (form.profit_target_amount / size) * 100
        : null;
    const maxDrawdownPct =
      size > 0 && form.max_drawdown_amount > 0
        ? (form.max_drawdown_amount / size) * 100
        : null;
    try {
      await updateAccount.mutateAsync({
        id: account.id,
        patch: {
          nom: form.nom,
          prop_firm: form.prop_firm || null,
          taille_compte: size,
          balance_courante: Number(form.balance_courante),
          profit_target_pct: profitTargetPct,
          max_drawdown_pct: maxDrawdownPct,
          statut: form.statut,
        },
      });
      addToast('Compte mis à jour');
      onClose();
    } catch {
      addToast('Erreur lors de la mise à jour', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier le compte"
      footer={
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn-ghost text-xs px-3 py-2 rounded-lg">
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={updateAccount.isPending}
            className="btn-primary text-xs px-3 py-2 rounded-lg disabled:opacity-50"
          >
            {updateAccount.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      }
    >
      <form onSubmit={submit} className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-1.5">
            Nom
          </label>
          <input
            required
            value={form.nom}
            onChange={e => setForm({ ...form, nom: e.target.value })}
            className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs focus:border-accent/50 outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-1.5">
            Prop Firm
          </label>
          <input
            value={form.prop_firm}
            onChange={e => setForm({ ...form, prop_firm: e.target.value })}
            className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs focus:border-accent/50 outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-1.5">
            Statut
          </label>
          <select
            value={form.statut}
            onChange={e => setForm({ ...form, statut: e.target.value })}
            className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs focus:border-accent/50 outline-none"
          >
            <option value="actif">Actif</option>
            <option value="pause">En pause</option>
            <option value="ferme">Fermé</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-1.5">
            Capital ($)
          </label>
          <input
            type="number"
            value={form.taille_compte}
            onChange={e =>
              setForm({ ...form, taille_compte: parseFloat(e.target.value) || 0 })
            }
            className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs mono focus:border-accent/50 outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-1.5">
            Solde courant ($)
          </label>
          <input
            type="number"
            value={form.balance_courante}
            onChange={e =>
              setForm({ ...form, balance_courante: parseFloat(e.target.value) || 0 })
            }
            className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs mono focus:border-accent/50 outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-1.5">
            Profit target ($)
          </label>
          <input
            type="number"
            step="1"
            value={form.profit_target_amount}
            onChange={e =>
              setForm({ ...form, profit_target_amount: parseFloat(e.target.value) || 0 })
            }
            className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs mono focus:border-accent/50 outline-none"
          />
          {form.taille_compte > 0 && form.profit_target_amount > 0 && (
            <p className="mt-1 text-[10px] text-txt-3">
              ≈ {((form.profit_target_amount / form.taille_compte) * 100).toFixed(2)}% du capital
            </p>
          )}
        </div>

        <div>
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-1.5">
            Max drawdown ($)
          </label>
          <input
            type="number"
            step="1"
            value={form.max_drawdown_amount}
            onChange={e =>
              setForm({ ...form, max_drawdown_amount: parseFloat(e.target.value) || 0 })
            }
            className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs mono focus:border-accent/50 outline-none"
          />
          {form.taille_compte > 0 && form.max_drawdown_amount > 0 && (
            <p className="mt-1 text-[10px] text-txt-3">
              ≈ {((form.max_drawdown_amount / form.taille_compte) * 100).toFixed(2)}% du capital
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
};
