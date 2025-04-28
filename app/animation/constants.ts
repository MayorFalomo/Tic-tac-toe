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
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
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