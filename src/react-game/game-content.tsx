import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Player, type PlayerRef } from './entities/player';
import { Zombie } from './entities/zombie';
import { Bullet } from './entities/bullet';
import { useInputSystem } from './systems/use-input-system';
import { useBulletSystem } from './systems/use-bullet-system';
import { useZombieSystem } from './systems/use-zombie-system';
import { useWeaponSystem } from './systems/use-weapon-system';
import { useGameLogicSystem } from './systems/use-game-logic-system';
import { CONFIG } from '../game/core/config';
import { type GameState } from './types';
import { useConstant, useConstructor } from './hooks';

interface GameContentProps {
  onGameStateChange: (state: GameState) => void;
}

export const GameContent: React.FC<GameContentProps> = ({
  onGameStateChange,
}) => {
  const { scene, camera } = useThree();
  const playerRef = useRef<PlayerRef>(null);
  // Ground plane for raycasting
  const groundPlane = useConstant(() => {
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    return plane;
  });
  const raycaster = useConstructor(THREE.Raycaster);

  // Systems
  const getInput = useInputSystem();
  const {
    bullets,
    addBullet,
    registerBullet,
    update: updateBullets,
  } = useBulletSystem();
  const {
    zombies,
    zombieRefs,
    removeZombie,
    registerZombie,
    update: updateZombies,
  } = useZombieSystem();
  const { weaponRef, update: updateWeapon } = useWeaponSystem();
  const { scoreRef, healthRef, gameOverRef } = useGameLogicSystem();

  useFrame((state) => {
    if (gameOverRef.current) {
      return;
    }
    const player = playerRef.current;
    if (!player) {
      return;
    }

    const input = getInput();

    // 1. Update Player

    // Calculate look target
    let lookTarget: THREE.Vector3 | null = null;

    // Raycast to ground
    raycaster.setFromCamera(input.look, camera);
    const target = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(groundPlane, target)) {
      lookTarget = target;
    }

    player.update(input.move, lookTarget);

    // Limit camera position
    camera.position.x = player.position.x;
    camera.position.z = player.position.z + CONFIG.camDist;
    camera.lookAt(player.position);

    // 2. Weapon System
    updateWeapon(input.fire, player.position, lookTarget, addBullet);

    // 3. Update Bullets & Check Collisions
    const activeZombies = Array.from(zombieRefs.values());
    updateBullets(activeZombies, (zombieId) => {
      scoreRef.current += 10;
      removeZombie(zombieId);
    });

    // 4. Update Zombies & Check Player Collision
    updateZombies(player.position, () => {
      // Player hit
      // Implement invincible/damage logic here
      // For simplicity:
      healthRef.current -= 0.5; // Drain health fast
      if (healthRef.current <= 0) {
        healthRef.current = 0;
        gameOverRef.current = true;
      }
    });

    // 5. Spawning Logic (moved to useZombieSystem)

    // 6. Sync UI State (throttle this if needed)
    if (state.clock.getElapsedTime() % 0.5 < 0.02) {
      // Sync every ~0.5s
      onGameStateChange({
        health: Math.floor(healthRef.current),
        score: scoreRef.current,
        weapon: weaponRef.current.type,
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
          scene={scene}
          initialPosition={z.initialPosition}
          health={z.health}
        />
      ))}

      {bullets.map((b) => (
        <Bullet
          key={b.id}
          ref={(ref) => registerBullet(b.id, ref)}
          initialPosition={b.position}
          direction={b.direction}
          type={b.type}
        />
      ))}
    </>
  );
};
