import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

const LegalPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/legal/${slug}`);
        setPage(data.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erreur lors du chargement de la page');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-8">
        <AlertCircle className="text-loss mb-4" size={48} />
        <h1 className="text-2xl font-bold mb-2">Oups !</h1>
        <p className="text-txt-2 mb-8">{error || 'Page introuvable'}</p>
        <Link to="/" className="btn-primary flex items-center gap-2">
          <ChevronLeft size={18} /> Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-txt selection:bg-accent selection:text-white">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(243,108,0,0.3)] group-hover:scale-105 transition-transform">
               <span className="font-black text-white text-xl">B</span>
            </div>
            <span className="font-black text-2xl tracking-tighter">BTrade</span>
          </Link>
          <div className="hidden md:flex items-center gap-2 text-txt-3 text-sm font-bold uppercase tracking-widest">
            <Shield size={16} />
            Espace Sécurisé
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-surface border-b border-border py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <Link to="/login" className="inline-flex items-center gap-2 text-accent font-bold text-sm mb-6 hover:translate-x-1 transition-transform">
            <ChevronLeft size={16} /> Retour à la connexion
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            {page.titre}
          </h1>
          <p className="text-txt-2 text-lg max-w-2xl leading-relaxed">
            Dernière mise à jour : {new Date(page.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="glass p-8 md:p-12 rounded-[2rem] shadow-2xl">
          <div 
            className="prose prose-invert prose-orange max-w-none 
              prose-headings:font-black prose-headings:tracking-tight
              prose-p:text-txt-2 prose-p:leading-relaxed
              prose-strong:text-txt prose-strong:font-bold
              prose-li:text-txt-2
              prose-h2:border-b prose-h2:border-border prose-h2:pb-4 prose-h2:mt-12"
            dangerouslySetInnerHTML={{ __html: page.contenu }}
          />
        </div>

        <div className="mt-12 p-8 rounded-3xl bg-accent/5 border border-accent/10 text-center">
          <h3 className="font-bold text-lg mb-2 text-accent">Des questions ?</h3>
          <p className="text-txt-2 text-sm mb-6">Notre équipe juridique est disponible pour répondre à toutes vos interrogations concernant ces documents.</p>
          <a href="mailto:support@btrade.com" className="btn-ghost inline-flex items-center gap-2">
             Nous contacter
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-txt-3 text-xs font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} BTrade. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LegalPage;
