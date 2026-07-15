import React from "react";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, MessageCircle, Rocket } from "lucide-react";

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = (props: HeroProps) => {
  const { onStart } = props;
  const { user } = useAuth();
  const whatsappUrl = "https://whatsapp.com/channel/0029VbCflU7J3jv8ZTorRW13";

  return (
    <section className="relative pt-32 pb-24 px-6 flex flex-col items-center text-center max-w-5xl mx-auto">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
        <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" />
        <span className="text-[10px] font-black tracking-[0.25em] text-zinc-400 uppercase">
          plateforme gabonaise
        </span>
      </div>

      <h1 className="text-4xl sm:text-7xl md:text-9xl font-black mb-8 leading-[0.9] tracking-tighter">
        Batir le <span className="gradient-title">Gabon digital</span>
      </h1>

      <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mb-14 font-medium leading-relaxed">
        La plateforme des talents gabonais pour construire,
        valoriser leurs projets et accelerer l'essor du numerique au Gabon.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mb-14">
        {[
          "Valoriser des expertises de pointe",
          "Publier des projets made in Gabon",
          "Rejoindre une communaute ambitieuse",
        ].map((item) => (
          <div
            key={item}
            className="px-5 py-4 rounded-2xl bg-zinc-900/50 border border-white/5 text-sm font-bold text-zinc-300"
          >
            {item}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5">
        {!user ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-[#22c55e] hover:bg-[#16a34a] text-black px-10 py-5 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-xl shadow-green-500/20 active:scale-95"
          >
            Rejoindre la communaute
            <MessageCircle className="w-5 h-5" />
          </a>
        ) : (
          <button
            onClick={onStart}
            className="w-full sm:w-auto bg-[#22c55e] hover:bg-[#16a34a] text-black px-10 py-5 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-xl shadow-green-500/20 active:scale-95"
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
