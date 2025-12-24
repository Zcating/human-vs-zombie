import React from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG } from '../game/core/config';
import { GameContent } from './game-content';
import { UIOverlay } from './ui/ui-overlay';
import { useGameStore } from './use-game.store';
import { EventCenter } from './core/event-center';

export const ReactGame: React.FC = () => {
  const gameState = useGameStore((state) => state);

  React.useEffect(() => {
    const subs = [
      EventCenter.addEventListener('GAME_OVER', () => {
        useGameStore.getState().endGame();
      }),
      EventCenter.addEventListener('PLAYER_HIT', (event) => {
        // TODO: 根据 event.target 调整玩家血量
        useGameStore.getState().playerHealth(event.target);
      }),
      EventCenter.addEventListener('ZOMBIE_KILLED', () => {
        // TODO: 根据 event.target.type 奖励不同分数
        useGameStore.getState().playerScored(10);
      }),
      EventCenter.addEventListener('ZOMBIE_COUNT', (event) => {
        // TODO: 根据 event.target 更新 zombieCount
        useGameStore.getState().updateZombieCount(event.count);
      }),
    ];
    return () => {
      subs.forEach((sub) => sub());
    };
  }, []);

  return (
    <div className="w-full h-screen relative">
      <Canvas
        camera={{
          position: [0, CONFIG.camHeight, CONFIG.camDist],
          fov: 60,
          up: [0, 0, -1],
        }}
        shadows
        className="bg-[#f4e8d0]"
        onCreated={({ scene }) => {
          scene.fog = new THREE.Fog(0xf4e8d0, 60, 200);
        }}
      >
        <GameContent />
      </Canvas>

      <UIOverlay />

      {gameState.gameOver && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/70 flex flex-col items-center justify-center text-white z-[1000]">
          <h1>GAME OVER</h1>
          <h2>Score: {gameState.score}</h2>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 text-xl cursor-pointer bg-red-600 text-white border-none rounded mt-4"
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
};
