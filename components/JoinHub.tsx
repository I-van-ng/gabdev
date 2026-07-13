import React from "react";
import {
  ArrowRight,
  Mail,
  MessageCircle,
  Rocket,
  ShieldCheck,
} from "lucide-react";

const WHATSAPP_URL = "https://whatsapp.com/channel/0029VbCflU7J3jv8ZTorRW13";
const EMAIL_URL =
  "mailto:ivanndoumbanguia@gmail.com?subject=Rejoindre%20la%20communaute%20GABdev";

interface JoinHubProps {
  onGoToServices?: () => void;
}

const JoinHub: React.FC<JoinHubProps> = ({ onGoToServices }) => {
  return (
    <section id="contact" className="py-32 px-6" aria-labelledby="join-title">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2
              id="join-title"
              className="text-6xl md:text-8xl font-black mb-10 leading-[0.9] tracking-tighter"
            >
              Rejoindre <br /> la communaute. <br />
              <span className="text-[#22c55e]">Simplement.</span>
            </h2>
            <p className="text-xl text-zinc-400 max-w-md font-medium">
              Pas de parcours complique. Si GABdev te parle, tu peux rejoindre
              la communaute directement via WhatsApp et entrer en contact avec
              nous en quelques secondes.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                <Rocket className="w-5 h-5 text-green-500" />
                <span className="text-sm font-bold text-white uppercase tracking-widest">
                  Acces direct
                </span>
              </div>
              <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-bold text-white uppercase tracking-widest">
                  Sans inscription
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-[60px] blur opacity-20 transition duration-1000" />
            <div className="relative p-12 md:p-16 rounded-[60px] bg-zinc-900/80 border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
              <div className="space-y-10">
                <div className="flex items-start gap-6 p-8 rounded-3xl bg-black/40 border border-white/5">
                  <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-zinc-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">
                      Contact direct
                    </h4>
                    <p className="text-xs text-zinc-500 font-bold">
                      ivanndoumbanguia@gmail.com
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[11px] font-black tracking-[0.3em] text-zinc-600 uppercase">
                    Rejoindre maintenant
                  </h3>

                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-full bg-[#22c55e] hover:bg-[#16a34a] text-black py-6 rounded-[24px] text-lg font-black tracking-widest transition-all active:scale-[0.98] uppercase flex items-center justify-center gap-4 shadow-xl shadow-green-500/10"
                  >
                    Rejoindre via WhatsApp
                    <MessageCircle className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
                  </a>

                  {onGoToServices && (
                    <button
                      type="button"
                      onClick={onGoToServices}
                      className="group w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-[24px] text-lg font-black tracking-widest transition-all active:scale-[0.98] uppercase flex items-center justify-center gap-4 shadow-xl shadow-blue-500/10 cursor-pointer"
                    >
                      Demander un Devis / Projet
                      <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}

                  <a
                    href={EMAIL_URL}
                    className="group w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-6 rounded-[24px] text-lg font-black tracking-widest transition-all active:scale-[0.98] uppercase flex items-center justify-center gap-4"
                  >
                    Ecrire par email
                    <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
                  </a>

                  <p className="text-[10px] text-zinc-600 text-center font-bold px-8 uppercase tracking-widest">
                    * Le moyen le plus rapide pour entrer dans la communaute est
                    le groupe WhatsApp GABdev.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinHub;
