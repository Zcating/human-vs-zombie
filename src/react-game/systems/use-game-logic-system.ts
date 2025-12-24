import { useRef, useCallback } from 'react';
import { EventCenter } from '../core/event-center';

export const useGameLogicSystem = (invincibilityDuration: number = 1000) => {
  const scoreRef = useRef(0);
  const healthRef = useRef(100);
  const gameOverRef = useRef(false);
  const lastHitTimeRef = useRef(0);

  const takeDamage = useCallback(
    (amount: number) => {
      if (gameOverRef.current) return false;

      const now = Date.now();
      // Check if player is in invincibility frame
      if (now - lastHitTimeRef.current < invincibilityDuration) {
        return false;
      }

      lastHitTimeRef.current = now;
      const result = healthRef.current - amount;
      healthRef.current = result <= 0 ? 0 : result;

      EventCenter.emit('PLAYER_HIT', { target: healthRef.current });

      if (healthRef.current === 0) {
        gameOverRef.current = true;
        EventCenter.emit('GAME_OVER');
      }

      return true;
    },
    [invincibilityDuration]
  );

  const heal = useCallback((amount: number) => {
    if (gameOverRef.current) return;
    const result = healthRef.current + amount;
    healthRef.current = result >= 100 ? 100 : result;
    EventCenter.emit('PLAYER_HIT', { target: healthRef.current });
  }, []);

  const resetGame = useCallback(() => {
    scoreRef.current = 0;
    healthRef.current = 100;
    gameOverRef.current = false;
    lastHitTimeRef.current = 0;
  }, []);

  return {
    scoreRef,
    healthRef,
    gameOverRef,
    takeDamage,
    heal,
    resetGame,
  };
};
