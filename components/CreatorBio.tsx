import React from "react";

interface CreatorBioProps {
  onContactClick?: () => void;
}

const CreatorBio: React.FC<CreatorBioProps> = ({ onContactClick }) => {
  const landscapeBg =
    "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2000&auto=format&fit=crop";

  return (
    <section className="py-24 px-6 bg-black relative overflow-hidden" id="ivan-bio">
      <div
        className="absolute inset-0 z-0 opacity-10 grayscale-[0.8]"
        style={{
          backgroundImage: `url(${landscapeBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
        <div className="w-full md:w-5/12 flex justify-center">
          <div className="relative group w-full max-w-sm">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#22c55e] via-[#fbbf24] to-[#60a5fa] rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

            <div className="relative bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/10 aspect-[4/5] shadow-2xl flex flex-col items-center justify-center p-12">
              <div className="w-32 h-32 bg-[#22c55e] rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.3)] transform transition-transform duration-500">
                <svg
                  className="w-20 h-20 text-black"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 9L5 12L8 15" />
                  <path d="M16 9L19 12L16 15" />
                  <path d="M11 18L13 6" />
                </svg>
              </div>

              <div className="mt-10 text-center">
                <span className="text-4xl font-black tracking-tighter text-white">
                  GAB<span className="text-[#22c55e]">dev</span>
                </span>
              </div>

              <div className="absolute bottom-8 left-8">
                <p className="text-white font-black text-2xl tracking-tight">
                  Ivan Ndoumba Nguia
                </p>
                <p className="text-[#22c55e] text-xs font-bold tracking-[0.2em] uppercase mt-1">
                  Fondateur
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-7/12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
            <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
              Vision du fondateur
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-8 leading-[1.1] tracking-tighter text-white">
            Une vision pour le <br />
            <span className="text-[#22c55e]">Gabon digital.</span>
          </h2>

          <blockquote className="space-y-6 text-zinc-300 text-lg leading-relaxed font-medium italic mb-10 border-l-4 border-[#22c55e]/30 pl-6">
            <p>
              Gabdev est une communaute gabonaise d'innovation numerique dont la
              vision est de batir un ecosysteme technologique fort, souverain et
              creatif, capable de resoudre les defis du pays grace a
              l'intelligence collective.
            </p>
          </blockquote>

          <div className="flex flex-wrap gap-4">
            <a
              href="https://www.linkedin.com/in/ivan-ndoumba-nguia-a025053a4"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-4 bg-zinc-900 border border-white/10 rounded-2xl text-xs font-bold hover:bg-zinc-800 transition-all text-white"
            >
              <svg
                className="w-5 h-5 text-[#0077b5]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              LinkedIn Profil
            </a>
            <button
              onClick={onContactClick}
              className="flex items-center gap-3 px-6 py-4 bg-zinc-900/50 border border-white/5 rounded-2xl text-xs font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
            >
              <svg
                className="w-5 h-5 text-[#22c55e]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Direct
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreatorBio;
