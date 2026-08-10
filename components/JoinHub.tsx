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
    <section id="contact" className="py-16 sm:py-32 px-6" aria-labelledby="join-title">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="space-y-6 sm:space-y-8">
            <h2
              id="join-title"
              className="text-3xl sm:text-5xl md:text-7xl font-black mb-6 md:mb-10 leading-[0.9] tracking-tighter"
            >
              Rejoindre <br /> la communaute. <br />
              <span className="text-[#22c55e]">Simplement.</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-md font-medium">
              Pas de formulaires compliqués ni d'étapes inutiles. Rejoins directement notre groupe WhatsApp pour poser tes questions, discuter ou proposer un projet.
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="flex items-center gap-3 px-4 py-2.5 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-zinc-900/50 border border-white/5">
                <Rocket className="w-5 h-5 text-green-500" />
                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest">
                  Acces direct
                </span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2.5 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-zinc-900/50 border border-white/5">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest">
                  Sans inscription
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-3xl sm:rounded-[48px] md:rounded-[60px] blur opacity-5 transition duration-1000" />
            <div className="relative p-5 sm:p-8 md:p-12 rounded-3xl sm:rounded-[48px] md:rounded-[60px] bg-zinc-900/80 border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
              <div className="space-y-6 sm:space-y-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-black/40 border border-white/5 text-center sm:text-left">
                  <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-zinc-500" />
                  </div>
                  <div className="min-w-0 w-full">
                    <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-widest mb-1">
                      Contact direct
                    </h4>
                    <p className="text-[11px] sm:text-xs text-zinc-500 font-bold break-all">
                      ivanndoumbanguia@gmail.com
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] sm:text-[11px] font-black tracking-[0.3em] text-zinc-600 uppercase">
                    Rejoindre maintenant
                  </h3>

                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-full bg-[#22c55e] hover:bg-[#16a34a] text-black py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black tracking-wider md:tracking-widest transition-all active:scale-[0.98] uppercase flex items-center justify-center gap-3 sm:gap-4 shadow-xl shadow-green-500/10"
                  >
                    Discuter sur WhatsApp
                    <MessageCircle className="w-4 h-4 sm:w-6 sm:h-6 transform group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </a>

                  {onGoToServices && (
                    <button
                      type="button"
                      onClick={onGoToServices}
                      className="group w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black tracking-wider md:tracking-widest transition-all active:scale-[0.98] uppercase flex items-center justify-center gap-3 sm:gap-4 shadow-xl shadow-blue-500/10 cursor-pointer"
                    >
                      Demander un Devis
                      <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 transform group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </button>
                  )}

                  <a
                    href={EMAIL_URL}
                    className="group w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black tracking-wider md:tracking-widest transition-all active:scale-[0.98] uppercase flex items-center justify-center gap-3 sm:gap-4"
                  >
                    Nous écrire par e-mail
                    <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 transform group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </a>

                  <p className="text-[9px] sm:text-[10px] text-zinc-600 text-center font-bold px-2 sm:px-8 uppercase tracking-wider md:tracking-widest">
                    * Le moyen le plus simple et rapide de nous rejoindre reste WhatsApp.
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
