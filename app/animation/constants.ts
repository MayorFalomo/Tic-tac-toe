export const scaleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export const FadeVariants = {
  hidden: { opacity: 0, },
  visible: { opacity: 1, },
  exit: { opacity: 0,},
};

export const scaleAndPopVariants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.7 },
  transition: {
    type: 'spring',
    mass: 0.4,
    damping: 20,
    stiffness: 100,
    
  }
};

 export const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4, //Here's the timing for the staggered effect
      },
    },
  };

  export const childVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 200, // Reduced for more bounce
        damping: 12, // Reduced for more bounce
        mass: 1.2, // Added mass for more pronounced bounce
        velocity: 2,
      },
    },
  };

export const playGameStyle = 'bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 hover:from-slate-800 hover:via-blue-800 hover:to-slate-800 border border-blue-900/30 shadow-[0_0_10px_rgba(30,58,138,0.15)] hover:shadow-[0_0_15px_rgba(30,58,138,0.25)] transition-all duration-300 text-blue-100 font-semibold text-lg backdrop-blur-sm'
export const gameInfoStyle = 'bg-gradient-to-r from-gray-900 via-emerald-900 to-gray-900 hover:from-gray-800 hover:via-emerald-800 hover:to-gray-800 border border-emerald-900/30 shadow-[0_0_10px_rgba(6,78,59,0.15)] hover:shadow-[0_0_15px_rgba(6,78,59,0.25)] transition-all duration-300 text-emerald-100 font-semibold text-lg backdrop-blur-sm'
export const settingsBtnStyle = "bg-gradient-to-r from-gray-900 via-rose-900 to-gray-900 hover:from-gray-800 hover:via-rose-800 hover:to-gray-800 border border-rose-900/30 shadow-[0_0_10px_rgba(136,19,55,0.15)] hover:shadow-[0_0_15px_rgba(136,19,55,0.25)] transition-all duration-300 text-rose-100 font-semibold text-lg backdrop-blur-sm"
export const viewPlayersStyle = "bg-gradient-to-r from-gray-900 via-cyan-900 to-gray-900 hover:from-gray-800 hover:via-cyan-800 hover:to-gray-800 border border-cyan-900/30 shadow-[0_0_10px_rgba(22,78,99,0.15)] hover:shadow-[0_0_15px_rgba(22,78,99,0.25)] transition-all duration-300 text-cyan-100 font-semibold text-lg backdrop-blur-sm"