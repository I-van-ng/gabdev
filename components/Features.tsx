
import React from 'react';
import { Feature } from '../types';

const FEATURES: Feature[] = [
  {
    title: "Networking Élite",
    description: "Connectez-vous avec les meilleurs développeurs, ingénieurs et architectes cloud du pays.",
    icon: (
      <svg className="w-6 h-6 text-green-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    )
  },
  {
    title: "Hackathons Nationaux",
    description: "Participez à des compétitions de code intensives pour résoudre des défis locaux réels.",
    icon: (
      <svg className="w-6 h-6 text-green-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
    )
  },
  {
    title: "Mentorat Expert",
    description: "Bénéficiez des conseils de vétérans de l'industrie pour accélérer votre carrière technologique.",
    icon: (
      <svg className="w-6 h-6 text-green-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
    )
  }
];

const Features: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-zinc-950/50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {FEATURES.map((feature, idx) => (
          <div 
            key={idx}
            className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-green-500/30 transition-all group"
          >
            <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
            <p className="text-zinc-400 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
