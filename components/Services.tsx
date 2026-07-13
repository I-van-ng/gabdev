import React, { useState } from 'react';
import { Briefcase, Code, Smartphone, Palette, Layers, Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tags: string[];
  color: string;
}

const SHOW_PHP = true;

const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'web',
    title: 'Développement Web Full Stack',
    description: 'Conception et réalisation de sites vitrines haut de gamme, applications SaaS sur-mesure, plateformes e-commerce rapides et tableaux de bord d\'administration robustes.',
    icon: <Code className="w-6 h-6 text-green-500" />,
    tags: ['React', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS', 'Firebase', ...(SHOW_PHP ? ['PHP', 'Laravel'] : [])],
    color: 'green'
  },
  {
    id: 'mobile',
    title: 'Applications Mobiles Cross-Platform',
    description: 'Développement d\'applications mobiles performantes, fluides et esthétiques pour iOS et Android avec une base de code unifiée et une intégration API optimale.',
    icon: <Smartphone className="w-6 h-6 text-blue-500" />,
    tags: ['Flutter', 'Dart', 'Firebase', 'API REST', 'Push Notifications'],
    color: 'blue'
  },
  {
    id: 'design',
    title: 'Design UI/UX & Prototypage Figma',
    description: 'Création d\'interfaces utilisateur modernes, intuitives et adaptées aux besoins de vos clients. Conception de wireframes, maquettes haute fidélité et prototypes interactifs.',
    icon: <Layers className="w-6 h-6 text-amber-500" />,
    tags: ['Figma', 'UI Design', 'UX Research', 'Prototypage', 'Design System'],
    color: 'amber'
  },
  {
    id: 'graphic',
    title: 'Infographie & Identité Visuelle',
    description: 'Création de votre univers de marque unique : logos professionnels, chartes graphiques complètes, affiches publicitaires, visuels réseaux sociaux et supports de communication.',
    icon: <Palette className="w-6 h-6 text-purple-500" />,
    tags: ['Illustrator', 'Photoshop', 'Branding', 'Vectoriel', 'Affiches'],
    color: 'purple'
  }
];

const Services: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    service: 'web',
    description: '',
    budget: '500k-1.5M'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.description) {
      setError('Veuillez remplir tous les champs obligatoires (*)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/services/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Une erreur est survenue lors de la soumission.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Impossible d\'envoyer votre demande actuellement.');
    } finally {
      setLoading(false);
    }
  };

  const getBorderColor = (color: string) => {
    switch (color) {
      case 'blue': return 'hover:border-blue-500/30';
      case 'amber': return 'hover:border-amber-500/30';
      case 'purple': return 'hover:border-purple-500/30';
      default: return 'hover:border-green-500/30';
    }
  };

  const getIconBg = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500/10';
      case 'amber': return 'bg-amber-500/10';
      case 'purple': return 'bg-purple-500/10';
      default: return 'bg-green-500/10';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16">
      
      {/* Grid of Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {SERVICES_DATA.map((service) => (
          <div 
            key={service.id}
            className={`p-8 rounded-[36px] bg-zinc-900/40 border border-white/5 ${getBorderColor(service.color)} transition-all duration-300 group flex flex-col justify-between`}
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 ${getIconBg(service.color)} rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  {service.icon}
                </div>
                <span className="text-[9px] font-black tracking-[0.2em] text-zinc-500 uppercase">
                  Service disponible
                </span>
              </div>
              
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight group-hover:text-zinc-200 transition-colors">
                {service.title}
              </h3>
              
              <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-medium">
                {service.description}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
              {service.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-bold px-3 py-1 bg-zinc-950/50 rounded-lg text-zinc-400 border border-white/5">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quote / Inquiry Section */}
      <div className="relative" id="demande-devis">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#22c55e] via-[#fbbf24] to-[#60a5fa] rounded-[48px] blur opacity-10" />
        
        <div className="relative bg-zinc-900/80 border border-white/10 rounded-[48px] p-8 md:p-16 backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Info Side */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[10px] font-black tracking-[0.25em] text-[#22c55e] uppercase">
                lancez votre projet au gabon
              </span>
              
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-[0.9]">
                Parlons de votre <br />
                <span className="gradient-title">prochaine idée.</span>
              </h2>
              
              <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                Vous avez besoin d'un site web, d'une application mobile, d'un design professionnel ou d'une refonte graphique complète ?
                Remplissez ce formulaire et obtenez une proposition sur-mesure adaptée à vos besoins et à votre budget.
              </p>
              
              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Développement Local & Réactif</h4>
                    <p className="text-[11px] text-zinc-500">Développeur basé au Gabon pour un suivi et un accompagnement de proximité.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Devis Rapide & Clair</h4>
                    <p className="text-[11px] text-zinc-500">Estimation transparente sous 24 à 48 heures ouvrées.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Side */}
            <div className="lg:col-span-7">
              {submitted ? (
                <div className="h-full bg-zinc-950/40 border border-green-500/20 rounded-[32px] p-8 md:p-12 text-center flex flex-col items-center justify-center space-y-6">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-[#22c55e] mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-white">Demande reçue !</h3>
                  <p className="text-zinc-400 text-sm max-w-md leading-relaxed font-medium">
                    Merci pour votre intérêt. Votre demande de projet a bien été enregistrée. Je l'étudie personnellement avec la plus grande attention.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
                    <a
                      href={`mailto:ivanndoumbanguia@gmail.com?subject=Demande%20Projet%20GABdev%20-%20${encodeURIComponent(formData.name)}&body=Bonjour%20Ivan,%0D%0A%0D%0AJ'ai%20soumis%20une%20demande%20pour%20le%20service%20${encodeURIComponent(formData.service)}%20sur%20GABdev.%0D%0A%0D%0A*Description%20du%20projet:*%0D%0A${encodeURIComponent(formData.description)}%0D%0A%0D%0A*Budget%20estimé:*%0D%0A${encodeURIComponent(formData.budget)}%20CFA%0D%0A%0D%0AEmail%20de%20contact:%20${encodeURIComponent(formData.email)}%0D%0AWhatsApp:%20${encodeURIComponent(formData.whatsapp)}%0D%0A%0D%0AÀ%20bientôt!`}
                      className="bg-[#22c55e] hover:bg-[#16a34a] text-black px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      Confirmer par Email
                    </a>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/10"
                    >
                      Nouvelle demande
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3 text-xs font-semibold">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Votre Nom *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ex: Ivan Ndoumba"
                        required
                        className="w-full bg-zinc-950/40 border border-white/5 rounded-2xl px-5 py-4 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/30 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Adresse Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Ex: ivan@gabdev.com"
                        required
                        className="w-full bg-zinc-950/40 border border-white/5 rounded-2xl px-5 py-4 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/30 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Type de Prestation</label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full bg-zinc-950/40 border border-white/5 rounded-2xl px-5 py-4 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all appearance-none"
                      >
                        <option value="web">Développement Web Full Stack</option>
                        <option value="mobile">Applications Mobiles iOS & Android</option>
                        <option value="design">Design UI/UX (Figma)</option>
                        <option value="graphic">Infographie & Branding</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Numéro WhatsApp (Optionnel)</label>
                      <input
                        type="text"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        placeholder="Ex: +241 077 77 77 77"
                        className="w-full bg-zinc-950/40 border border-white/5 rounded-2xl px-5 py-4 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/30 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Budget Estimé (FCFA)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Moins de 500k', value: 'under-500k' },
                        { label: '500k à 1.5M', value: '500k-1.5M' },
                        { label: '1.5M à 3M', value: '1.5M-3M' },
                        { label: 'Plus de 3M', value: 'over-3M' }
                      ].map((budgetOption) => (
                        <button
                          key={budgetOption.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, budget: budgetOption.value })}
                          className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                            formData.budget === budgetOption.value
                              ? 'bg-[#22c55e] text-black border-[#22c55e] shadow-lg shadow-green-500/10'
                              : 'bg-zinc-950/20 text-zinc-400 border-white/5 hover:border-white/20'
                          }`}
                        >
                          {budgetOption.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Description de votre Projet *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Décrivez votre besoin, les fonctionnalités souhaitées, les objectifs de votre plateforme..."
                      required
                      rows={5}
                      className="w-full bg-zinc-950/40 border border-white/5 rounded-2xl px-5 py-4 text-xs font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/30 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-zinc-800 text-black disabled:text-zinc-600 py-5 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-green-500/10"
                  >
                    {loading ? (
                      <>Envoi en cours...</>
                    ) : (
                      <>
                        Envoyer la demande
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default Services;
