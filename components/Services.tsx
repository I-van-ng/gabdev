import React, { useState } from 'react';
import { Code, Smartphone, Palette, Layers, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tags: string[];
  color: string;
}

const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'web',
    title: 'Développement Web',
    description: 'Sites vitrines, applications SaaS et plateformes e-commerce rapides et modernes.',
    icon: <Code className="w-6 h-6 text-green-500" />,
    tags: ['React', 'Next.js', 'Node.js', 'Laravel'],
    color: 'green'
  },
  {
    id: 'mobile',
    title: 'Applications Mobiles',
    description: 'Applications iOS & Android fluides, performantes et connectées.',
    icon: <Smartphone className="w-6 h-6 text-blue-500" />,
    tags: ['Flutter', 'Dart', 'Firebase', 'API'],
    color: 'blue'
  },
  {
    id: 'design',
    title: 'Design UI/UX',
    description: 'Interfaces utilisateur intuitives et prototypes Figma interactifs.',
    icon: <Layers className="w-6 h-6 text-amber-500" />,
    tags: ['Figma', 'UI/UX', 'Wireframes', 'Design System'],
    color: 'amber'
  },
  {
    id: 'graphic',
    title: 'Identité Visuelle',
    description: 'Création de logos professionnels, chartes graphiques et visuels réseaux sociaux.',
    icon: <Palette className="w-6 h-6 text-purple-500" />,
    tags: ['Illustrator', 'Branding', 'Logos', 'Charte Graphique'],
    color: 'purple'
  }
];

const Services: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    service: 'web',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact || !formData.description) {
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

      const serviceName = formData.service === 'web' ? 'Développement Web' : formData.service === 'mobile' ? 'Applications Mobiles' : formData.service === 'design' ? 'Design UI/UX' : 'Identité Visuelle';
      const messageText = `Bonjour ! Voici les détails de ma demande de projet sur GABdev :
*Nom complet :* ${formData.name}
*Contact (Email/WhatsApp) :* ${formData.contact}
*Prestation :* ${serviceName}
*Description du besoin :* ${formData.description}`;
      
      window.open(`https://wa.me/24176360649?text=${encodeURIComponent(messageText)}`, '_blank');
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
    <div className="max-w-4xl mx-auto space-y-16">
      
      {/* Grid of Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SERVICES_DATA.map((service) => (
          <div 
            key={service.id}
            className={`p-6 rounded-[28px] bg-zinc-900/30 border border-white/5 ${getBorderColor(service.color)} transition-all duration-300 group flex flex-col`}
          >
            <div className={`w-10 h-10 ${getIconBg(service.color)} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
              {service.icon}
            </div>
            
            <h3 className="text-lg font-black text-white mb-2 tracking-tight group-hover:text-zinc-200 transition-colors">
              {service.title}
            </h3>
            
            <p className="text-zinc-400 text-xs leading-relaxed font-medium">
              {service.description}
            </p>
          </div>
        ))}
      </div>

      {/* Quote / Inquiry Section */}
      <div className="relative max-w-2xl mx-auto" id="demande-devis">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#22c55e] via-[#fbbf24] to-[#60a5fa] rounded-[36px] blur opacity-10" />
        
        <div className="relative bg-zinc-900/80 border border-white/10 rounded-[36px] p-6 md:p-10 backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[9px] font-black tracking-[0.25em] text-[#22c55e] uppercase">
              lancez votre projet au gabon
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Parlons de votre <span className="gradient-title">prochaine idée.</span>
            </h2>
            <p className="text-zinc-400 text-xs font-medium max-w-md mx-auto">
              Obtenez une proposition sur-mesure sous 24 à 48 heures.
            </p>
          </div>

          {submitted ? (
            <div className="bg-zinc-950/40 border border-green-500/20 rounded-2xl p-6 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-[#22c55e]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">Demande reçue !</h3>
              <p className="text-zinc-400 text-xs leading-relaxed max-w-sm font-medium">
                Merci pour votre intérêt. Votre demande de projet a bien été enregistrée. Je vous contacte très rapidement.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 w-full justify-center pt-2">
                <a
                  href={`https://wa.me/24176360649?text=${encodeURIComponent(
                    `Bonjour ! Voici ma demande de projet :\n*Nom complet :* ${formData.name}\n*Contact :* ${formData.contact}\n*Prestation :* ${formData.service === 'web' ? 'Développement Web' : formData.service === 'mobile' ? 'Applications Mobiles' : formData.service === 'design' ? 'Design UI/UX' : 'Identité Visuelle'}\n*Description :* ${formData.description}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#22c55e] hover:bg-[#16a34a] text-black px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  Envoyer via WhatsApp
                </a>
                <a
                  href={`mailto:ivanndoumbanguia@gmail.com?subject=Demande%20Projet%20GABdev%20-%20${encodeURIComponent(formData.name)}&body=Bonjour%20Ivan,%0D%0A%0D%0AJ'ai%20soumis%20une%20demande%20pour%20le%20service%20${encodeURIComponent(formData.service)}%20sur%20GABdev.%0D%0A%0D%0A*Description%20du%20projet:*%0D%0A${encodeURIComponent(formData.description)}%0D%0A%0D%0AContact:%20${encodeURIComponent(formData.contact)}%0D%0A%0D%0AÀ%20bientôt!`}
                  className="bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border border-white/10 flex items-center justify-center gap-1.5"
                >
                  Envoyer par Email
                </a>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border border-white/10"
                >
                  Nouvelle demande
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Nom Complet *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Ivan Ndoumba"
                    required
                    className="w-full bg-zinc-950/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Email ou WhatsApp *</label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    placeholder="Ex: email@adresse.com ou +241..."
                    required
                    className="w-full bg-zinc-950/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Type de Prestation</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full bg-zinc-950/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all appearance-none"
                >
                  <option value="web">Développement Web</option>
                  <option value="mobile">Applications Mobiles</option>
                  <option value="design">Design UI/UX (Figma)</option>
                  <option value="graphic">Identité Visuelle</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Description du besoin *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  placeholder="Décrivez votre besoin, les fonctionnalités souhaitées, les objectifs..."
                  required
                  rows={4}
                  onChange={handleChange}
                  className="w-full bg-zinc-950/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-zinc-800 text-black disabled:text-zinc-600 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-green-500/10 cursor-pointer"
              >
                {loading ? (
                  <>Envoi en cours...</>
                ) : (
                  <>
                    Envoyer la demande
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;
