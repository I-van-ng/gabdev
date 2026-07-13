import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Check, Trash2, ExternalLink, X } from 'lucide-react';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 bg-zinc-900 border border-white/5 rounded-xl hover:bg-zinc-800 transition-all relative group"
        title="Notifications"
      >
        <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-green-500' : 'text-zinc-400 group-hover:text-white'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-black">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-4 w-80 md:w-96 bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-zinc-800/20">
              <h3 className="font-black text-xs uppercase tracking-widest text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllAsRead()}
                  className="text-[9px] font-black text-green-500 hover:text-green-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3 h-3" /> Tout marquer
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="w-10 h-10 text-zinc-800 mx-auto mb-4" />
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Aucune notification pour le moment</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all group/item ${!n.read ? 'bg-green-500/5' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                       <div className="flex-grow">
                          <h4 className={`text-xs font-bold mb-1 ${!n.read ? 'text-white' : 'text-zinc-400'}`}>{n.title}</h4>
                          <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">{n.message}</p>
                       </div>
                       <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => deleteNotification(n.id)}
                            className="p-1.5 bg-zinc-800 rounded-lg text-zinc-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                       </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[9px] font-black text-zinc-600 uppercase">
                        {new Date(n.createdAt?.toDate?.() || n.createdAt).toLocaleDateString()}
                      </span>
                      {!n.read && (
                        <button 
                          onClick={() => markAsRead(n.id)}
                          className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all"
                        >
                          Marquer lu
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-zinc-800/10 text-center">
               <button className="text-[9px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">
                 Toutes les notifications
               </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
