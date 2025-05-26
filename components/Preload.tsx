import FadeIn from '@/app/animation/FadeIn';
import { useTheme } from '@/contexts/ThemeContext';
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import DrawLine from '@/app/animation/DrawLine';

const Preload = () => {
  const { currentTheme } = useTheme();
  const [start, setStart] = useState(false);

  return (
    <FadeIn>
      <div className={`relative h-screen w-screen bg-black `}>
        <div className="h-full flex items-center justify-center ">
          <div className="flex flex-col items-center">
            <motion.h1
              className=" text-center text-[70px] max-[900px]:text-[60px] max-[500px]:text-[45px] font-fasterOne text-white"
              style={{
                textShadow:
                  '0 0 10px rgba(255,165,0,0.7), 0 0 20px rgba(255,140,0,0.5), 0 0 30px rgba(255,69,0,0.3), 0 0 40px #ff8c00, 0 0 30px #ffa500, 0 0 40px #ff4500',
                letterSpacing: '5px',
              }}
              // initial={{ opacity: 0, y: -50 }}
              animate={{
                opacity: 1,
                // y: 0,
                textShadow: [
                  '0 0 10px rgba(255,165,0,0.7), 0 0 20px rgba(255,140,0,0.5), 0 0 30px rgba(255,69,0,0.3), 0 0 40px #ff8c00, 0 0 30px #ffa500, 0 0 40px #ff4500',
                  // '0 0 0px rgba(255,165,0,0.7), 0 0 20px rgba(255,140,0,0.5), 0 0 30px rgba(255,69,0,0.3), 0 0 40px #ff8c00, 0 0 70px #ffa500, 0 0 80px #ff4500',
                  '0 0 0px rgba(255,165,0,0.8), 0 0 25px rgba(255,140,0,0.6), 0 0 35px rgba(255,69,0,0.4), 0 0 45px #ff8c00, 0 0 75px #ffa500, 0 0 85px #ff4500',
                  '0 0 5px rgba(255,165,0,0.7), 0 0 20px rgba(255,140,0,0.5), 0 0 30px rgba(255,69,0,0.3), 0 0 40px #ff8c00, 0 0 70px #ffa500, 0 0 80px #ff4500',
                ],
              }}
              transition={{
                textShadow: {
                  duration: 0.6,
                  repeat: Infinity,
                  repeatType: 'reverse',
                },
              }}
            >
              TICTACTOE
            </motion.h1>
            <div className="relative flex items-center gap-[40px] font-pacifico text-white">
              <motion.span
                className="m-auto text-[70px] text-gradient text-gradient-ocean"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: {
                    delay: 0.2,
                  },
                }}
              >
                X
              </motion.span>
              <motion.span
                className={`${
                  currentTheme === 'light'
                    ? 'text-brightGreen'
                    : 'text-gradient text-gradient-arctic'
                } text-[30px]`}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: {
                    delay: 0.4,
                  },
                }}
              >
                &{' '}
              </motion.span>
              <motion.span
                className="m-auto text-[70px]  text-gradient text-gradient-nebula"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: {
                    delay: 0.6,
                  },
                }}
                onAnimationComplete={() => setStart(true)}
              >
                O
              </motion.span>
              <AnimatePresence>
                {start && (
                  <DrawLine
                    width="100%"
                    height="2px"
                    top={'45%'}
                    left="0px"
                    rotate="0"
                    delay={0.2}
                    duration={0.4}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-white via-blue-500 to-white opacity-10 blur-[95px]"
          // animate={{
          //   scale: [1, 1.2, 1],
          //   opacity: [0.08, 0.12, 0.08],
          // }}
          // transition={{
          //   duration: 4,
          //   repeat: Infinity,
          //   repeatType: "reverse",
          // }}
        />
      </div>
    </FadeIn>
  );
};

export default Preload;
