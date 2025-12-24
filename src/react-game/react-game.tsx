import React from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG } from '../game/core/config';
import { GameContent } from './game-content';
import { UIOverlay } from './ui/ui-overlay';
import { GameScreens } from './ui/game-screens';
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
        {/* Environment */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[50, 100, 50]} intensity={0.6} castShadow />
        <gridHelper args={[200, 50, 0x444444, 0x333333]} position={[0, 0, 0]} />

        {/* Game Content */}
        {gameState.gameStarted && <GameContent />}
      </Canvas>

      {gameState.gameStarted && <UIOverlay />}

      <GameScreens />
    </div>
  );
};
