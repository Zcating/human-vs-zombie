import { useRef } from 'react';
import * as THREE from 'three';
import { type WeaponType } from '../entities/bullet';
import type { InputState } from './use-input-system';

export interface BulletState {
  readonly id: string;
  readonly position: [number, number, number];
  readonly direction: [number, number, number];
  type: WeaponType;
}

let nextId = 0;
const generateId = () => `bullet_${nextId++}`;

function createBulletState(
  pos: THREE.Vector3,
  dir: THREE.Vector3,
  type: WeaponType
): BulletState {
  const id = generateId();
  return {
    id,
    position: [pos.x, pos.y, pos.z],
    direction: [dir.x, dir.y, dir.z],
    type,
  } satisfies BulletState;
}

interface WeaponState {
  type: WeaponType;
  cooldown: number;
  timer: number;
}

export const useWeaponSystem = () => {
  const weaponRef = useRef<WeaponState>({
    type: 'pistol',
    cooldown: 0,
    timer: 0,
  });

  const changeWeapon = (type: WeaponType) => {
    weaponRef.current.type = type;
  };

  const createBullets = (inputState: InputState): BulletState[] => {
    // Cooldown management
    const weaponState = weaponRef.current;
    if (weaponState.cooldown > 0) {
      weaponState.cooldown--;
    }

    // Weapon timer logic (for power-ups, if implemented later)
    if (weaponState.type !== 'pistol' && weaponState.timer > 0) {
      weaponState.timer--;
      if (weaponState.timer <= 0) {
        weaponState.type = 'pistol';
      }
    }

    // Firing logic
    if (
      !inputState.fire ||
      !inputState.lookTarget ||
      weaponState.cooldown > 0
    ) {
      return [];
    }

    const aimDir = new THREE.Vector3().subVectors(
      inputState.lookTarget,
      inputState.origin
    );
    aimDir.y = 0;
    aimDir.normalize();

    const bullets: BulletState[] = [];
    switch (weaponState.type) {
      case 'shotgun':
        weaponState.cooldown = 45;
        // Shotgun logic
        for (let i = 0; i < 5; i++) {
          const dir = aimDir.clone();
          const angle = (i - 2) * 0.15;
          const x = dir.x * Math.cos(angle) - dir.z * Math.sin(angle);
          const z = dir.x * Math.sin(angle) + dir.z * Math.cos(angle);
          dir.set(x, 0, z);
          bullets.push(
            createBulletState(inputState.origin, dir, weaponState.type)
          );
        }
        break;
      case 'pistol':
        weaponState.cooldown = 15;
        bullets.push(
          createBulletState(inputState.origin, aimDir, weaponState.type)
        );
        break;
      case 'machinegun':
        weaponState.cooldown = 4;
        bullets.push(
          createBulletState(inputState.origin, aimDir, weaponState.type)
        );
        break;
      default:
        break;
    }
    return bullets;
  };

  return {
    weaponType: weaponRef.current.type,
    changeWeapon,
    createBullets,
  };
};
