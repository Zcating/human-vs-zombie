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
  const startGame = useGameStore((state) => state.startGame);

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
        {/* Environment */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[50, 100, 50]} intensity={0.6} castShadow />
        <gridHelper args={[200, 50, 0x444444, 0x333333]} position={[0, 0, 0]} />

        {/* Game Content */}
        {gameState.gameStarted && <GameContent />}
      </Canvas>

      {gameState.gameStarted && <UIOverlay />}

      {/* Start Screen */}
      {!gameState.gameStarted && !gameState.gameOver && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/70 flex flex-col items-center justify-center text-white z-[1000]">
          <h1 className="text-6xl font-bold mb-8 tracking-wider">
            HUMAN VS ZOMBIE
          </h1>
          <p className="mb-8 text-xl text-gray-300">
            Survive the zombie apocalypse!
          </p>
          <button
            onClick={() => startGame()}
            className="px-8 py-4 text-2xl font-bold cursor-pointer bg-green-600 hover:bg-green-500 text-white border-none rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            START GAME
          </button>
          <div className="mt-12 text-sm text-gray-400">
            <p>WASD to Move • Mouse to Aim & Shoot</p>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState.gameOver && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/80 flex flex-col items-center justify-center text-white z-[1000]">
          <h1 className="text-6xl font-bold text-red-500 mb-4">GAME OVER</h1>
          <h2 className="text-3xl mb-8">Score: {gameState.score}</h2>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 text-xl font-bold cursor-pointer bg-red-600 hover:bg-red-500 text-white border-none rounded-lg transition-all shadow-lg"
          >
            TRY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};
