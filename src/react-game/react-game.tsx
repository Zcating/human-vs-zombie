import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG } from '../game/core/config';
import { type GameState } from './types';
import { GameContent } from './game-content';
import { UIOverlay } from './ui/ui-overlay';

export const ReactGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    health: 100,
    score: 0,
    weapon: 'pistol',
    zombieCount: 0,
    gameOver: false,
  });

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
        <GameContent onGameStateChange={setGameState} />
      </Canvas>

      <UIOverlay gameState={gameState} />

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
