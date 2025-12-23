import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Player, type PlayerRef } from './entities/player';
import { Zombie } from './entities/zombie';
import { Bullet } from './entities/bullet';
import { useInputSystem } from './systems/use-input-system';
import { useBulletSystem } from './systems/use-bullet-system';
import { useZombieSystem } from './systems/use-zombie-system';
import { useWeaponSystem } from './systems/use-weapon-system';
import { useGameLogicSystem } from './systems/use-game-logic-system';
import { type GameState } from './types';

interface GameContentProps {
  onGameStateChange: (state: GameState) => void;
}

export const GameContent: React.FC<GameContentProps> = ({
  onGameStateChange,
}) => {
  const { camera } = useThree();
  const playerRef = useRef<PlayerRef>(null);

  // Systems
  const { updateCamera } = useInputSystem(camera);
  const { weaponType, createBullets } = useWeaponSystem();
  const { bullets, registerBullet, updateBullets } = useBulletSystem();
  const { zombies, registerZombie, update: updateZombies } = useZombieSystem();
  const { scoreRef, healthRef, gameOverRef } = useGameLogicSystem();

  useFrame((state) => {
    if (gameOverRef.current) {
      return;
    }

    const player = playerRef.current;
    if (!player) {
      return;
    }

    // 1. Update Player & Camera
    const inputState = updateCamera(player);

    // 2. Weapon System
    const bullets = createBullets(inputState);

    // 3. Update Bullets & Check Collisions
    updateBullets(bullets);

    // 4. Update Zombies & Check Player Collision
    updateZombies(player.position, () => {
      // Player hit
      // Implement invincible/damage logic here
      // For simplicity:
      healthRef.current -= 0.5; // Drain health fast
      if (healthRef.current <= 0) {
        healthRef.current = 0;
        gameOverRef.current = true;
        onGameStateChange({
          health: Math.floor(healthRef.current),
          score: scoreRef.current,
          weapon: weaponType,
          zombieCount: zombies.length,
          gameOver: gameOverRef.current,
        });
      }
    });

    // 5. Spawning Logic (moved to useZombieSystem)

    // 6. Sync UI State (throttle this if needed)
    if (state.clock.getElapsedTime() % 0.5 < 0.02) {
      // Sync every ~0.5s
      onGameStateChange({
        health: Math.floor(healthRef.current),
        score: scoreRef.current,
        weapon: weaponType,
        zombieCount: zombies.length,
        gameOver: gameOverRef.current,
      });
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 100, 50]} intensity={0.6} castShadow />
      <gridHelper args={[200, 50, 0x444444, 0x333333]} position={[0, 0, 0]} />

      <Player ref={playerRef} position={[0, 1, 0]} />

      {zombies.map((z) => (
        <Zombie
          key={z.id}
          id={z.id}
          ref={(ref) => registerZombie(z.id, ref)}
          initialPosition={z.initialPosition}
          health={z.health}
        />
      ))}

      {bullets.map((bullet) => (
        <Bullet
          key={bullet.id}
          ref={(ref) => registerBullet(bullet.id, ref)}
          initialPosition={bullet.position}
          direction={bullet.direction}
          type={bullet.type}
        />
      ))}
    </>
  );
};
