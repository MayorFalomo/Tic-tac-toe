'use client';
import { useTheme } from '@/app/ThemeContext';
import React from 'react';
import Form from './Form';
import { ArrowLeft, BookOpen, Rocket, User } from 'lucide-react';
import Link from 'next/link';
import Bouncy from '@/app/animation/Bouncy';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
} from '../ui/dialog';
import Image from 'next/image';
import TicTacToe from '@/public/TicTacToe.webp';
import Celebrate from '@/public/celebrate.webp';

type Props = {};

const InfoMenu = (props: Props) => {
  const { currentTheme } = useTheme();

  return (
    <div
      className={`${
        currentTheme === 'light'
          ? 'bg-royalGreen text-golden'
          : 'bg-[#000] text-brightGreen'
      } w-[100vw] min-h-[100vh] overflow-auto flex items-center justify-center `}
    >
      <div className="min-[680px]:grid grid-cols-2 max-[680px]:block items-start w-[60%] max-[1100px]:w-[80%] max-[780px]:w-[90%] border border-white/40 p-3 my-[40px] rounded-[10px]">
        <ul className=" flex flex-col items-start gap-[20px] my-3 list-none ">
          <motion.li
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 12,
              mass: 1.2,
              velocity: 2,
            }}
          >
            <Link className="w-full mb-3" href="/">
              <span className="cursor-pointer w-fit text-white">{<ArrowLeft />} </span>
            </Link>
          </motion.li>

          <li>
            <Bouncy delay={0.2}>
              <a
                target={'_blank'}
                href={'https://github.com/MayorFalomo/Tic-tac-toe'}
                rel="noopener noreferrer"
                className="flex items-center gap-2 cursor-pointer hover:text-white"
              >
                <span>View project on Github</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  width="18"
                  height="18"
                  fill="currentColor"
                >
                  <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                </svg>
              </a>
            </Bouncy>
          </li>
          <li>
            <Bouncy delay={0.4}>
              <a
                target="_blank"
                href={'https://mayowa-falomo.netlify.app'}
                rel="noopener noreferrer"
                className="flex items-center gap-2 cursor-pointer hover:text-white"
              >
                <span>View my Portfolio</span>
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    width="18"
                    height="18"
                    fill="currentColor"
                  >
                    <path d="M4.53 4.75A.75.75 0 0 1 5.28 4h6.01a.75.75 0 0 1 .75.75v6.01a.75.75 0 0 1-1.5 0v-4.2l-5.26 5.261a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L9.48 5.5h-4.2a.75.75 0 0 1-.75-.75Z"></path>
                  </svg>
                </span>
              </a>
            </Bouncy>
          </li>
          <li>
            <Bouncy delay={0.6}>
              <a
                target="_blank"
                href={'https://github.com/Mayorfalomo'}
                rel="noopener noreferrer"
                className="flex items-center gap-2 cursor-pointer hover:text-white"
              >
                <span>See Github profile</span>
                <span>
                  <User />
                </span>
              </a>
            </Bouncy>
          </li>
          <li className="cursor-pointer hover:text-white">
            <Bouncy delay={0.8}>
              <Dialog>
                <DialogTrigger asChild>
                  <span className="flex items-center gap-3 ">
                    See ReadMe
                    <BookOpen size={18} />
                  </span>
                </DialogTrigger>
                <DialogContent className="h-[90%] bg-black text-white overflow-auto w-[100%] max-sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>#Multiplayer Tic-Tac-Toe Game </DialogTitle>
                    <DialogDescription className="my-2">
                      Step into a whole world of real-time fun in this Online Multiplayer
                      TicTacToe game!.
                    </DialogDescription>
                  </DialogHeader>
                  <section>
                    <ul className="flex flex-col items-start gap-4 list-none text-[15px]">
                      <li>
                        <Image src={TicTacToe} alt="img" />
                      </li>
                      <li>
                        Get paired and Connect with players across the globe and battle
                        for supremacy in this exciting multiplayer game.
                      </li>
                      <li>
                        🎮 Real-Time Gameplay: Match up with players instantly and dive
                        into seamless, fun TicTacToe battles.
                      </li>
                      <li>
                        💬 Integrated Chat & Reactions & Notifications: Keep the fun alive
                        with a built-in chat system...send your messages, emojis, and
                        playful reactions during your matches.
                      </li>
                      <li>
                        🦸 Epic Avatars from Your Favorite Franchises: Express yourself
                        with unique avatars! Choose from characters inspired by anime, DC
                        heroes, Marvel icons, and more to represent your style in every
                        match.{' '}
                      </li>
                      <li>
                        ⚙️ Customizable Game Settings: Set up your game just the way you
                        like—choose background Theme, Add Sound, and more for a
                        personalized experience.
                      </li>
                      <li>
                        👥 Player Profiles & Statuses: Browse through all players, check
                        their availability, and track their game statuses in real time.
                      </li>
                    </ul>
                  </section>
                  <section className="mt-3">
                    <ul className="flex flex-col items-start gap-4 list-inside text-[15px]">
                      <h3 className="text-[18px] font-bold">Current Features </h3>
                      <li>Real-time player pairing. </li>
                      <li>Live player to player chat. </li>
                      <li>Send Reactions in chats. </li>
                      <li>Get instant notification update. </li>
                      <li>Light/Dark mode. </li>
                      <li>Sound Control. </li>
                      <li>Change notifications background. </li>
                      <li>Track Players Status. </li>
                      <li>View each players profile. </li>
                      <li>Select an Avatar </li>
                      <li>Sign up</li>
                      <li>Login with saved profile </li>
                    </ul>
                  </section>
                </DialogContent>
              </Dialog>
            </Bouncy>
          </li>
          <li className="cursor-pointer hover:text-white">
            <Bouncy delay={1}>
              <Dialog>
                <DialogTrigger asChild>
                  <span className="flex items-center gap-3 ">
                    Planned features <Rocket size={18} />{' '}
                  </span>
                </DialogTrigger>
                <DialogContent className="h-[90%] bg-black text-white overflow-auto w-[100%] max-sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Planned Features </DialogTitle>
                    <DialogDescription className="">
                      Like to contribute? Feel free to work on any of this planned
                      features.
                    </DialogDescription>
                  </DialogHeader>
                  <div>
                    <ul className="flex flex-col items-start gap-4 text-[14px]">
                      <li className="list-none">
                        <Image src={Celebrate} alt="img" />
                      </li>
                      <li>Play With Computer. </li>
                      <li>Add More customizable settings.</li>
                      <li>Chat players before the game.</li>
                      <li>LeaderBoard to show total wins and losses by a player.</li>
                      <li>A Timer to record battle time.</li>
                      <li>Add more Avatars and avatar themes. </li>
                    </ul>
                  </div>
                </DialogContent>
              </Dialog>
            </Bouncy>
          </li>
        </ul>
        <div className="w-full">
          <Form />
        </div>
      </div>
    </div>
  );
};

export default InfoMenu;
