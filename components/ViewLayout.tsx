import React from "react";
import { motion } from "motion/react";

interface ViewLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  accentColor?: string; // e.g., 'green' | 'blue' | 'purple'
  icon?: React.ReactNode;
}

const ViewLayout: React.FC<ViewLayoutProps> = (props: ViewLayoutProps) => {
  const { children, title, subtitle, accentColor = "green", icon } = props;
  const getGlowColor = () => {
    switch (accentColor) {
      case "blue":
        return "from-blue-500/10";
      case "purple":
        return "from-purple-500/10";
      case "orange":
        return "from-orange-500/10";
      default:
        return "from-green-500/10";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="min-h-screen pt-12 pb-32 relative overflow-hidden bg-black"
    >
      {/* Dynamic Background Accents */}
      <div
        className={`absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br ${getGlowColor()} to-transparent blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none`}
      />
      <div
        className={`absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr ${getGlowColor()} to-transparent blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none`}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            {icon && (
              <div
                className={`p-2 rounded-xl bg-${accentColor}-500/10 border border-${accentColor}-500/20`}
              >
                {icon}
              </div>
            )}
            <span
              className={`text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500`}
            >
              HUB GABDEV / {title}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-[0.9]">
            {title.split(" ").map((word: string, i: number) => (
              <span
                key={i}
                className={i % 2 !== 0 ? `text-${accentColor}-500` : ""}
              >
                {word}{" "}
              </span>
            ))}
          </h1>

          {subtitle && (
            <p className="mt-6 text-zinc-400 max-w-2xl text-lg font-medium leading-relaxed">
              {subtitle}
            </p>
          )}
        </header>

        <main>{children}</main>
      </div>
    </motion.div>
  );
};

export default ViewLayout;
