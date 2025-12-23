import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Player, type PlayerRef } from './entities/player';
import { Zombie, type ZombieRef } from './entities/zombie';
import { Bullet, type BulletRef, type BulletType } from './entities/bullet';
import { useInputSystem } from './systems/use-input-system';
import { CONFIG } from '../game/core/config';
import { type GameState } from './types';
import { useConstructor } from './hooks';

// 简单的ID生成器
let nextId = 0;
const generateId = () => `entity_${nextId++}`;

interface GameContentProps {
  onGameStateChange: (state: GameState) => void;
}

interface EntityState {
  id: string;
  initialPosition: [number, number, number];
  health: number;
}

interface BulletState {
  id: string;
  position: [number, number, number];
  direction: [number, number, number];
  type: BulletType;
}

export const GameContent: React.FC<GameContentProps> = ({
  onGameStateChange,
}) => {
  const { scene, camera } = useThree();
  const playerRef = useRef<PlayerRef>(null);

  const getInput = useInputSystem();

  // Entities State
  const [zombies, setZombies] = useState<EntityState[]>([]);
  const [bullets, setBullets] = useState<BulletState[]>([]);

  // Refs for entities to access in loop without dependency issues
  const zombieRefs = useConstructor<Map<string, ZombieRef>>(Map);
  const bulletRefs = useConstructor<Map<string, BulletRef>>(Map);

  // Game Logic State
  const scoreRef = useRef(0);
  const healthRef = useRef(100);
  const weaponRef = useRef({
    type: 'pistol' as BulletType,
    cooldown: 0,
    timer: 0,
  });
  const spawnTimer = useRef(0);
  const gameOverRef = useRef(false);

  // Helper to add bullet
  const addBullet = (
    pos: THREE.Vector3,
    dir: THREE.Vector3,
    type: BulletType
  ) => {
    const id = generateId();
    setBullets((prev) => [
      ...prev,
      {
        id,
        position: [pos.x, pos.y, pos.z],
        direction: [dir.x, dir.y, dir.z],
        type,
      },
    ]);
  };

  // Helper to remove bullet
  const removeBullet = (id: string) => {
    setBullets((prev) => prev.filter((b) => b.id !== id));
    bulletRefs.delete(id);
  };

  // Helper to add zombie
  const addZombie = () => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 90 + Math.random() * 30;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const id = generateId();
    setZombies((prev) => [
      ...prev,
      {
        id,
        initialPosition: [x, 4, z],
        health: 2, // Base health
      },
    ]);
  };

  // Helper to remove zombie
  const removeZombie = (id: string) => {
    setZombies((prev) => prev.filter((z) => z.id !== id));
    zombieRefs.delete(id);
  };

  // Ground plane for raycasting
  const groundPlane = useMemo(() => {
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    return plane;
  }, []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  useFrame((state) => {
    if (gameOverRef.current) return;

    const input = getInput();

    // 1. Update Player
    if (playerRef.current) {
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
      if (weaponRef.current.cooldown > 0) weaponRef.current.cooldown--;

      if (input.fire && weaponRef.current.cooldown <= 0 && lookTarget) {
        const aimDir = new THREE.Vector3().subVectors(
          lookTarget,
          playerRef.current.position
        );
        aimDir.y = 0;
        aimDir.normalize();

        const type = weaponRef.current.type;

        if (type === 'shotgun') {
          for (let i = -2; i <= 2; i++) {
            const dir = aimDir.clone();
            const angle = i * 0.15;
            const x = dir.x * Math.cos(angle) - dir.z * Math.sin(angle);
            const z = dir.x * Math.sin(angle) + dir.z * Math.cos(angle);
            dir.set(x, 0, z);
            addBullet(playerRef.current.position, dir, type);
          }
          weaponRef.current.cooldown = 45;
        } else {
          addBullet(playerRef.current.position, aimDir, type);
          weaponRef.current.cooldown = type === 'machinegun' ? 4 : 15;
        }
      }
    }

    // 3. Update Bullets & Check Collisions
    const activeZombies = Array.from(zombieRefs.values());

    bulletRefs.forEach((bullet, id) => {
      if (!bullet) return;
      bullet.update();

      if (!bullet.alive) {
        removeBullet(id);
        return;
      }

      // Check collision with zombies
      for (const zombie of activeZombies) {
        if (zombie.health <= 0) continue;

        const dist = bullet.position.distanceTo(zombie.position);
        if (dist < 2) {
          // Hit radius
          zombie.takeDamage(1);
          bullet.alive = false; // Destroy bullet

          if (zombie.health <= 0) {
            scoreRef.current += 10;
            removeZombie(zombie.id);
          }
          break; // Bullet hit one zombie
        }
      }
    });

    // 4. Update Zombies & Check Player Collision
    if (playerRef.current) {
      activeZombies.forEach((zombie) => {
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
      console.log(gameOverRef.current);
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
            if (ref) zombieRefs.set(z.id, ref);
            else zombieRefs.delete(z.id);
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
            if (ref) bulletRefs.set(b.id, ref);
            else bulletRefs.delete(b.id);
          }}
          initialPosition={b.position}
          direction={b.direction}
          type={b.type}
        />
      ))}
    </>
  );
};
