import React from 'react';
import { LineChart, ArrowLeft, Star } from 'lucide-react';
import { SparkLine } from '../ui/SparkLine';
import { MOCK_TESTIMONIALS } from '../../lib/mocks';
import { useSettings } from '../../contexts/SettingsContext';

export const HeroPane: React.FC = () => {
  const testimonial = MOCK_TESTIMONIALS[0];
  const { settings } = useSettings();

  return (
    <div className="hidden lg:flex flex-col flex-1 bg-surface relative overflow-hidden p-16">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#F36C0015,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,#F36C0010,transparent_50%)]" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#F36C00 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      {/* Top Header */}
      <div className="relative flex justify-between items-center mb-auto">
        <div className="flex items-center gap-3">
          {settings?.platform_logo ? (
            <img src={settings.platform_logo} alt="Logo BTrade" className="h-10 w-auto object-contain" />
          ) : (
            <>
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg">
                <LineChart size={24} className="text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight">BTrade</span>
            </>
          )}
        </div>
        <a href="/" className="flex items-center gap-2 text-txt-2 hover:text-txt font-bold text-sm transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Retour au site
        </a>
      </div>

      {/* Main Content */}
      <div className="relative max-w-lg">
        <h1 className="text-5xl font-black mb-6 leading-tight">
          Passez au niveau <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-2">supérieur.</span>
        </h1>
        <p className="text-xl text-txt-2 mb-12 leading-relaxed">
          Rejoignez plus de 2,800 traders qui utilisent BTrade pour automatiser leur journal et optimiser leurs setups.
        </p>

        {/* Floating Mock Card */}
        <div className="bg-elevated border border-border p-6 rounded-3xl shadow-2xl animate-float relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-1">Growth Balance</div>
                <div className="text-3xl font-mono font-bold">+$12,842.50</div>
              </div>
              <div className="bg-win/10 text-win text-xs font-bold px-2 py-1 rounded">+14.2%</div>
            </div>
            <SparkLine 
              points={[10, 15, 12, 18, 22, 20, 28, 26, 35, 32, 45]} 
              width={400} 
              height={80} 
              color="#F36C00" 
              showDot 
            />
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div className="relative mt-auto">
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-accent text-accent" />)}
        </div>
        <blockquote className="text-lg font-medium italic mb-4 text-txt/90">
          "{testimonial.text}"
        </blockquote>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center font-bold`}>
            {testimonial.initials}
          </div>
          <div>
            <div className="font-bold text-sm">{testimonial.name}</div>
            <div className="text-xs text-txt-2">{testimonial.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
