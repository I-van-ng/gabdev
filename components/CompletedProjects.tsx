import React from "react";
import { ArrowRight, Briefcase, Globe, Layers3, Sparkles, Smartphone, CreditCard, Users, Zap } from "lucide-react";
import { motion } from "motion/react";

interface CompletedProjectsProps {
  onContactClick?: () => void;
}

const CompletedProjects: React.FC<CompletedProjectsProps> = ({ onContactClick }) => {
  const SHOW_PHP_INTEGRATION = true;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section className="py-32 px-6 bg-black relative overflow-hidden" id="projets-realises">
      {/* Gradients d'ambiance */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.1),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.1),transparent_40%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Titre de section */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
            <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
              Projets & Réalisations
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-[1.05] mb-6">
            Des architectures modernes,
            <span className="gradient-title"> performantes et utiles.</span>
          </h2>

          <p className="text-zinc-400 text-lg leading-relaxed font-medium">
            Découvrez comment nous appliquons les meilleurs standards technologiques de 2026 à nos réalisations pour le Gabon et l'international.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          
          {/* Cellule 1 : Projet vedette (Spans 2 cols on Desktop) */}
          <motion.article
            variants={cardVariants}
            whileHover={{ y: -4, borderColor: "rgba(34, 197, 94, 0.3)" }}
            className="md:col-span-2 relative overflow-hidden rounded-[32px] border border-white/10 bg-zinc-900/40 p-8 md:p-10 flex flex-col justify-between transition-all duration-300 group backdrop-blur-sm"
          >
            {/* Lueur lumineuse supérieure */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-green-500 via-yellow-500 to-blue-500" />
            
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300 border border-white/5">
                  <Briefcase className="w-3.5 h-3.5 text-[#22c55e]" />
                  PIZOLUB GABON
                </span>
                <span className="rounded-full border border-[#22c55e]/20 bg-[#22c55e]/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-[#86efac]">
                  PORTAIL CORPORATE
                </span>
              </div>

              <h3 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">
                Refonte digitale Pizolub
              </h3>
              <p className="text-zinc-300 text-base leading-relaxed mb-8 max-w-xl">
                Création d'un portail web industriel moderne et ultra-rapide intégrant le catalogue des lubrifiants locaux, des formulaires sécurisés et un SEO optimisé au niveau national.
              </p>

              <div className="flex flex-wrap gap-2.5 mb-8">
                {["React 19", "Vite", "Tailwind CSS", "Motion API"].map((tag) => (
                  <span key={tag} className="px-4 py-2 rounded-xl bg-black/40 text-xs font-bold text-zinc-400 border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between border-t border-white/5 pt-6 mt-4">
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Performances LCP</p>
                <p className="text-[#22c55e] font-black text-lg flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-green-500 fill-green-500/30" /> 1.2s — Ultra rapide
                </p>
              </div>
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="inline-flex items-center gap-2.5 rounded-xl bg-zinc-800/80 px-5 py-3.5 text-xs font-black text-zinc-400 border border-white/5 cursor-not-allowed opacity-70"
              >
                Déploiement finalisé
              </button>
            </div>
          </motion.article>

          {/* Cellule 2 : Appel à l'action CTA (Spans 1 col, double hauteur de fait par le layout) */}
          <motion.aside
            variants={cardVariants}
            whileHover={{ y: -4, borderColor: "rgba(96, 165, 250, 0.3)" }}
            className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-zinc-900/60 to-black/20 p-8 flex flex-col justify-between transition-all duration-300 group backdrop-blur-sm"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                <Globe className="w-5 h-5 text-[#60a5fa]" />
              </div>
              
              <h3 className="text-2xl font-black tracking-tight text-white mb-4">
                Prêt à lancer <br />votre projet ?
              </h3>
              <p className="text-zinc-400 leading-relaxed font-medium mb-8 text-sm">
                Bénéficiez de la puissance de notre équipe pour concevoir votre site vitrine, plateforme SaaS, application mobile ou intégration de paiement localisé.
              </p>
            </div>

            <button
              onClick={onContactClick}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black px-6 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-green-500/20 active:scale-95 group"
            >
              Créer avec GABdev
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.aside>

          {/* Cellule 3 : Statistique / Impact du Hub (Spans 1 col) */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -4, borderColor: "rgba(251, 191, 36, 0.3)" }}
            className="relative overflow-hidden rounded-[32px] border border-white/10 bg-zinc-900/40 p-8 flex flex-col justify-between transition-all duration-300 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">Impact local</span>
            </div>

            <div>
              <p className="text-5xl font-black tracking-tight text-white mb-2">500+</p>
              <h4 className="text-sm font-bold text-zinc-300 mb-2">Développeurs & Hackers</h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                Membres actifs connectés sur notre communauté d'élite pour échanger et collaborer au Gabon.
              </p>
            </div>
          </motion.div>

          {/* Cellule 4 : Intégrations de Paiement Gabon (Spans 1 col) */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -4, borderColor: "rgba(96, 165, 250, 0.3)" }}
            className="relative overflow-hidden rounded-[32px] border border-white/10 bg-zinc-900/40 p-8 flex flex-col justify-between transition-all duration-300 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#60a5fa]" />
              </div>
              <span className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">Fintech</span>
            </div>

            <div>
              <p className="text-3xl font-black tracking-tight text-white mb-2">Airtel & Moov</p>
              <h4 className="text-sm font-bold text-zinc-300 mb-2">Paiements Mobile Money</h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                Intégrations fluides de passerelles locales sécurisées {SHOW_PHP_INTEGRATION ? "(SDKs PHP & JS) " : ""}pour monétiser vos projets instantanément.
              </p>
            </div>
          </motion.div>

          {/* Cellule 5 : Accessibilité (Spans 1 col) */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -4, borderColor: "rgba(34, 197, 94, 0.3)" }}
            className="relative overflow-hidden rounded-[32px] border border-white/10 bg-zinc-900/40 p-8 flex flex-col justify-between transition-all duration-300 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">WCAG 2.2</span>
            </div>

            <div>
              <p className="text-3xl font-black tracking-tight text-white mb-2">Accessible</p>
              <h4 className="text-sm font-bold text-zinc-300 mb-2">By Design</h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                Interfaces optimisées pour tous les profils d'utilisateurs, conçues dès l'origine pour une accessibilité maximale.
              </p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default CompletedProjects;
