
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="pt-32 pb-16 px-6 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center md:justify-start gap-4 mb-24">
          <button className="w-14 h-14 bg-zinc-900 flex items-center justify-center rounded-2xl border border-white/5 hover:border-white/10 transition-all">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2758-3.68-.2758-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6524-.2475-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0775.0105c.1202.0991.246.1971.3718.2914a.077.077 0 01-.0066.1277 12.2986 12.2986 0 01-1.8722.8923.0765.0765 0 00-.0416.1057c.3604.698.7719 1.3628 1.226 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9459 2.4189-2.1568 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>
          </button>
          <a 
            href="https://www.linkedin.com/in/ivan-ndoumba-nguia-a025053a4" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-14 h-14 bg-zinc-900 flex items-center justify-center rounded-2xl border border-white/5 hover:border-white/10 transition-all text-white"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          </a>
        </div>

        <div className="flex flex-col items-center mb-32">
          <div className="flex items-center gap-2 mb-20">
            <div className="w-10 h-10 bg-[#22c55e] rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20">
              <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m8 9-3 3 3 3m8-6 3 3-3 3m-5 3 2-12"/></svg>
            </div>
            <span className="text-3xl font-black">GAB<span className="text-[#22c55e]">dev</span></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-20 w-full">
            <div className="text-center md:text-left">
              <h5 className="text-[11px] font-black tracking-[0.25em] text-zinc-600 uppercase mb-8">CRÉATEUR</h5>
              <p className="text-zinc-400 font-bold mb-4">Ivan Ndoumba Nguia</p>
            </div>
            <div className="text-center md:text-left">
              <h5 className="text-[11px] font-black tracking-[0.25em] text-zinc-600 uppercase mb-8">CONTACT DIRECT</h5>
              <p className="text-zinc-400 font-bold mb-6">ivanndoumbanguia@gmail.com</p>
              <p className="text-2xl font-black">+241 76 36 06 49</p>
            </div>
            <div className="text-center md:text-left">
              <h5 className="text-[11px] font-black tracking-[0.25em] text-zinc-600 uppercase mb-8">LOCALISATION</h5>
              <p className="text-zinc-400 font-bold mb-4">Libreville, Gabon</p>
              <p className="text-zinc-400 font-bold">Port-Gentil, Gabon</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-10 mb-20 opacity-30">
          <a href="#" className="hover:opacity-100 transition-opacity"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
          <a href="#" className="hover:opacity-100 transition-opacity"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></a>
          <a href="https://whatsapp.com/channel/0029VbCflU7J3jv8ZTorRW13" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.767 0 1.267.405 2.436 1.096 3.39L6.5 18.5l3.294-.851c.691.385 1.472.605 2.237.605 3.181 0 5.767-2.586 5.767-5.767 0-3.181-2.586-5.767-5.767-5.767 0-3.181-2.586-5.767-5.767-5.767zm3.394 8.213c-.144.405-.84.782-1.144.826-.304.044-.68.065-1.115-.087-.275-.101-.623-.232-1.072-.435-1.912-.826-3.144-2.782-3.231-2.898-.087-.116-.739-.985-.739-1.97s.522-1.463.71-1.666c.188-.203.406-.246.536-.246s.275 0 .406.014c.13.014.304-.043.478.362.174.405.594 1.449.652 1.564.058.116.087.246 0 .405-.087.159-.145.246-.289.42-.145.174-.304.391-.435.522-.144.159-.289.333-.13.608.159.275.71 1.159 1.536 1.884.637.565 1.174.841 1.463.986.289.145.463.116.637-.087.174-.203.739-.855.942-1.145.203-.289.406-.246.681-.144.275.101 1.739.811 2.043.956.304.145.507.217.579.348.072.13.072.753-.217 1.159zM12 0C5.373 0 0 5.373 0 12c0 2.123.55 4.113 1.513 5.85L0 24l6.337-1.663C8.01 23.36 10.01 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
          </a>
        </div>

        <p className="text-[10px] font-black tracking-[0.3em] text-zinc-700 text-center uppercase">
          © 2026 GABDEV COMMUNITY • BÂTI PAR IVAN • LIBREVILLE & PORT-GENTIL
        </p>
      </div>
    </footer>
  );
};

export default Footer;
