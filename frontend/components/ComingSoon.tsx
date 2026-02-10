'use client';

import { motion } from 'framer-motion';
import { Sparkles, Clock, Hammer, Construction } from 'lucide-react';

interface ComingSoonProps {
  featureName: string;
  description?: string;
  expectedEra?: string;
}

export default function ComingSoon({ featureName, description, expectedEra = "Era 2" }: ComingSoonProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-slate-950/20 backdrop-blur-md rounded-[3rem] border border-white/5 my-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.8,
          delay: 0.2,
          ease: [0, 0.71, 0.2, 1.01]
        }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/20 transform rotate-12">
          <Construction className="w-16 h-16 text-white" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 font-serif uppercase tracking-tight">
          {featureName} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">SẮP RA MẮT</span>
        </h1>
        
        <p className="text-slate-400 max-w-lg mx-auto text-lg mb-8 font-medium italic">
          "{description || `Công trình đang được các nghệ nhân Âu Lạc gấp rút hoàn thiện để ra mắt các chủ nhân tương lai.`}"
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
            <Clock className="w-5 h-5 text-amber-400" />
            <span className="text-slate-300 font-bold uppercase tracking-widest text-sm">Dự kiến: {expectedEra}</span>
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
            <Hammer className="w-5 h-5 text-orange-400" />
            <span className="text-slate-300 font-bold uppercase tracking-widest text-sm">Trạng thái: Đang xây dựng</span>
          </div>
        </div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="mt-16 flex gap-2">
        {[1, 2, 3].map(i => (
          <motion.div
            key={i}
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              delay: i * 0.4
            }}
            className="w-2 h-2 rounded-full bg-amber-500"
          />
        ))}
      </div>
    </div>
  );
}
