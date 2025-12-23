import React from 'react';
import { type GameState } from '../types';
interface UIOverlayProps {
  gameState: GameState;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ gameState }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        fontSize: '16px',
        zIndex: 100,
        pointerEvents: 'none',
        fontFamily: 'monospace',
      }}
    >
      <div style={{ marginBottom: 10 }}>React-Three-Fiber Remake</div>
      <div>
        HP:{' '}
        <span style={{ color: gameState.health > 30 ? '#0f0' : '#f00' }}>
          {gameState.health}%
        </span>
      </div>
      <div>Score: {gameState.score}</div>
      <div>Weapon: {gameState.weapon}</div>
      <div>Zombies: {gameState.zombieCount}</div>

      {/* Simple Controls Info */}
      <div style={{ marginTop: 20, fontSize: '12px', color: '#aaa' }}>
        WASD to Move
        <br />
        Mouse to Aim & Shoot
      </div>
    </div>
  );
};
