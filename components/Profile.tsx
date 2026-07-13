import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/firebase';
import { Award, Briefcase, Calendar, Mail, MapPin, User, Settings, Edit3, Rocket, MessageSquare, Bell, CheckCircle2, Shield } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, profile } = useAuth();
  const [saving, setSaving] = useState(false);

  const togglePreference = async (key: string) => {
    if (!user || !profile) return;
    setSaving(true);
    try {
      const currentPrefs = profile.notificationPreferences || { emailDigest: true, pushEnabled: false, realTime: true };
      const newPrefs = { ...currentPrefs, [key]: !currentPrefs[key as keyof typeof currentPrefs] };
      await updateUserProfile(user.uid, { notificationPreferences: newPrefs });
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-3xl font-black mb-4">Connectez-vous</h2>
        <p className="text-zinc-400 max-w-md">
          Vous devez être connecté pour voir et gérer votre profil GABdev.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-green-500/20 to-transparent" />
            
            <div className="relative pt-4">
              <div className="w-32 h-32 mx-auto rounded-3xl overflow-hidden border-4 border-zinc-900 shadow-2xl transition-transform group-hover:scale-105">
                <img 
                  src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                  alt={profile.displayName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <h1 className="mt-6 text-2xl font-black tracking-tight">{profile.displayName}</h1>
              <p className="text-green-500 font-black text-xs uppercase tracking-[0.2em] mt-2">{profile.role}</p>
              
              <div className="flex justify-center gap-2 mt-4">
                {profile.badges.map(badge => (
                  <span key={badge} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-[#22c55e]">
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 space-y-4 text-left">
              <div className="flex items-center gap-4 text-zinc-400">
                <Mail className="w-4 h-4 text-green-500" />
                <span className="text-xs font-bold leading-none">{profile.email}</span>
              </div>
              <div className="flex items-center gap-4 text-zinc-400">
                <Calendar className="w-4 h-4 text-green-500" />
                <span className="text-xs font-bold leading-none">Membre depuis {new Date(profile.joinedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-4 text-zinc-400">
                <Award className="w-4 h-4 text-green-500" />
                <span className="text-xs font-bold leading-none">{profile.points} GABpoints</span>
              </div>
            </div>

            {/* Level Progress */}
            <div className="mt-8 px-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-black uppercase text-zinc-500">Progression Niveau Expert</span>
                <span className="text-[9px] font-black uppercase text-green-500">{Math.min(100, (profile.points / 1000) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-[#22c55e] transition-all duration-1000" 
                  style={{ width: `${Math.min(100, (profile.points / 1000) * 100)}%`, boxShadow: '0 0 10px rgba(34,197,94,0.3)' }} 
                />
              </div>
            </div>

            <button className="w-full mt-8 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              <Edit3 className="w-4 h-4" />
              Modifier Profil
            </button>
          </div>

          {/* Memberships */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
            <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-blue-500 mb-6 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Mes Groupes
            </h2>
            <div className="space-y-3">
              {(profile.groups && profile.groups.length > 0) ? (
                profile.groups.map(groupId => (
                  <div key={groupId} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-[10px]">
                        HUB
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-tight text-white">{groupId === 'gabdev-global' ? 'GABdev Global Hub' : groupId}</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-blue-500 opacity-60" />
                  </div>
                ))
              ) : (
                <p className="text-zinc-600 text-[10px] uppercase font-black tracking-widest text-center py-4 italic">Aucun groupe rejoint</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'PROJETS', value: '12', icon: Briefcase },
              { label: 'CONTRIBUTIONS', value: '45', icon: Edit3 },
              { label: 'RÉPUTATION', value: 'Expert', icon: Award },
              { label: 'SERVICES', value: '3', icon: MapPin },
            ].map(stat => (
              <div key={stat.label} className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl text-center group hover:border-green-500/30 transition-all">
                <stat.icon className="w-5 h-5 mx-auto text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xl font-black mb-1">{stat.value}</div>
                <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* About Section */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
            <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-green-500 mb-6">À propos de moi</h2>
            <p className="text-zinc-400 text-sm leading-relaxed font-medium">
              {profile.bio || "Aucune biographie fournie. Ce membre préfère laisser son code parler pour lui !"}
            </p>
            
            <div className="mt-8">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Compétences</h3>
              <div className="flex flex-wrap gap-2">
                {(profile.skills && profile.skills.length > 0) ? profile.skills.map(skill => (
                  <span key={skill} className="px-4 py-2 bg-zinc-800 rounded-xl text-[11px] font-bold text-zinc-300 border border-white/5">
                    {skill}
                  </span>
                )) : (
                  <span className="text-zinc-600 text-[11px] italic">Aucune compétence listée</span>
                )}
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-green-500 mb-2">Centre de Notifications</h2>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Gérez comment GABdev communique avec vous</p>
              </div>
              <Bell className="w-5 h-5 text-green-500" />
            </div>

            <div className="space-y-4">
              {[
                { 
                  id: 'realTime', 
                  label: 'Notifications en temps réel', 
                  desc: 'Recevez des alertes instantanées sur la plateforme.', 
                  active: profile.notificationPreferences?.realTime ?? true 
                },
                { 
                  id: 'pushEnabled', 
                  label: 'Notifications Push', 
                  desc: 'Recevez des notifications sur votre navigateur même fermé.', 
                  active: profile.notificationPreferences?.pushEnabled ?? false 
                },
                { 
                  id: 'emailDigest', 
                  label: 'Résumé par Email', 
                  desc: 'Recevez un résumé hebdomadaire des meilleures discussions et projets.', 
                  active: profile.notificationPreferences?.emailDigest ?? true 
                },
              ].map(pref => (
                <div key={pref.id} className="flex items-center justify-between p-6 bg-white/5 rounded-[24px] border border-white/5 hover:border-white/10 transition-all">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{pref.label}</h4>
                    <p className="text-[11px] text-zinc-500 font-medium">{pref.desc}</p>
                  </div>
                  <button 
                    onClick={() => togglePreference(pref.id)}
                    disabled={saving}
                    className={`relative w-14 h-8 transition-all rounded-full border-2 ${
                      pref.active ? 'bg-green-500 border-green-500' : 'bg-transparent border-zinc-800'
                    }`}
                  >
                    <div className={`absolute top-1 transition-all w-4 h-4 rounded-full ${
                      pref.active ? 'left-7 bg-black' : 'left-2 bg-zinc-800'
                    }`} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-green-500/5 border border-green-500/10 rounded-2xl flex items-start gap-4">
               <Shield className="w-5 h-5 text-green-500 mt-0.5" />
               <div>
                 <p className="text-[11px] font-bold text-green-400">Confidentialité garantie</p>
                 <p className="text-[10px] text-green-500/70">Vos données de notification sont chiffrées et ne sont jamais partagées avec des tiers.</p>
               </div>
            </div>
          </div>

          {/* Recent Activity Placeholder */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
            <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-green-500 mb-6">Activité Récente</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <div className="text-sm font-bold">Nouveau projet publié</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-black">Gab-E-Commerce • Il y a 2 jours</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm font-bold">Commentaire sur "Standardisation"</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-black">Forum GABdev • Il y a 1 semaine</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
