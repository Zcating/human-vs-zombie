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
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{
          position: [0, CONFIG.camHeight, CONFIG.camDist],
          fov: 60,
          up: [0, 0, -1],
        }}
        shadows
        style={{ background: '#f4e8d0' }}
        onCreated={({ scene }) => {
          scene.fog = new THREE.Fog(0xf4e8d0, 60, 200);
        }}
      >
        <GameContent onGameStateChange={setGameState} />
      </Canvas>

      <UIOverlay gameState={gameState} />

      {gameState.gameOver && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            zIndex: 1000,
          }}
        >
          <h1>GAME OVER</h1>
          <h2>Score: {gameState.score}</h2>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              fontSize: '20px',
              cursor: 'pointer',
              background: '#ff0000',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
            }}
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
};
