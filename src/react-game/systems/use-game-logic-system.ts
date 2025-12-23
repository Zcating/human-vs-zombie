import { useRef } from 'react';

export const useGameLogicSystem = () => {
  const scoreRef = useRef(0);
  const healthRef = useRef(100);
  const gameOverRef = useRef(false);

  return {
    scoreRef,
    healthRef,
    gameOverRef,
  };
};
