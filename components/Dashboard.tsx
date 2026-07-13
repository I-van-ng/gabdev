import React, { useState, useEffect } from "react";
import { db } from "../services/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  QuerySnapshot,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import {
  BarChart3,
  Users,
  MessageSquare,
  Rocket,
  ShieldAlert,
  TrendingUp,
  ArrowUpRight,
  Activity,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    projects: 0,
    subscribers: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  // Check if admin
  if (profile?.role !== "admin" && user?.uid !== "dummy-admin-id") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">
          Accès Restreint
        </h2>
        <p className="text-zinc-400 max-w-md font-medium">
          Ce tableau de bord est réservé à l'administration de GABdev.
        </p>
      </div>
    );
  }

  useEffect(() => {
    // Basic stats count
    const fetchStats = async () => {
      const uSnap = await getDocs(collection(db, "users"));
      const pSnap = await getDocs(collection(db, "posts"));
      const sSnap = await getDocs(collection(db, "projects"));
      const nSnap = await getDocs(collection(db, "newsletter"));

      setStats({
        users: uSnap.size,
        posts: pSnap.size,
        projects: sSnap.size,
        subscribers: nSnap.size,
      });
    };

    fetchStats();

    // Recent users listener
    const q = query(
      collection(db, "users"),
      orderBy("joinedAt", "desc"),
      limit(5),
    );
    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot) => {
      setRecentUsers(
        snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data()),
      );
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-12 bg-zinc-900/40 p-8 rounded-[40px] border border-white/5">
        <div>
          <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1">
            Système Opérationnel
          </p>
          <p className="text-zinc-400 text-sm font-medium">
            Vue d'ensemble de la croissance de GABdev.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-zinc-500">
          <Activity className="w-4 h-4 text-green-500 animate-pulse" />
          Live Metrics
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          {
            label: "MEMBRES",
            value: stats.users,
            icon: Users,
            color: "text-blue-500",
            trend: "+12%",
          },
          {
            label: "DISCUSSIONS",
            value: stats.posts,
            icon: MessageSquare,
            color: "text-yellow-500",
            trend: "+5%",
          },
          {
            label: "PROJETS VIBRANTS",
            value: stats.projects,
            icon: Rocket,
            color: "text-green-500",
            trend: "+18%",
          },
          {
            label: "ABONNÉS",
            value: stats.subscribers,
            icon: TrendingUp,
            color: "text-purple-500",
            trend: "+22%",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-zinc-900 border border-white/5 p-8 rounded-[32px] hover:border-white/10 transition-all group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`p-4 bg-zinc-800 rounded-2xl ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-green-500 flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-lg">
                {card.trend} <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <div className="text-4xl font-black mb-2 tracking-tight">
              {card.value}
            </div>
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              {card.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Users Chart area placeholder */}
        <div className="lg:col-span-2 bg-zinc-900 border border-white/5 p-8 rounded-[40px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black tracking-tight uppercase">
              Activité des Inscriptions
            </h3>
            <BarChart3 className="w-5 h-5 text-zinc-600" />
          </div>
          <div className="h-64 flex items-end gap-3 px-4">
            {[40, 70, 45, 90, 65, 80, 55, 30, 95, 60, 75, 50].map((h, i) => (
              <div
                key={i}
                className="flex-grow bg-zinc-800 hover:bg-green-500 transition-colors rounded-t-lg"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-4 px-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
            <span>Jan</span>
            <span>Mar</span>
            <span>Mai</span>
            <span>Juil</span>
            <span>Sep</span>
            <span>Nov</span>
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="bg-zinc-900 border border-white/5 p-8 rounded-[40px]">
          <h3 className="text-xl font-black tracking-tight uppercase mb-8">
            Nouveaux Membres
          </h3>
          <div className="space-y-6">
            {recentUsers.map((u, i) => (
              <div key={i} className="flex items-center gap-4">
                <img
                  src={
                    u.photoURL ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`
                  }
                  className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-grow">
                  <div className="text-sm font-bold truncate max-w-[140px]">
                    {u.displayName}
                  </div>
                  <div className="text-[10px] text-zinc-500 uppercase font-black">
                    {u.role}
                  </div>
                </div>
                <div className="text-[10px] font-black text-zinc-600 uppercase">
                  {new Date(u.joinedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 border border-white/5 rounded-2xl text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:bg-white/5 transition-all">
            Voir tous les utilisateurs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
