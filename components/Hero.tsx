import React from "react";
import { useAuth } from "../context/AuthContext";
import { MessageCircle, Rocket } from "lucide-react";

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  const { user } = useAuth();
  const whatsappUrl = "https://whatsapp.com/channel/0029VbCflU7J3jv8ZTorRW13";

  return (
    <section className="relative pt-20 pb-16 sm:pt-32 sm:pb-24 px-6 flex flex-col items-center text-center max-w-5xl mx-auto">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 sm:mb-8 backdrop-blur-md">
        <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" />
        <span className="text-[10px] font-black tracking-[0.25em] text-zinc-400 uppercase">
          Prestations & Services
        </span>
      </div>

      <h1 className="text-3xl xs:text-5xl sm:text-7xl md:text-8xl font-black mb-6 sm:mb-8 leading-[0.9] tracking-tighter">
        Propulsez vos idées avec <span className="gradient-title">l'élite tech gabonaise</span>
      </h1>

      <p className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-2xl mb-8 sm:mb-14 font-medium leading-relaxed px-2">
        Création d'applications web, mobiles et designs sur-mesure pour donner vie à vos projets les plus ambitieux.
      </p>

      <div className="hidden sm:grid grid-cols-3 gap-4 w-full max-w-3xl mb-14">
        {[
          "Développement Web & Mobile",
          "Design UI/UX & Figma",
          "Identité Visuelle & Graphisme",
        ].map((item) => (
          <div
            key={item}
            className="px-5 py-4 rounded-2xl bg-zinc-900/50 border border-white/5 text-sm font-bold text-zinc-300"
          >
            {item}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4 sm:px-0">
        {!user ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-[#22c55e] hover:bg-[#16a34a] text-black px-6 py-4 sm:px-10 sm:py-5 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 transition-all shadow-xl shadow-green-500/10 active:scale-95"
          >
            Discuter sur WhatsApp
            <MessageCircle className="w-5 h-5" />
          </a>
        ) : (
          <button
            onClick={onStart}
            className="w-full sm:w-auto bg-[#22c55e] hover:bg-[#16a34a] text-black px-6 py-4 sm:px-10 sm:py-5 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 transition-all shadow-xl shadow-green-500/10 active:scale-95 cursor-pointer"
          >
            Parler avec l'IA
            <Rocket className="w-5 h-5" />
          </button>
        )}
      </div>
    </section>
  );
};

export default Hero;
