import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Play, BookOpen, Search, Award, CheckCircle, Lock, X, Printer } from 'lucide-react';
import api from '../../../lib/api';
import { FeatureGate } from '../../../components/ui/FeatureGate';
import { CircularProgress } from '../../../components/ui/CircularProgress';
import { useSettings } from '../../../contexts/SettingsContext';

interface Module {
  id: string;
  slug: string;
  titre: string;
  description: string;
  ordre: number;
  icone: string;
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

  // Query certificate details
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
          <title>BTrade Academy - Certificat</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Montserrat:wght@400;500;700&display=swap');
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
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
            }
            .logo {
              height: 35px;
              width: auto;
              object-fit: contain;
            }
            .header-text {
              font-family: 'Cinzel', serif;
              font-size: 11px;
              color: #F36C00;
              letter-spacing: 3px;
              font-weight: 700;
              text-transform: uppercase;
            }
            .main-content {
              flex-grow: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            .title {
              font-family: 'Cinzel', serif;
              font-size: 34px;
              color: #F36C00;
              margin: 0 0 10px 0;
              text-transform: uppercase;
              letter-spacing: 4px;
              font-weight: 900;
              text-shadow: 0 0 10px rgba(243,108,0,0.15);
            }
            .subtitle {
              font-size: 11px;
              color: #B4BAC6;
              text-transform: uppercase;
              letter-spacing: 5px;
              margin-bottom: 30px;
            }
            .award-to {
              font-size: 13px;
              font-style: italic;
              color: #B4BAC6;
              margin-bottom: 12px;
            }
            .student-name {
              font-family: 'Cinzel', serif;
              font-size: 30px;
              font-weight: 700;
              color: #FFFFFF;
              border-bottom: 2px solid #F36C00;
              display: inline-block;
              padding-bottom: 6px;
              margin: 0 auto 25px auto;
              max-width: 80%;
            }
            .description {
              font-size: 13px;
              color: #B4BAC6;
              max-width: 620px;
              margin: 0 auto 30px auto;
              line-height: 1.7;
            }
            .footer-info {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              padding: 0 45px;
              margin-top: auto;
            }
            .signature-block {
              text-align: center;
              width: 180px;
            }
            .date-block {
              font-size: 13px;
              color: #FFFFFF;
              font-weight: 700;
              border-bottom: 1px dashed rgba(255,255,255,0.15);
              padding-bottom: 10px;
              margin-bottom: 5px;
            }
            .sig-img {
              height: 45px;
              width: auto;
              object-fit: contain;
              margin-bottom: 5px;
            }
            .sig-placeholder {
              font-family: 'Georgia', serif;
              font-style: italic;
              font-size: 18px;
              color: #FFFFFF;
              border-bottom: 1px dashed rgba(255,255,255,0.15);
              padding-bottom: 10px;
              margin-bottom: 5px;
            }
            .signature-title {
              font-size: 9px;
              color: #6B7280;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              margin-top: 5px;
            }
            .verification-code {
              font-family: monospace;
              font-size: 9px;
              color: #6B7280;
              position: absolute;
              bottom: 15px;
              left: 45px;
            }
          </style>
        </head>
        <body>
          <div class="certificate-border">
            <div class="certificate-container">
              <div class="header">
                ${logoUrl ? `<img src="${logoUrl}" class="logo" />` : `<div class="header-text">BTRADE ACADEMY</div>`}
                <div class="header-text">CERTIFICAT OFFICIEL</div>
              </div>
              
              <div class="main-content">
                <div class="title">Certificat de Réussite</div>
                <div class="subtitle">BTrade Academy Premium</div>
                <div class="award-to">Ce certificat de formation est fièrement décerné à</div>
                <div class="student-name">${cert.userName}</div>
                <div class="description">
                  Pour avoir complété avec succès et validé l'ensemble des leçons théoriques, des quiz d'évaluation (avec un score minimum requis de 80%) et des devoirs pratiques du module de formation :<br/>
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

  // Filter modules based on search term
  const filteredModules = modules.filter(mod =>
    mod.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mod.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute stats for certificates
  const totalModules = modules.length;
  const certifiedModules = modules.filter(m => m.certified).length;

  // Find the last active lesson/module to resume
  const nextUp = modules.find(m => m.progressionPct > 0 && m.progressionPct < 100) || 
                  modules.find(m => m.progressionPct === 0 && m.lessonsCount > 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-txt-2 text-xs font-medium">Chargement de l'Academy...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass p-8 text-center rounded-3xl border border-loss/20 max-w-md mx-auto my-10">
        <p className="text-sm font-bold text-loss mb-2">Erreur de chargement</p>
        <p className="text-xs text-txt-2 mb-4">Impossible de récupérer les modules de formation pour le moment.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary text-xs py-1.5 px-4"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold">BTrade Academy</h2>
          <p className="text-txt-2 text-sm">Le centre de formation pour devenir un trader rentable et serein.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" />
          <input 
            type="text" 
            placeholder="Rechercher un cours..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent/55 transition-all text-txt"
          />
        </div>
      </div>

      {/* Modules Grid */}
      {filteredModules.length === 0 ? (
        <div className="glass p-12 text-center rounded-3xl border border-border">
          <BookOpen size={40} className="text-txt-3 mx-auto mb-3" />
          <p className="text-sm font-bold">Aucun module trouvé</p>
          <p className="text-xs text-txt-2">Essayez de modifier vos critères de recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((mod) => {
            const isCompleted = mod.progressionPct === 100;
            return (
              <div 
                key={mod.id} 
                className="relative group rounded-3xl overflow-hidden glass-frost hover:shadow-[0_0_40px_rgba(243,108,0,0.15)] transition-all duration-500 flex flex-col justify-between transform hover:-translate-y-1"
              >
                {/* Background glow effect for premium feel */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div>
                  {/* Card Header with Icon and Progress */}
                  <div className="h-40 flex flex-col items-center justify-center relative border-b border-border/20 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
                    
                    <div className="relative flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                      <span role="img" aria-label={mod.titre}>
                        {mod.icone || '📖'}
                      </span>
                      
                      {/* Circular Progress wrapping the icon */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none scale-125 opacity-40 group-hover:opacity-100 transition-opacity">
                         <CircularProgress progress={mod.progressionPct} size={84} strokeWidth={2} progressColor="var(--accent)" trackColor="rgba(255,255,255,0.05)" />
                      </div>
                    </div>

                    {isCompleted && (
                      <div className="absolute top-4 right-4 bg-win/20 text-win border border-win/30 rounded-full p-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-scale-in" title="Module complété">
                        <CheckCircle size={14} />
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6 relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-widest px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20">
                        Module {mod.ordre}
                      </span>
                      <div className="flex items-center gap-1.5 bg-surface/50 px-2 py-1 rounded-full border border-border">
                        <BookOpen size={10} className="text-txt-3" />
                        <span className="text-[10px] font-bold text-txt-3 font-mono">
                          {mod.lessonsCompleted}/{mod.lessonsCount}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors truncate tracking-tight" title={mod.titre}>
                      {mod.titre}
                    </h3>
                    <p className="text-xs text-txt-2 line-clamp-2 mb-4 leading-relaxed font-medium">
                      {mod.description}
                    </p>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="px-6 pb-6 pt-2 relative z-10 mt-auto">
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-[10px] font-bold text-txt-3">
                      {mod.progressionPct > 0 && Math.round(mod.progressionPct) + '% complété'}
                    </div>
                    {mod.certified ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedCertModuleId(mod.id)}
                          className="px-4 py-2.5 text-xs font-bold text-win bg-win/10 hover:bg-win border border-win/20 hover:border-win hover:text-white transition-all duration-300 rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                          title="Afficher le Certificat de réussite"
                        >
                          <Award size={12} />
                          Certificat
                        </button>
                        <button 
                          onClick={() => navigate(`/app/formation/${mod.slug}`)}
                          className="px-4 py-2.5 text-xs font-bold text-white bg-white/5 hover:bg-accent border border-white/10 hover:border-accent hover:shadow-[0_0_20px_rgba(243,108,0,0.4)] transition-all duration-300 rounded-xl flex items-center gap-2 group-hover:bg-accent group-hover:border-accent"
                        >
                          <Play size={12} fill="currentColor" />
                          Revoir
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => navigate(`/app/formation/${mod.slug}`)}
                        className="px-5 py-2.5 text-xs font-bold text-white bg-white/5 hover:bg-accent border border-white/10 hover:border-accent hover:shadow-[0_0_20px_rgba(243,108,0,0.4)] transition-all duration-300 rounded-xl flex items-center gap-2 group-hover:bg-accent group-hover:border-accent"
                      >
                        <Play size={12} fill="currentColor" />
                        {mod.progressionPct > 0 ? 'Continuer' : 'Commencer'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resume learning & certifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-frost p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 rounded-full bg-accent inline-block" />
              Continuer l'apprentissage
            </h3>
            {nextUp ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-5 rounded-2xl bg-surface/40 border border-white/5 backdrop-blur-md hover:border-accent/30 transition-all duration-300 shadow-xl">
                <div className="relative w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shrink-0 overflow-hidden">
                  <div className="absolute inset-0 bg-accent/20 blur-xl" />
                  <GraduationCap size={26} className="relative z-10" />
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="text-[10px] font-bold text-accent uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded">Module actif</div>
                    <div className="text-[10px] font-mono text-txt-3">{Math.round(nextUp.progressionPct)}% complété</div>
                  </div>
                  <div className="font-bold text-base tracking-tight truncate mb-3">{nextUp.titre}</div>
                  <div className="h-1.5 w-full bg-border rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-accent to-accent-2 transition-all duration-700 ease-out relative" 
                      style={{ width: `${nextUp.progressionPct}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full animate-[glowPulse_2s_infinite]" />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/app/formation/${nextUp.slug}`)}
                  className="btn-primary py-2.5 text-xs w-full sm:w-auto mt-4 sm:mt-0 px-6 flex items-center gap-2 justify-center shadow-[0_0_15px_rgba(243,108,0,0.2)]"
                >
                  <Play size={12} fill="currentColor" />
                  Reprendre
                </button>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-txt-3 border border-dashed border-white/10 rounded-2xl bg-surface/20">
                Vous n'avez pas de formation en cours. Choisissez un module ci-dessus pour commencer !
              </div>
            )}
          </div>
        </div>

        <div 
          onClick={() => {
            if (certifiedModules > 0) setIsCertListOpen(true);
          }}
          className={`glass-frost p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-5 relative overflow-hidden transition-all duration-300 ${
            certifiedModules > 0 ? 'cursor-pointer hover:border-win/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:-translate-y-0.5' : ''
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-win/10 via-transparent to-transparent pointer-events-none" />
          <div className="w-20 h-20 rounded-2xl bg-win/10 border border-win/20 flex items-center justify-center text-win shadow-[0_0_30px_rgba(16,185,129,0.15)] relative z-10 transition-transform">
            <Award size={36} className="animate-glow-pulse" />
          </div>
          <div className="relative z-10 space-y-2">
            <h3 className="text-xl font-bold tracking-tight">Vos Certifications</h3>
            <p className="text-xs text-txt-2 leading-relaxed">Validez tous les quiz et devoirs de chaque module pour débloquer vos certificats premium.</p>
          </div>
          <div className="w-full pt-5 border-t border-white/5 relative z-10">
            <div className="bg-surface/50 border border-white/5 rounded-xl py-2 px-4 inline-block">
              <span className="text-[11px] font-bold text-win uppercase tracking-wider font-mono">
                {certifiedModules} / {totalModules} Certifiés
              </span>
            </div>
            {certifiedModules > 0 && (
              <p className="text-[10px] text-win/80 font-bold mt-2 animate-pulse">Cliquez pour voir les certificats</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal 1: List of Certificates */}
      {isCertListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
          <div className="relative w-full max-w-lg glass p-6 rounded-3xl border border-border space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto text-left">
            <button
              onClick={() => setIsCertListOpen(false)}
              className="absolute top-4 right-4 p-1 text-txt-3 hover:text-white rounded-full hover:bg-white/5"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold flex items-center gap-2">
              <Award className="text-win animate-pulse" size={20} />
              Certificats disponibles ({certifiedModules})
            </h3>
            <p className="text-xs text-txt-2">Félicitations pour vos réussites ! Cliquez sur l'un de vos modules certifiés ci-dessous pour afficher et imprimer votre diplôme officiel.</p>

            <div className="space-y-2.5 pt-2">
              {modules.filter(m => m.certified).map(mod => (
                <div 
                  key={mod.id}
                  className="flex items-center justify-between p-4 bg-surface/60 border border-border hover:border-win/30 rounded-2xl transition-all animate-[slideUp_0.2s_ease-out]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{mod.icone || '🎓'}</span>
                    <div>
                      <h4 className="text-xs font-bold text-white truncate max-w-[200px]">{mod.titre}</h4>
                      <p className="text-[9px] text-win font-bold font-mono uppercase tracking-wider mt-0.5">Complété à 100%</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsCertListOpen(false);
                      setSelectedCertModuleId(mod.id);
                    }}
                    className="px-4 py-2 text-[10px] font-bold text-white bg-win hover:bg-emerald-600 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center gap-1.5"
                  >
                    <Award size={12} />
                    Voir le certificat
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Certificate Details / Preview */}
      {selectedCertModuleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
          <div className="relative w-full max-w-3xl glass p-6 rounded-3xl border border-white/10 space-y-6 shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setSelectedCertModuleId(null)}
              className="absolute top-4 right-4 p-1 text-txt-3 hover:text-white rounded-full hover:bg-white/5"
            >
              <X size={18} />
            </button>

            {isCertLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-txt-3">Génération du certificat sécurisé...</span>
              </div>
            ) : certificateData ? (
              <>
                {/* Visual Premium Certificate Preview */}
                <div className="w-full border-2 border-accent/40 p-1.5 rounded-2xl bg-black/40 overflow-hidden shadow-2xl">
                  <div className="border border-white/5 p-8 rounded-xl bg-surface/30 relative text-center space-y-6 overflow-hidden">
                    {/* Background effects */}
                    <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-accent/5 pointer-events-none animate-[pulse_6s_infinite]" />
                    
                    {/* Logo/Header */}
                    <div className="flex justify-between items-center relative z-10">
                      {settings?.certificate_logo || settings?.platform_logo ? (
                        <img src={settings?.certificate_logo || settings?.platform_logo} alt="Logo" className="h-6 w-auto object-contain" />
                      ) : (
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">BTrade Academy</span>
                      )}
                      <span className="text-[8px] font-mono text-txt-3 border border-white/10 px-2 py-0.5 rounded uppercase tracking-wider">Certificat de Réussite</span>
                    </div>

                    <div className="space-y-2 relative z-10">
                      <Award className="text-accent mx-auto" size={40} />
                      <h4 className="text-lg font-serif font-black uppercase text-accent tracking-wide">Certificat de Réussite</h4>
                      <p className="text-[9px] text-txt-3 uppercase tracking-widest font-mono">BTrade Academy Premium</p>
                    </div>

                    <div className="space-y-1 relative z-10">
                      <span className="text-[10px] italic text-txt-2">Ce certificat est décerné avec mention à</span>
                      <br />
                      <h3 className="text-xl font-bold text-white tracking-tight border-b border-accent/40 pb-2 inline-block px-8">{certificateData.userName}</h3>
                    </div>

                    <p className="text-[11px] text-txt-2 leading-relaxed max-w-lg mx-auto relative z-10">
                      Pour avoir complété avec succès et validé l'ensemble des leçons théoriques, des quiz (score ≥ 80%) et des devoirs pratiques de la formation :<br/>
                      <strong className="text-white text-xs mt-1 inline-block">{certificateData.moduleTitle}</strong>
                    </p>

                    <div className="flex justify-between items-end pt-4 px-6 border-t border-white/5 relative z-10">
                      <div className="text-left">
                        <span className="text-[9px] text-txt-3 block font-mono">DATE D'OBTENTION</span>
                        <span className="text-xs text-white font-bold">{new Date(certificateData.completedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      
                      <div className="text-right flex flex-col items-center">
                        {settings?.certificate_signature_image ? (
                          <img src={settings.certificate_signature_image} alt="Signature" className="h-10 w-auto object-contain mb-1" />
                        ) : (
                          <span className="font-serif italic text-sm text-white mb-2">{settings?.certificate_signer_name || 'Administration'}</span>
                        )}
                        <span className="text-[8px] text-txt-3 block font-mono border-t border-white/10 pt-1 w-28 text-center">{settings?.certificate_signer_name || 'Administration Platform'}</span>
                      </div>
                    </div>

                    {/* Verification Code */}
                    <div className="text-[8px] text-txt-3 font-mono absolute bottom-3 left-4">
                      Vérification : {certificateData.verificationCode}
                    </div>
                  </div>
                </div>

                {/* Print/Download Button */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handlePrintCertificate(certificateData)}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-accent hover:bg-accent-2 rounded-xl transition-all shadow-[0_0_20px_rgba(243,108,0,0.3)] flex items-center gap-2"
                  >
                    <Printer size={14} />
                    Imprimer / Télécharger en PDF
                  </button>
                  <button
                    onClick={() => setSelectedCertModuleId(null)}
                    className="px-6 py-2.5 text-xs font-bold text-txt-2 bg-white/5 hover:bg-white/10 hover:text-white rounded-xl border border-border transition-all"
                  >
                    Fermer
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-loss font-bold">
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
      fallbackTitle="Academy BTrade Réservée aux Membres Pro"
      fallbackDesc="Accédez à des cours exclusifs, des masterclass sur le price action, des modules sur la psychologie du trading et des quiz pour valider vos compétences."
    >
      <FormationHub />
    </FeatureGate>
  );
};

export default FormationPage;
