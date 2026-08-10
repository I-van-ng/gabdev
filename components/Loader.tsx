import React from 'react';

interface LoaderProps {
  text?: string;
  fullPage?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ text, fullPage = false }) => {
  const containerClasses = fullPage
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md"
    : "flex flex-col items-center justify-center p-12 w-full";

  return (
    <div className={containerClasses}>
      <div className="loader-wrapper">
        <div className="loader-circle"></div>
        <div className="loader-circle"></div>
        <div className="loader-circle"></div>
        <div className="loader-shadow"></div>
        <div className="loader-shadow"></div>
        <div className="loader-shadow"></div>
      </div>
      {text && (
        <p className="mt-8 text-sm font-bold uppercase tracking-widest text-zinc-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;
