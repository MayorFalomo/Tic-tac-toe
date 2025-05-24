import { useState, useEffect, useCallback } from 'react';

const useCountdown = (initialTime: number) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let timerId: any;

    if (isActive && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }

    return () => clearInterval(timerId);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  const startTimer = () => {
    setIsActive(true);
  };

  const stopTimer = () => {
    setIsActive(false);
  };

  const resetTimer = useCallback(() => {
    setTimeLeft(initialTime);
    setIsActive(true);
  }, [initialTime]);

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    startTimer,
    stopTimer,
    resetTimer,
  };
};

export default useCountdown;
