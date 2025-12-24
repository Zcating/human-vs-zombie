import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { type ZombieRef } from '../entities/zombie';
import { useConstructor } from '../hooks';
import { EventCenter } from '../core/event-center';

export interface ZombieState {
  id: string;
  initialPosition: [number, number, number];
  health: number;
}

let nextId = 0;
const generateId = () => `zombie_${nextId++}`;
const createZombie = (x: number, z: number, health: number = 10) =>
  ({
    id: generateId(),
    initialPosition: [x, 4, z],
    // Base health
    health: health,
  }) satisfies ZombieState;

export const useZombieSystem = () => {
  const [zombies, setZombies] = useState<ZombieState[]>([]);
  const zombieRefs = useConstructor<Map<string, ZombieRef>>(Map);
  const spawnTimer = useRef(0);

  const addZombie = () => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 90 + Math.random() * 30;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    setZombies((prev) => [...prev, createZombie(x, z)]);
  };

  const removeZombie = (id: string) => {
    setZombies((prev) => prev.filter((z) => z.id !== id));
    zombieRefs.delete(id);
  };

  const registerZombie = (id: string, ref: ZombieRef | null) => {
    if (ref) {
      zombieRefs.set(id, ref);
    } else {
      zombieRefs.delete(id);
    }
  };

  const update = (playerPos: THREE.Vector3, onPlayerHit: () => void) => {
    const activeZombies = Array.from(zombieRefs.values());

    // Update Zombies & Check Player Collision
    activeZombies.forEach((zombie: ZombieRef) => {
      // Apply behaviors
      zombie.applyBehaviors(activeZombies, playerPos);
      zombie.update();

      // Check collision with player
      const dist = zombie.position.distanceTo(playerPos);
      if (dist < 2) {
        onPlayerHit();
      }
    });

    // Spawning Logic
    spawnTimer.current++;
    if (spawnTimer.current > 100 && zombies.length < 20) {
      addZombie();
      spawnTimer.current = 0;
    }
  };

  React.useEffect(() => {
    return EventCenter.addEventListener('BULLET_UPDATE', (event) => {
      const bullet = event.target;
      const activeZombies = Array.from(zombieRefs.values());
      // Check collision with zombies
      for (const zombie of activeZombies) {
        if (zombie.health <= 0) {
          continue;
        }

        const dist = bullet.position.distanceTo(zombie.position);
        if (dist < 2) {
          // Hit radius
          zombie.takeDamage(1);

          if (zombie.health <= 0) {
            removeZombie(zombie.id);
            EventCenter.emit('ZOMBIE_KILLED', { id: zombie.id });
          }
          break; // Bullet hit one zombie
        }
      }
    });
  }, []);

  return {
    zombies,
    zombieRefs,
    registerZombie,
    update,
  };
};
