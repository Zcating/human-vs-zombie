import { useState } from 'react';
import * as THREE from 'three';
import { type BulletRef, type BulletType } from '../entities/bullet';
import { type ZombieRef } from '../entities/zombie';
import { useConstructor } from '../hooks';

export interface BulletState {
  id: string;
  position: [number, number, number];
  direction: [number, number, number];
  type: BulletType;
}

let nextId = 0;
const generateId = () => `bullet_${nextId++}`;

export const useBulletSystem = () => {
  const [bullets, setBullets] = useState<BulletState[]>([]);
  const bulletRefs = useConstructor<Map<string, BulletRef>>(Map);

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

  const removeBullet = (id: string) => {
    setBullets((prev) => prev.filter((b) => b.id !== id));
    bulletRefs.delete(id);
  };

  const registerBullet = (id: string, ref: BulletRef | null) => {
    if (ref) {
      bulletRefs.set(id, ref);
    } else {
      bulletRefs.delete(id);
    }
  };

  const update = (
    activeZombies: ZombieRef[],
    onZombieKilled: (zombieId: string) => void
  ) => {
    bulletRefs.forEach((bullet: BulletRef, id: string) => {
      if (!bullet) {
        return;
      }
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
        if (dist < 2) {
          // Hit radius
          zombie.takeDamage(1);
          bullet.alive = false; // Destroy bullet

          if (zombie.health <= 0) {
            onZombieKilled(zombie.id);
          }
          break; // Bullet hit one zombie
        }
      }
    });
  };

  return {
    bullets,
    bulletRefs,
    addBullet,
    removeBullet,
    registerBullet,
    update,
  };
};
