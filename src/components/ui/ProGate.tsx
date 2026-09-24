import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';

interface ProGateProps {
  title: string;
  description: string;
  /** Libellé du bouton. Par défaut, renvoie vers la page d'adhésion. */
  ctaLabel?: string;
}

/**
 * Écran de remplacement affiché quand l'adhésion de l'utilisateur ne couvre
 * pas une page entière.
 *
 * Purement visuel : l'accès réel est refusé côté serveur par les guards
 * d'entitlement. Ce composant évite simplement d'afficher une page vide ou
 * une suite d'erreurs 403.
 */
export const ProGate: React.FC<ProGateProps> = ({
  title,
  description,
  ctaLabel = 'Voir les offres',
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-bg-2 p-10 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
          <Lock size={20} />
        </div>

        <h2 className="mb-2 text-xl font-black tracking-tight text-txt">{title}</h2>
        <p className="mb-8 text-sm leading-relaxed text-txt-2">{description}</p>

        <button
          type="button"
          onClick={() => navigate('/app/upgrade')}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-2"
        >
          {ctaLabel}
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};
