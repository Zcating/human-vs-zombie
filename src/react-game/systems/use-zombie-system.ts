import { useRef, useState } from 'react';
import { type ZombieRef } from '../entities/zombie';

export interface EntityState {
  id: string;
  initialPosition: [number, number, number];
  health: number;
}

let nextId = 0;
const generateId = () => `zombie_${nextId++}`;

export const useZombieSystem = () => {
  const [zombies, setZombies] = useState<EntityState[]>([]);
  const zombieRefs = useRef<Map<string, ZombieRef>>(new Map());

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

  const removeZombie = (id: string) => {
    setZombies((prev) => prev.filter((z) => z.id !== id));
    zombieRefs.current.delete(id);
  };

  return {
    zombies,
    zombieRefs,
    addZombie,
    removeZombie,
  };
};
