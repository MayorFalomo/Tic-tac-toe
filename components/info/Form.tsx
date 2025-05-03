import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';
import { gameInfoStyle } from '@/app/animation/constants';

const Form = () => {
  const form = useRef<HTMLFormElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);
  const [messageStatus, setMessageStatus] = useState<string | null>(null);

  useEffect(() => emailjs.init(`${process.env.NEXT_PUBLIC_EMAIL_API_KEY}`), []);

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (nameRef.current && emailRef.current && messageRef.current) {
      setMessageStatus('loading');
      await emailjs
        .send(
          `${process.env.NEXT_PUBLIC_SERVICE_ID}`,
          `${process.env.NEXT_PUBLIC_TEMPLATE_ID}`,
          {
            to_name: 'Falomo Mayowa, source: TicTacToe Form',
            from_name: nameRef.current?.value,
            message: `${messageRef.current?.value}
            
            Reply To: ${emailRef.current?.value}
          `,
            reply_to: emailRef.current?.value,
          }
        )
        .then(
          () => {
            setMessageStatus('sent');
            form.current?.reset();
            setTimeout(() => {
              setMessageStatus('');
            }, 7000);
          },
          (error) => {
            setMessageStatus('failed');
            setTimeout(() => {
              setMessageStatus('');
            }, 7000);
            console.log('FAILED...', error);
          }
        );
    } else {
      toast.error('Please, Complete the form');
    }
  };

  const messageVariant = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  };

  return (
    <div className="flex flex-col min-[1200px]:w-[100%] ">
      <form ref={form} onSubmit={sendEmail}>
        <div
          className="relative mb-6 py-2 hover:border-b-white border-b border-white/30 transition-all duration-1000 ease-out"
          data-twe-input-wrapper-init
        >
          <input
            type="text"
            className="peer block min-h-[auto] w-full border-0 bg-transparent px-3 py-[0.8rem] leading-[1.6] text-white placeholder:text-white outline-none transition-all duration-200 ease-linear "
            id="nameInput"
            placeholder="Name"
            ref={nameRef}
            required
          />
        </div>

        <div
          className="relative mb-6 py-2 hover:border-b-white transition-all duration-1000 ease-out border-b border-white/30"
          data-twe-input-wrapper-init
        >
          <input
            type="email"
            className="block min-h-[auto] w-full border-0 bg-transparent px-3 py-[0.8rem] leading-[1.6] text-white placeholder:text-white outline-none transition-all duration-200 ease-linear "
            id="emailInput"
            placeholder="Email"
            required
            ref={emailRef}
          />
        </div>

        <div className="relative mb-6" data-twe-input-wrapper-init>
          <textarea
            className="peer block min-h-[80px] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear  text-white placeholder:text-white overflow-y-hidden "
            id="message"
            rows={3}
            placeholder="Message"
            required
            ref={messageRef}
          ></textarea>
        </div>

        <button
          type="submit"
          className={`w-full rounded ${gameInfoStyle} text-black px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal shadow-primary-3 transition duration-150 ease-in-out hover:opacity-80 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong`}
          data-twe-ripple-init
          data-twe-ripple-color="light"
          disabled={messageStatus === 'loading'}
        >
          {messageStatus === 'sent' ? (
            <motion.span
              variants={messageVariant}
              initial="hidden"
              animate="show"
              className="flex items-center justify-center gap-2 w-full"
            >
              Sent successfully{' '}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-check"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>{' '}
            </motion.span>
          ) : (
            <motion.span variants={messageVariant} initial="hidden" animate="show">
              Send message to developer
            </motion.span>
          )}
          {messageStatus === 'loading' && (
            <motion.div
              variants={messageVariant}
              initial="hidden"
              animate="show"
              className="inline-block ml-2 h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] text-black motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status"
            >
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </motion.div>
          )}
        </button>
        <AnimatePresence>
          {messageStatus === 'sent' ? (
            <motion.p
              variants={messageVariant}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="text-center text-green-500 text-[14px] max-[480px]:text-[14px] mt-2"
            >
              Message Received!, I will reply shortly....
            </motion.p>
          ) : messageStatus === 'failed' ? (
            <motion.p
              variants={messageVariant}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="text-center text-red-600 text-[14px] max-[480px]:text-[14px] mt-2"
            >
              Sorry!, Failed to send your meesage.
            </motion.p>
          ) : (
            ''
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

export default Form;
