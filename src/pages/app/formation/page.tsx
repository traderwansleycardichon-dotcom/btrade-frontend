import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Play, BookOpen, Search, Award, CheckCircle, Lock, X, Printer, ChevronRight } from 'lucide-react';
import api from '../../../lib/api';
import { FeatureGate } from '../../../components/ui/FeatureGate';
import { useSettings } from '../../../contexts/SettingsContext';

interface Module {
  id: string;
  slug: string;
  titre: string;
  description: string;
  ordre: number;
  icone: string;
  coverImage?: string;
  progressionPct: number;
  certified: boolean;
  lessonsCount: number;
  lessonsCompleted: number;
  prochaineLessonId: string | null;
}

interface ModulesResponse {
  modules: Module[];
  progressionGlobale: number;
}

interface CertificateData {
  moduleId: string;
  moduleTitle: string;
  moduleDescription: string;
  userName: string;
  completedAt: string;
  verificationCode: string;
}

function stripEmoji(text: string): string {
  return text.replace(/\p{Extended_Pictographic}/gu, '').replace(/\s+/g, ' ').trim();
}

const FormationHub: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { settings } = useSettings();

  const [selectedCertModuleId, setSelectedCertModuleId] = useState<string | null>(null);
  const [isCertListOpen, setIsCertListOpen] = useState(false);

  const { data: formationData, isLoading, error } = useQuery<ModulesResponse>({
    queryKey: ['formationModules'],
    queryFn: async () => {
      const { data } = await api.get('/api/formation/modules');
      return data.data;
    },
  });

  const modules = formationData?.modules || [];
  const progressionGlobale = formationData?.progressionGlobale || 0;

  const { data: certificateData, isLoading: isCertLoading } = useQuery<CertificateData>({
    queryKey: ['certificate', selectedCertModuleId],
    queryFn: async () => {
      const { data } = await api.get(`/api/formation/certificates/${selectedCertModuleId}`);
      return data.data;
    },
    enabled: !!selectedCertModuleId,
    retry: false,
  });

  const handlePrintCertificate = (cert: CertificateData) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const logoUrl = settings?.certificate_logo || settings?.platform_logo || '';
    const sigUrl = settings?.certificate_signature_image || '';
    const signerName = settings?.certificate_signer_name || 'Administration Platform';

    printWindow.document.write(`
      <html>
        <head>
          <title>Behind The Trades Academy - Certificat</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Montserrat:wght@300;400;600&display=swap');
            body {
              background: #0A0B0E;
              color: #FFFFFF;
              font-family: 'Montserrat', sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            .certificate-border {
              width: 840px;
              height: 580px;
              padding: 6px;
              border: 4px solid #F36C00;
              border-radius: 8px;
              box-sizing: border-box;
            }
            .certificate-container {
              width: 100%;
              height: 100%;
              padding: 40px;
              border: 1px solid rgba(243, 108, 0, 0.3);
              border-radius: 4px;
              background: #11141B;
              background-image: radial-gradient(circle at center, #1b202c 0%, #11141B 70%);
              text-align: center;
              position: relative;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .logo { height: 35px; width: auto; object-fit: contain; }
            .header-text { font-family: 'Cinzel', serif; font-size: 11px; color: #F36C00; letter-spacing: 3px; font-weight: 700; text-transform: uppercase; }
            .main-content { flex-grow: 1; display: flex; flex-direction: column; justify-content: center; }
            .title { font-family: 'Cinzel', serif; font-size: 34px; color: #F36C00; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 4px; font-weight: 900; }
            .subtitle { font-size: 11px; color: #B4BAC6; text-transform: uppercase; letter-spacing: 5px; margin-bottom: 30px; }
            .award-to { font-size: 13px; font-style: italic; color: #B4BAC6; margin-bottom: 12px; }
            .student-name { font-family: 'Cinzel', serif; font-size: 30px; font-weight: 700; color: #FFFFFF; border-bottom: 2px solid #F36C00; display: inline-block; padding-bottom: 6px; margin: 0 auto 25px auto; max-width: 80%; }
            .description { font-size: 13px; color: #B4BAC6; max-width: 620px; margin: 0 auto 30px auto; line-height: 1.7; }
            .footer-info { display: flex; justify-content: space-between; align-items: flex-end; padding: 0 45px; margin-top: auto; }
            .signature-block { text-align: center; width: 180px; }
            .date-block { font-size: 13px; color: #FFFFFF; font-weight: 700; border-bottom: 1px dashed rgba(255,255,255,0.15); padding-bottom: 10px; margin-bottom: 5px; }
            .sig-img { height: 45px; width: auto; object-fit: contain; margin-bottom: 5px; }
            .sig-placeholder { font-family: 'Georgia', serif; font-style: italic; font-size: 18px; color: #FFFFFF; border-bottom: 1px dashed rgba(255,255,255,0.15); padding-bottom: 10px; margin-bottom: 5px; }
            .signature-title { font-size: 9px; color: #6B7280; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 5px; }
            .verification-code { font-family: monospace; font-size: 9px; color: #6B7280; text-align:center;  bottom: 15px; left: 45px; }
          </style>
        </head>
        <body>
          <div class="certificate-border">
            <div class="certificate-container">
              <div class="header">
                ${logoUrl ? `<img src="${logoUrl}" class="logo" />` : `<div class="header-text">BEHIND THE TRADES ACADEMY</div>`}
                <div class="header-text">CERTIFICAT OFFICIEL</div>
              </div>
              <div class="main-content">
                <div class="title">Certificat de Réussite</div>
                <div class="subtitle">Behind the Trade Academy</div>
                <div class="award-to">Ce certificat de formation est fièrement décerné à</div>
                <div class="student-name">${cert.userName}</div>
                <div class="description">
                  Pour avoir complété avec succès et validé l'ensemble des leçons théoriques, des quiz d'évaluation (avec un score minimum requis de 80%) et des devoirs pratiques du module :<br/>
                  <strong style="color: #FFFFFF; font-size: 14px;">${cert.moduleTitle}</strong>
                </div>
              </div>
              <div class="footer-info">
                <div class="signature-block">
                  <div class="date-block">${new Date(cert.completedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  <div class="signature-title">Date de réussite</div>
                </div>
                <div class="signature-block">
                  ${sigUrl ? `<img src="${sigUrl}" class="sig-img" />` : `<div class="sig-placeholder">${signerName}</div>`}
                  <div class="signature-title">${signerName}</div>
                </div>
              </div>
              <div class="verification-code">Code de vérification : ${cert.verificationCode}</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredModules = modules.filter(mod =>
    mod.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mod.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalModules = modules.length;
  const certifiedModules = modules.filter(m => m.certified).length;

  const nextUp = modules.find(m => m.progressionPct > 0 && m.progressionPct < 100) ||
    modules.find(m => m.progressionPct === 0 && m.lessonsCount > 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-5">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 border border-accent/20 rounded-full" />
          <div className="absolute inset-0 border-t border-accent rounded-full animate-spin" />
        </div>
        <span className="text-[10px] font-mono text-txt-3 uppercase tracking-widest">Chargement de l'Academy</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-loss/20 rounded-xl p-10 text-center max-w-md mx-auto my-16">
        <p className="text-sm font-bold text-loss mb-2">Erreur de chargement</p>
        <p className="text-xs text-txt-3 mb-6">Impossible de récupérer les modules.</p>
        <button onClick={() => window.location.reload()} className="btn-primary text-xs py-2 px-5">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="animate-[fadeIn_0.4s_ease-out]">

      {/* ── HEADER ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-border">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[9px] font-mono font-bold text-accent uppercase tracking-[0.35em]">BEHIND THE TRADES</span>
            <span className="w-5 h-px bg-accent/50" />
            <span className="text-[9px] font-mono font-bold text-txt-3 uppercase tracking-[0.35em]">Academy</span>
          </div>
          <h1 className="text-4xl md:text-[52px] font-black tracking-[-0.03em] leading-[0.88] text-white">
            Centre de<br />
            <span className="text-accent">Formation</span>
          </h1>
          <p className="text-txt-3 text-xs mt-4 leading-relaxed max-w-sm">
            Modules structurés et certifiants pour maîtriser les marchés financiers.
          </p>
        </div>
        <div className="w-full md:w-56">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-3" />
            <input
              type="text"
              placeholder="Rechercher un module..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border border-border hover:border-white/20 focus:border-accent/40 rounded-lg py-2.5 pl-9 pr-4 text-xs focus:outline-none transition-colors text-txt placeholder:text-txt-3"
            />
          </div>
        </div>
      </div>

      {/* ── GLOBAL PROGRESS STRIP ────────────────────────────── */}
      <div className="py-5 border-b border-border">
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-mono font-bold text-txt-3 uppercase tracking-[0.3em] shrink-0 w-28">
            Progression
          </span>
          <div className="flex-1 h-px bg-border relative">
            <div
              className="absolute top-[-0.5px] left-0 h-0.5 bg-accent transition-all duration-1000 ease-out"
              style={{ width: `${progressionGlobale}%` }}
            />
          </div>
          <span className="text-[9px] font-mono font-bold text-accent shrink-0 w-8 text-right">
            {Math.round(progressionGlobale)}%
          </span>
          <div className="shrink-0 border-l border-border pl-4">
            <span className="text-[9px] font-mono text-txt-3">
              {certifiedModules}/{totalModules} certifiés
            </span>
          </div>
        </div>
      </div>

      {/* ── MODULE LIST ──────────────────────────────────────── */}
      {filteredModules.length === 0 ? (
        <div className="py-24 text-center border-b border-border">
          <BookOpen size={28} className="text-txt-3 mx-auto mb-4" />
          <p className="text-sm font-bold text-txt-2 mb-1">Aucun module trouvé</p>
          <p className="text-xs text-txt-3">Modifiez votre recherche.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {filteredModules.map((mod) => {
            const isCompleted = mod.progressionPct === 100;
            const isInProgress = mod.progressionPct > 0 && mod.progressionPct < 100;

            return (
              <div
                key={mod.id}
                onClick={() => navigate(`/app/formation/${mod.slug}`)}
                className={`
                  relative group py-6 md:py-7 flex items-center gap-4 md:gap-7 cursor-pointer
                  transition-colors duration-150 hover:bg-white/[0.016]
                  -mx-6 px-6
                  ${isInProgress
                    ? 'border-l-2 border-accent'
                    : 'border-l-2 border-transparent'
                  }
                `}
              >
                {/* Ghosted background number */}
                <span
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-[88px] md:text-[108px] font-black font-mono leading-none select-none pointer-events-none transition-opacity duration-300 opacity-[0.025] group-hover:opacity-[0.045]"
                  aria-hidden="true"
                >
                  {String(mod.ordre).padStart(2, '0')}
                </span>

                {/* Visible module number */}
                <div className="shrink-0 w-9 text-right hidden sm:block">
                  <span className={`text-lg font-black font-mono transition-colors duration-150 ${
                    isInProgress ? 'text-accent' : isCompleted ? 'text-win/50' : 'text-txt-3'
                  }`}>
                    {String(mod.ordre).padStart(2, '0')}
                  </span>
                </div>

                {/* Cover thumbnail */}
                <div className="shrink-0 w-20 h-14 md:w-24 md:h-16 rounded-lg overflow-hidden border border-white/10 group-hover:border-accent/30 transition-colors">
                  {mod.coverImage ? (
                    <img src={mod.coverImage} alt={mod.titre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-elevated flex items-center justify-center">
                      <span className="text-sm font-black font-mono text-txt-3">
                        {String(mod.ordre).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Module info */}
                <div className="flex-1 min-w-0 relative z-10">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className={`text-sm font-bold tracking-tight transition-colors duration-150 ${
                      isInProgress
                        ? 'text-white group-hover:text-accent'
                        : 'text-white/90 group-hover:text-white'
                    }`}>
                      {mod.titre}
                    </h3>
                    {isCompleted && mod.certified && (
                      <span className="flex items-center gap-1 text-[8px] font-mono font-bold text-win border border-win/20 bg-win/5 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                        <Award size={8} />
                        Certifié
                      </span>
                    )}
                    {isCompleted && !mod.certified && (
                      <span className="flex items-center gap-1 text-[8px] font-mono font-bold text-txt-3 border border-border px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                        <CheckCircle size={8} />
                        Complété
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-txt-3 line-clamp-1 mb-3 leading-relaxed">
                    {stripEmoji(mod.description)}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-px bg-border relative">
                        <div
                          className={`absolute top-[-0.5px] left-0 h-0.5 transition-all duration-700 ${
                            isCompleted ? 'bg-win' : 'bg-accent'
                          }`}
                          style={{ width: `${mod.progressionPct}%` }}
                        />
                      </div>
                      <span className={`text-[9px] font-mono font-bold ${
                        isCompleted ? 'text-win' : isInProgress ? 'text-accent' : 'text-txt-3'
                      }`}>
                        {Math.round(mod.progressionPct)}%
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-txt-3">
                      {mod.lessonsCompleted}/{mod.lessonsCount} leçons
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <div className="shrink-0 relative z-10">
                  {mod.certified ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedCertModuleId(mod.id); }}
                        className="p-2 rounded-lg border border-win/20 text-win hover:bg-win/10 transition-colors"
                        title="Voir le certificat"
                      >
                        <Award size={13} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/app/formation/${mod.slug}`); }}
                        className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-txt-3 border border-border hover:border-white/20 hover:text-txt-2 px-4 py-2 rounded-lg transition-colors"
                      >
                        <Play size={10} /> Revoir
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/app/formation/${mod.slug}`); }}
                      className={`flex items-center gap-1.5 text-[11px] font-bold px-4 py-2 rounded-lg transition-all duration-150 ${
                        isInProgress
                          ? 'bg-accent text-white hover:bg-accent-2 shadow-[0_0_20px_rgba(243,108,0,0.18)]'
                          : 'text-txt-3 border border-border hover:border-white/20 hover:text-txt-2'
                      }`}
                    >
                      <Play size={10} fill={isInProgress ? 'currentColor' : 'none'} />
                      <span className="hidden sm:inline">
                        {mod.progressionPct > 0 ? 'Continuer' : 'Commencer'}
                      </span>
                      <ChevronRight size={12} className="sm:hidden" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── BOTTOM PANEL ─────────────────────────────────────── */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 border border-border rounded-xl overflow-hidden">
        {/* Resume learning */}
        <div className="lg:col-span-2 p-7 bg-surface border-b lg:border-b-0 lg:border-r border-border">
          <p className="text-[9px] font-mono font-bold text-txt-3 uppercase tracking-[0.32em] mb-5">
            Continuer l'apprentissage
          </p>
          {nextUp ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                <GraduationCap size={18} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm tracking-tight truncate mb-2">{nextUp.titre}</p>
                <div className="h-px w-full bg-border relative mb-1.5">
                  <div
                    className="absolute top-[-0.5px] left-0 h-0.5 bg-accent transition-all duration-700"
                    style={{ width: `${nextUp.progressionPct}%` }}
                  />
                </div>
                <p className="text-[9px] font-mono text-txt-3">
                  {Math.round(nextUp.progressionPct)}% — {nextUp.lessonsCompleted}/{nextUp.lessonsCount} leçons
                </p>
              </div>
              <button
                onClick={() => navigate(`/app/formation/${nextUp.slug}`)}
                className="shrink-0 flex items-center gap-2 text-xs font-bold text-white bg-accent hover:bg-accent-2 px-5 py-2.5 rounded-lg transition-all shadow-[0_0_18px_rgba(243,108,0,0.2)] w-full sm:w-auto justify-center"
              >
                <Play size={11} fill="currentColor" />
                Reprendre
              </button>
            </div>
          ) : (
            <p className="text-xs text-txt-3 leading-relaxed">
              Aucune formation en cours. Sélectionnez un module ci-dessus pour commencer.
            </p>
          )}
        </div>

        {/* Certifications */}
        <div
          onClick={() => certifiedModules > 0 && setIsCertListOpen(true)}
          className={`p-7 bg-surface flex flex-col justify-between gap-4 ${
            certifiedModules > 0 ? 'cursor-pointer hover:bg-elevated transition-colors' : ''
          }`}
        >
          <p className="text-[9px] font-mono font-bold text-txt-3 uppercase tracking-[0.32em]">
            Certifications
          </p>
          <div>
            <div className="text-5xl font-black font-mono leading-none mb-2">
              <span className="text-white">{certifiedModules}</span>
              <span className="text-txt-3">/{totalModules}</span>
            </div>
            <p className="text-xs text-txt-3 mb-4">modules certifiés</p>
            {certifiedModules > 0 ? (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-win">
                <Award size={11} />
                Voir mes diplômes →
              </span>
            ) : (
              <span className="text-[10px] text-txt-3 leading-relaxed">
                Complétez un module pour obtenir votre certificat.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL: Certificate list ───────────────────────────── */}
      {isCertListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
          <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto text-left">
            <button
              onClick={() => setIsCertListOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-txt-3 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X size={16} />
            </button>
            <div>
              <p className="text-[9px] font-mono font-bold text-txt-3 uppercase tracking-[0.3em] mb-1">
                Vos diplômes
              </p>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <Award className="text-win" size={18} />
                {certifiedModules} Certificat{certifiedModules > 1 ? 's' : ''} disponible{certifiedModules > 1 ? 's' : ''}
              </h3>
            </div>
            <p className="text-xs text-txt-3 leading-relaxed">
              Cliquez sur un module pour afficher et imprimer votre certificat officiel.
            </p>
            <div className="space-y-2 pt-1">
              {modules.filter(m => m.certified).map(mod => (
                <div
                  key={mod.id}
                  className="flex items-center justify-between p-4 bg-elevated border border-border hover:border-win/25 rounded-xl transition-colors cursor-pointer"
                  onClick={() => { setIsCertListOpen(false); setSelectedCertModuleId(mod.id); }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black font-mono text-txt-3 w-8 h-8 rounded-lg bg-elevated border border-border flex items-center justify-center">
                      {String(mod.ordre).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white truncate max-w-[200px]">{mod.titre}</p>
                      <p className="text-[9px] font-mono text-win uppercase tracking-wider mt-0.5">100% complété</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-bold text-white bg-win/10 hover:bg-win border border-win/20 hover:border-win px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5">
                    <Award size={11} />
                    Voir
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Certificate preview ────────────────────────── */}
      {selectedCertModuleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
          <div className="relative w-full max-w-3xl bg-surface border border-border rounded-2xl p-6 space-y-5 shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setSelectedCertModuleId(null)}
              className="absolute top-4 right-4 p-1.5 text-txt-3 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X size={16} />
            </button>

            {isCertLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="relative w-7 h-7">
                  <div className="absolute inset-0 border border-accent/20 rounded-full" />
                  <div className="absolute inset-0 border-t border-accent rounded-full animate-spin" />
                </div>
                <span className="text-[10px] font-mono text-txt-3">Génération du certificat…</span>
              </div>
            ) : certificateData ? (
              <>
                {/* Certificate preview */}
                <div className="w-full border border-accent/30 p-1 rounded-xl overflow-hidden shadow-2xl">
                  <div className="border border-white/5 rounded-lg bg-[#11141B] relative text-center p-8 space-y-5 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-accent/5 pointer-events-none" />

                    <div className="flex justify-between items-center relative z-10">
                      {settings?.certificate_logo || settings?.platform_logo ? (
                        <img src={settings?.certificate_logo || settings?.platform_logo} alt="Logo" className="h-6 w-auto object-contain" />
                      ) : (
                        <span className="text-[9px] font-mono font-bold text-accent uppercase tracking-widest">Behind The Trades Academy</span>
                      )}
                      <span className="text-[8px] font-mono text-txt-3 border border-border px-2 py-0.5 rounded uppercase tracking-wider">
                        Certificat Officiel
                      </span>
                    </div>

                    <div className="space-y-2 relative z-10">
                      <Award className="text-accent mx-auto" size={36} />
                      <h4 className="text-lg font-black uppercase text-accent tracking-widest">Certificat de Réussite</h4>
                      <p className="text-[9px] font-mono text-txt-3 uppercase tracking-widest">Behind The Trades Academy Premium</p>
                    </div>

                    <div className="space-y-1 relative z-10">
                      <span className="text-[10px] italic text-txt-3">Ce certificat est décerné à</span>
                      <h3 className="text-xl font-bold text-white tracking-tight border-b border-accent/30 pb-2 inline-block px-8">
                        {certificateData.userName}
                      </h3>
                    </div>

                    <p className="text-[11px] text-txt-3 leading-relaxed max-w-lg mx-auto relative z-10">
                      Pour avoir complété avec succès l'ensemble des leçons, quiz (≥ 80%) et devoirs de la formation :<br />
                      <strong className="text-white text-xs mt-1 inline-block">{certificateData.moduleTitle}</strong>
                    </p>

                    <div className="flex justify-between items-end pt-4 px-6 border-t border-white/5 relative z-10">
                      <div className="text-left">
                        <span className="text-[8px] font-mono text-txt-3 block uppercase tracking-wider mb-1">Date d'obtention</span>
                        <span className="text-xs text-white font-bold">
                          {new Date(certificateData.completedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="text-right flex flex-col items-center">
                        {settings?.certificate_signature_image ? (
                          <img src={settings.certificate_signature_image} alt="Signature" className="h-9 w-auto object-contain mb-1" />
                        ) : (
                          <span className="font-serif italic text-sm text-white mb-1.5">{settings?.certificate_signer_name || 'Administration'}</span>
                        )}
                        <span className="text-[8px] font-mono text-txt-3 border-t border-white/10 pt-1 w-28 text-center">
                          {settings?.certificate_signer_name || 'Administration Platform'}
                        </span>
                      </div>
                    </div>

                    <div className="text-[8px] font-mono text-txt-3 absolute bottom-3 left-5">
                      Vérification : {certificateData.verificationCode}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handlePrintCertificate(certificateData)}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-accent hover:bg-accent-2 rounded-xl transition-all shadow-[0_0_18px_rgba(243,108,0,0.25)] flex items-center gap-2"
                  >
                    <Printer size={13} />
                    Imprimer / PDF
                  </button>
                  <button
                    onClick={() => setSelectedCertModuleId(null)}
                    className="px-5 py-2.5 text-xs font-bold text-txt-3 hover:text-txt border border-border hover:border-white/20 rounded-xl transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-loss text-sm font-bold">
                Erreur de chargement du certificat.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const FormationPage: React.FC = () => {
  return (
    <FeatureGate
      feature="hasAcademy"
      fallbackTitle="Academy Behind The Trades Réservée aux Membres Pro"
      fallbackDesc="Accédez à des cours exclusifs, des masterclass sur le price action, des modules sur la psychologie du trading et des quiz pour valider vos compétences."
    >
      <FormationHub />
    </FeatureGate>
  );
};

export default FormationPage;
