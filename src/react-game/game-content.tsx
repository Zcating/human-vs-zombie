import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Player, type PlayerRef } from './entities/player';
import { Zombie, type ZombieRef } from './entities/zombie';
import { Bullet, type BulletRef } from './entities/bullet';
import { useInputSystem } from './systems/use-input-system';
import { useBulletSystem } from './systems/use-bullet-system';
import { useZombieSystem } from './systems/use-zombie-system';
import { useWeaponSystem } from './systems/use-weapon-system';
import { useGameLogicSystem } from './systems/use-game-logic-system';
import { CONFIG } from '../game/core/config';
import { type GameState } from './types';

interface GameContentProps {
  onGameStateChange: (state: GameState) => void;
}

export const GameContent: React.FC<GameContentProps> = ({
  onGameStateChange,
}) => {
  const { scene, camera } = useThree();
  const playerRef = useRef<PlayerRef>(null);

  // Systems
  const getInput = useInputSystem();
  const { bullets, bulletRefs, addBullet, removeBullet } = useBulletSystem();
  const { zombies, zombieRefs, addZombie, removeZombie } = useZombieSystem();
  const { weaponRef, update: updateWeapon } = useWeaponSystem();
  const { scoreRef, healthRef, spawnTimer, gameOverRef } = useGameLogicSystem();

  // Refs for entities to access in loop without dependency issues
  // Note: These are now managed inside the custom hooks, but we need to access the map methods
  // However, the current custom hooks implementation exposes refs that hold the maps.
  // We need to be careful about how we access them.
  // Actually, useBulletSystem and useZombieSystem return bulletRefs and zombieRefs which are RefObject<Map>

  // Ground plane for raycasting
  const groundPlane = useMemo(() => {
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    return plane;
  }, []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  useFrame((state) => {
    if (gameOverRef.current) {
      return;
    }

    if (!playerRef.current) {
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

    playerRef.current.update(input.move, lookTarget);

    // Limit camera position
    camera.position.x = playerRef.current.position.x;
    camera.position.z = playerRef.current.position.z + CONFIG.camDist;
    camera.lookAt(playerRef.current.position);

    // 2. Weapon System
    updateWeapon(input.fire, playerRef.current.position, lookTarget, addBullet);

    // 3. Update Bullets & Check Collisions
    const activeZombies = Array.from(zombieRefs.current.values());

    bulletRefs.forEach((bullet: BulletRef, id: string) => {
      if (!bullet) return;
      bullet.update();

      if (!bullet.alive) {
        removeBullet(id);
        return;
      }

      // Check collision with zombies
      for (const zombie of activeZombies) {
        if (zombie.health <= 0) {
          continue;
        }

        const dist = bullet.position.distanceTo(zombie.position);
        if (dist >= 2) {
          continue;
        }

        // Hit radius
        zombie.takeDamage(1);

        // Destroy bullet
        bullet.alive = false;

        if (zombie.health <= 0) {
          scoreRef.current += 10;
          removeZombie(zombie.id);
        }
        // Bullet hit one zombie
        break;
      }
    });

    // 4. Update Zombies & Check Player Collision
    if (playerRef.current) {
      activeZombies.forEach((zombie: ZombieRef) => {
        // Apply behaviors
        zombie.applyBehaviors(activeZombies, playerRef.current!.position);
        zombie.update();

        // Check collision with player
        const dist = zombie.position.distanceTo(playerRef.current!.position);
        if (dist < 2) {
          // Player hit
          // Implement invincible/damage logic here
          // For simplicity:
          healthRef.current -= 0.5; // Drain health fast
          if (healthRef.current <= 0) {
            healthRef.current = 0;
            gameOverRef.current = true;
          }
        }
      });
    }

    // 5. Spawning Logic
    spawnTimer.current++;
    if (spawnTimer.current > 100 && zombies.length < 20) {
      // Simple spawn logic
      addZombie();
      spawnTimer.current = 0;
    }

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
          ref={(ref) => {
            if (ref) zombieRefs.current.set(z.id, ref);
            else zombieRefs.current.delete(z.id);
          }}
          scene={scene}
          initialPosition={z.initialPosition}
          health={z.health}
        />
      ))}

      {bullets.map((b) => (
        <Bullet
          key={b.id}
          ref={(ref) => {
            if (ref) {
              bulletRefs.set(b.id, ref);
            } else {
              bulletRefs.delete(b.id);
            }
          }}
          initialPosition={b.position}
          direction={b.direction}
          type={b.type}
        />
      ))}
    </>
  );
};
