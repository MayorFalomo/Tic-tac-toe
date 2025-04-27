import { useEffect, useRef, useState } from 'react';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/firebase-config/firebase';

const useTypingIndicator = (combinedChattersId: string) => {
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const typingRef = useRef<NodeJS.Timeout | null>(null);

  const updateTypingStatus = async (typing: boolean) => {
    const chatRef = collection(db, 'userChats');
    const q = query(chatRef, where('combinedId', '==', combinedChattersId));
    const chatDoc = await getDocs(q);

    if (!chatDoc.empty) {
      const chatId = chatDoc.docs[0].id;
      const chatDocumentRef = doc(db, 'userChats', chatId);

      await updateDoc(chatDocumentRef, {
        typing: typing
      });
    }
  };

  const handleTyping = async () => {
    if (!isTyping) {
      setIsTyping(true);
      await updateTypingStatus(true);
    }

    if (typingRef.current) {
      clearTimeout(typingRef.current);
    }

    typingRef.current = setTimeout(async () => {
      setIsTyping(false);
      await updateTypingStatus(false);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (typingRef.current) {
        clearTimeout(typingRef.current);
      }
    };
  }, []);

  return { isTyping, handleTyping };
};

export default useTypingIndicator;
