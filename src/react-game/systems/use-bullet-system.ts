import { useState } from 'react';
import { type BulletRef } from '../entities/bullet';
import { useConstructor } from '../hooks';
import { EventCenter } from '../core/event-center';
import type { BulletState } from './use-weapon-system';

export const useBulletSystem = () => {
  const [bullets, setBullets] = useState<BulletState[]>([]);
  const bulletRefs = useConstructor<Map<string, BulletRef>>(Map);

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

  const updateBullets = (newBullets: BulletState[]) => {
    if (newBullets.length > 0) {
      setBullets((prev) => [...prev, ...newBullets]);
    }

    bulletRefs.forEach((bullet: BulletRef, id: string) => {
      if (!bullet) {
        return;
      }
      bullet.update();

      if (!bullet.alive) {
        removeBullet(id);
        return;
      }

      EventCenter.emit('BULLET_UPDATE', { target: bullet });
    });
  };

  return {
    bullets,
    bulletRefs,
    registerBullet,
    updateBullets,
  };
};
