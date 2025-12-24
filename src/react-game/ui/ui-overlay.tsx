import React from 'react';
import { useGameStore } from '../use-game.store';

export const UIOverlay: React.FC = () => {
  const gameState = useGameStore((state) => state);

  return (
    <div className="absolute top-5 left-5 text-white text-base z-100 pointer-events-none font-mono">
      <div className="mb-2.5">React-Three-Fiber Remake</div>
      <div>
        HP:{' '}
        <span className={gameState.health > 30 ? 'text-[#0f0]' : 'text-[#f00]'}>
          {gameState.health}%
        </span>
      </div>
      <div>Score: {gameState.score}</div>
      <div>Weapon: {gameState.weapon.type}</div>
      <div>Zombies: {gameState.zombieCount}</div>

      {/* Simple Controls Info */}
      <div className="mt-5 text-xs text-[#aaa]">
        WASD to Move
        <br />
        Mouse to Aim & Shoot
      </div>
    </div>
  );
};
