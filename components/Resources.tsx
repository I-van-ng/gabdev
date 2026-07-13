import React, { useEffect, useMemo, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from "firebase/firestore";

interface ResourceRecord {
  id: string;
  category: string;
  title: string;
  description: string;
  author: string;
  level: string;
  readTime: string;
  tags: string[];
}

const Resources: React.FC = () => {
  const [resources, setResources] = useState<ResourceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("TOUS");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    const resourcesQuery = query(collection(db, "resources"), orderBy("title"));
    const unsubscribe = onSnapshot(resourcesQuery, (snapshot: QuerySnapshot) => {
      const data = snapshot.docs.map(
        (entry: QueryDocumentSnapshot) =>
          ({ id: entry.id, ...entry.data() }) as ResourceRecord,
      );
      setResources(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const categories = useMemo(
    () => [
      "TOUS",
      ...Array.from(
        new Set(
          resources
            .map((resource) => resource.category?.trim())
            .filter((category): category is string => Boolean(category)),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    ],
    [resources],
  );

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesCategory =
        activeCategory === "TOUS" || resource.category === activeCategory;
      const matchesSearch =
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, resources, searchQuery]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((bookmark) => bookmark !== id) : [...prev, id],
    );
  };

  return (
    <section id="resources" className="py-32 px-6 bg-[#030303]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight opacity-90">
            Outils & Savoirs
          </h2>
          <p className="text-zinc-500 font-medium text-lg">
            La base de connaissance partagee par la communaute.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-12 relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-zinc-600 group-focus-within:text-[#3b82f6] transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher un tutoriel, un tag ou un outil..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/30 border border-white/5 rounded-2xl py-5 pl-16 pr-6 text-lg font-bold focus:outline-none focus:border-[#3b82f6]/50 transition-all placeholder:text-zinc-700 backdrop-blur-sm"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-20">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all border ${
                activeCategory === category
                  ? "bg-[#3b82f6] text-white border-[#3b82f6] shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                  : "bg-zinc-900/30 text-zinc-500 hover:text-white border-white/5"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <div className="text-zinc-700 text-lg font-bold mb-4">
                Chargement des ressources...
              </div>
            </div>
          ) : filteredResources.length > 0 ? (
            filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="group p-8 rounded-[40px] bg-zinc-900/20 border border-white/5 hover:border-white/20 transition-all flex flex-col h-full card-shadow relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-black text-[#3b82f6] tracking-tighter bg-[#3b82f6]/10 px-2 py-1 rounded-md uppercase">
                    {resource.level}
                  </span>
                </div>

                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black tracking-[0.2em] text-zinc-600 uppercase mb-1">
                      {resource.category}
                    </span>
                    <span className="text-[9px] text-zinc-700 font-bold uppercase">
                      {resource.readTime}
                    </span>
                  </div>
                </div>

                <h3 className="text-2xl font-black mb-4 flex-grow leading-[1.1] tracking-tight group-hover:text-white transition-colors">
                  {resource.title}
                </h3>

                <p className="text-zinc-500 text-sm font-medium mb-8 leading-relaxed line-clamp-2">
                  {resource.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {resource.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold px-3 py-1 bg-white/5 rounded-full text-zinc-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                  <button className="flex items-center gap-3 text-[11px] font-black tracking-widest text-[#3b82f6] hover:gap-4 transition-all uppercase">
                    Lire la suite
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => toggleBookmark(resource.id)}
                    className={`p-3 rounded-xl transition-all ${
                      bookmarks.includes(resource.id)
                        ? "bg-blue-500/20 text-blue-500"
                        : "bg-zinc-800/50 text-zinc-600 hover:text-zinc-400"
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 ${
                        bookmarks.includes(resource.id) ? "fill-current" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="text-zinc-700 text-lg font-bold mb-4">
                {resources.length === 0
                  ? "Aucune ressource publiee pour le moment."
                  : "Aucun resultat pour cette recherche."}
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("TOUS");
                }}
                className="text-[#3b82f6] font-black text-sm tracking-widest uppercase hover:underline"
              >
                Reinitialiser les filtres
              </button>
            </div>
          )}
        </div>

        <div className="mt-24 p-12 rounded-[50px] border border-dashed border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-zinc-900/20 to-transparent">
          <div>
            <h4 className="text-2xl font-black mb-2">
              Vous avez un savoir a partager ?
            </h4>
            <p className="text-zinc-500 font-medium">
              Contribuez a la bibliotheque GABdev et aidez la communaute.
            </p>
          </div>
          <button className="whitespace-nowrap bg-white text-black px-8 py-4 rounded-2xl font-black tracking-widest text-xs hover:bg-[#3b82f6] hover:text-white transition-all uppercase">
            Soumettre un outil
          </button>
        </div>
      </div>
    </section>
  );
};

export default Resources;
