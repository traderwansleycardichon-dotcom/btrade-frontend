import React from "react";
import { CreditCard, TrendingUp, Users, DollarSign } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AdminBillingStatsProps {
  data: {
    activeSubscriptions: number;
    proUsersCount: number;
    mrr: number;
    conversionRate: number;
    growth: number;
  } | null;
  loading: boolean;
}

export const AdminBillingStats: React.FC<AdminBillingStatsProps> = ({
  data,
  loading,
}) => {
  if (loading || !data) {
    return (
      <div className="glass p-8 rounded-3xl h-96 animate-pulse flex flex-col justify-center items-center">
        <CreditCard size={48} className="text-txt-3 mb-4 opacity-50" />
        <div className="h-4 w-48 bg-border rounded mb-2" />
        <div className="h-3 w-32 bg-border rounded" />
      </div>
    );
  }

  const items = [
    {
      label: "Revenu Mensuel (MRR)",
      value: `$${data.mrr.toLocaleString()}`,
      icon: DollarSign,
      color: "text-win",
    },
    {
      label: "Abonnements Actifs",
      value: data.activeSubscriptions,
      icon: CreditCard,
      color: "text-accent",
    },
    {
      label: "Utilisateurs PRO",
      value: data.proUsersCount,
      icon: Users,
      color: "text-accent-2",
    },
    {
      label: "Taux de Conversion",
      value: `${data.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-[#8B5CF6]",
    },
  ];

  return (
    <div className="glass p-8 rounded-3xl h-98 flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="font-bold text-lg">Revenus & Abonnements</h3>
          <p className="text-txt-2 text-sm">
            Aperçu financier de la plateforme
          </p>
        </div>
        <div className="p-3 bg-accent/10 rounded-2xl">
          <CreditCard className="text-accent" size={24} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        {items.map((item, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-bg/50 border border-border/50 group hover:border-accent/30 transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("p-2 rounded-lg bg-surface", item.color)}>
                <item.icon size={16} />
              </div>
              <span className="text-[10px] font-bold text-txt-3 uppercase tracking-widest">
                {item.label}
              </span>
            </div>
            <div className="text-xl font-mono font-bold tracking-tight">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-2xl bg-accent/5 border border-accent/10 flex items-center gap-3">
        <TrendingUp size={16} className="text-accent" />
        <p className="text-[11px] text-txt-2 leading-relaxed">
          La croissance des abonnements est de{" "}
          <span className="text-accent font-bold">
            +{data.growth.toFixed(1)}%
          </span>{" "}
          par rapport au mois dernier.
        </p>
      </div>
    </div>
  );
};
