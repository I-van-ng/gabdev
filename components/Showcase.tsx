import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  serverTimestamp,
} from "firebase/firestore";
import {
  Code,
  Globe,
  Layout,
  Plus,
  Search,
  User,
} from "lucide-react";

interface Project {
  id: string;
  authorId: string;
  authorName: string;
  name: string;
  description: string;
  demoUrl: string;
  githubUrl: string;
  imageUrl: string;
  tags: string[];
  createdAt: any;
}

const Showcase: React.FC = () => {
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    demoUrl: "",
    githubUrl: "",
    tags: "",
    imageUrl: "",
  });
  const [filter, setFilter] = useState("");
  const [activeDomain, setActiveDomain] = useState("Tous");

  const domains = [
    "Tous",
    ...Array.from(
      new Set(projects.flatMap((project) => project.tags || []).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b)),
  ];

  useEffect(() => {
    const projectsQuery = query(
      collection(db, "projects"),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(projectsQuery, (snapshot: QuerySnapshot) => {
      const data = snapshot.docs.map(
        (entry: QueryDocumentSnapshot) =>
          ({ id: entry.id, ...entry.data() }) as Project,
      );
      setProjects(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newProject.name) return;

    try {
      await addDoc(collection(db, "projects"), {
        authorId: user.uid,
        authorName: profile?.displayName || user.displayName || "Hacker",
        name: newProject.name,
        description: newProject.description,
        demoUrl: newProject.demoUrl,
        githubUrl: newProject.githubUrl,
        imageUrl:
          newProject.imageUrl ||
          `https://picsum.photos/seed/${newProject.name}/800/450`,
        tags: newProject.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        createdAt: serverTimestamp(),
      });
      setNewProject({
        name: "",
        description: "",
        demoUrl: "",
        githubUrl: "",
        tags: "",
        imageUrl: "",
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesFilter =
      project.name.toLowerCase().includes(filter.toLowerCase()) ||
      project.description.toLowerCase().includes(filter.toLowerCase()) ||
      project.tags.some((tag) =>
        tag.toLowerCase().includes(filter.toLowerCase()),
      );
    const matchesDomain =
      activeDomain === "Tous" ||
      project.tags.some(
        (tag) => tag.toLowerCase() === activeDomain.toLowerCase(),
      );
    return matchesFilter && matchesDomain;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-zinc-900/40 p-8 rounded-[40px] border border-white/5">
        <div className="flex-grow max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Explorer les innovations..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-black/20 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 w-full transition-all font-medium"
            />
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-orange-500/10 active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Publier un projet
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-12 px-2">
        {domains.map((domain) => (
          <button
            key={domain}
            onClick={() => setActiveDomain(domain)}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
              activeDomain === domain
                ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20"
                : "bg-zinc-900/30 text-zinc-500 border-white/5 hover:border-white/20"
            }`}
          >
            {domain}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="mb-16 bg-zinc-900/50 border border-green-500/30 rounded-[40px] p-10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
          {!user ? (
            <div className="text-center py-4">
              <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">
                Connectez-vous pour partager votre projet
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nom du projet"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl px-6 py-4 font-bold text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
                <textarea
                  placeholder="Brève description de l'innovation..."
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
                />
                <input
                  type="text"
                  placeholder="Tags (IA, Fintech, Mobile...)"
                  value={newProject.tags}
                  onChange={(e) =>
                    setNewProject({ ...newProject, tags: e.target.value })
                  }
                  className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
              </div>
              <div className="space-y-4">
                <input
                  type="url"
                  placeholder="Lien Démo (URL)"
                  value={newProject.demoUrl}
                  onChange={(e) =>
                    setNewProject({ ...newProject, demoUrl: e.target.value })
                  }
                  className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
                <input
                  type="url"
                  placeholder="Lien GitHub (URL)"
                  value={newProject.githubUrl}
                  onChange={(e) =>
                    setNewProject({ ...newProject, githubUrl: e.target.value })
                  }
                  className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
                <input
                  type="url"
                  placeholder="URL de l'image de couverture (optionnel)"
                  value={newProject.imageUrl}
                  onChange={(e) =>
                    setNewProject({ ...newProject, imageUrl: e.target.value })
                  }
                  className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
                <button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-black py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-green-500/20 active:scale-95"
                >
                  Mettre en ligne
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <p className="font-black uppercase tracking-widest text-zinc-500">
              Chargement des projets...
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full py-20 text-center opacity-30">
            <Layout className="w-16 h-16 mx-auto mb-6" />
            <p className="font-black uppercase tracking-widest">
              {projects.length === 0
                ? "Aucun projet publié pour le moment"
                : "Aucun projet ne correspond aux filtres"}
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group bg-zinc-900/50 border border-white/5 rounded-[32px] overflow-hidden hover:border-green-500/40 transition-all duration-500 hover:-translate-y-2 flex flex-col"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={project.imageUrl}
                  alt={project.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {project.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-green-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 flex-grow flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden">
                    <User className="w-4 h-4 text-zinc-600" />
                  </div>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    Par {project.authorName}
                  </span>
                </div>

                <h3 className="text-xl font-black mb-3 group-hover:text-green-400 transition-colors uppercase tracking-tight">
                  {project.name}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
                  {project.description}
                </p>

                <div className="mt-auto grid grid-cols-2 gap-3">
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-white/5 hover:bg-[#22c55e] hover:text-black py-3 rounded-xl border border-white/10 transition-all text-xs font-black uppercase tracking-widest"
                    >
                      <Globe className="w-4 h-4" />
                      Démo
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl border border-white/5 transition-all text-xs font-black uppercase tracking-widest"
                    >
                      <Code className="w-4 h-4 text-[#22c55e]" />
                      Code
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Showcase;
