import React, { useState } from "react";
import {
  GraduationCap,
  Sparkles,
  MessageCircle,
  Lightbulb,
  Send,
  CheckCircle2,
  Clock,
  ArrowRight,
  Code2,
  Smartphone,
  Layers,
  Cpu,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const Resources: React.FC = () => {
  const [topicSuggestion, setTopicSuggestion] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const whatsappChannelUrl = "https://whatsapp.com/channel/0029VbCflU7J3jv8ZTorRW13";

  const handleSuggest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicSuggestion.trim()) return;

    const message = `Bonjour Ivan ! Voici une idée de formation / tutoriel que j'aimerais voir sur GABdev : "${topicSuggestion.trim()}"`;
    window.open(`https://wa.me/24176360649?text=${encodeURIComponent(message)}`, "_blank");

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTopicSuggestion("");
    }, 3000);
  };

  const plannedThemes = [
    {
      title: "Développement Web Moderne",
      description: "Architecture React 19, TypeScript et APIs robustes adaptées au continent.",
      icon: Code2,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      title: "Applications Mobiles Flutter",
      description: "Conception d'applications iOS & Android cross-platform connectées à Firebase.",
      icon: Smartphone,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Design UI/UX & Prototypage",
      description: "Maîtriser Figma, les systèmes de design réutilisables et l'ergonomie mobile-first.",
      icon: Layers,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Paiements Mobiles & Fintech Locale",
      description: "Intégration pas-à-pas des flux de paiement Airtel Money et Moov Money au Gabon.",
      icon: Cpu,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
  ];

  return (
    <section id="resources" className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Badge En-tête */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black tracking-widest uppercase mb-4">
          <Clock className="w-3.5 h-3.5 animate-spin" />
          En cours d'élaboration
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6">
          Formations & Tutoriels
        </h1>

        <p className="text-zinc-400 text-sm sm:text-base md:text-lg leading-relaxed">
          Nous concevons actuellement des programmes d'apprentissage pratiques et des parcours guidés pour vous aider à monter en compétences sur les technologies les plus demandées.
        </p>
      </div>

      {/* Carte Annonce Principale */}
      <div className="relative mb-16">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-green-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-50" />
        <div className="relative bg-zinc-900/80 border border-white/10 rounded-3xl p-8 sm:p-12 backdrop-blur-xl">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 text-green-400 text-xs font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Cursus Pratiques & Pédagogie Active
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-4 leading-snug">
              Des formations pensées pour les réalités du terrain au Gabon
            </h2>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-8">
              Chaque module sera axé sur la pratique avec des projets réels : intégration des flux de paiements locaux, déploiement d'applications cloud légères et conception d'interfaces optimisées.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href={whatsappChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#22c55e] hover:bg-[#16a34a] text-black px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-green-500/20 active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                Être informé sur WhatsApp dès le lancement
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Thématiques en préparation */}
      <div className="mb-20">
        <div className="text-center mb-10">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
            Aperçu des programmes
          </h3>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Thématiques en préparation
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {plannedThemes.map((theme) => {
            const Icon = theme.icon;
            return (
              <div
                key={theme.title}
                className="bg-zinc-900/40 border border-white/5 hover:border-white/10 rounded-3xl p-6 sm:p-8 transition-all flex items-start gap-5"
              >
                <div className={`p-4 rounded-2xl ${theme.bgColor} ${theme.borderColor} border flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${theme.color}`} />
                </div>
                <div>
                  <h4 className="text-base font-black text-white mb-2">
                    {theme.title}
                  </h4>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    {theme.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Boîte à idées interactive : Suggérer un thème */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto">
        <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lightbulb className="w-6 h-6 text-amber-400" />
        </div>

        <h3 className="text-2xl font-black text-white mb-3">
          Une idée de formation ou un besoin spécifique ?
        </h3>

        <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto mb-8">
          Dites-nous ce que vous aimeriez apprendre en priorité. Vos retours guident directement la création de nos prochains tutoriels et ateliers.
        </p>

        {submitted ? (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl inline-flex items-center gap-2 text-green-400 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            Merci ! Votre suggestion a été transmise avec succès.
          </div>
        ) : (
          <form onSubmit={handleSuggest} className="flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto">
            <input
              type="text"
              required
              placeholder="Ex: Architecture micro-services, Next.js 15, API Airtel..."
              value={topicSuggestion}
              onChange={(e) => setTopicSuggestion(e.target.value)}
              className="w-full bg-zinc-800/80 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all whitespace-nowrap cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              Suggérer
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Resources;
