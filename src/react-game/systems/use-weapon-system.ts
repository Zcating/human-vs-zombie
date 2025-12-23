import { useRef } from 'react';
import * as THREE from 'three';
import { type BulletType } from '../entities/bullet';

interface WeaponState {
  type: BulletType;
  cooldown: number;
  timer: number;
}

export const useWeaponSystem = () => {
  const weaponRef = useRef<WeaponState>({
    type: 'pistol',
    cooldown: 0,
    timer: 0,
  });

  const update = (
    fire: boolean,
    origin: THREE.Vector3,
    lookTarget: THREE.Vector3 | null,
    addBullet: (
      pos: THREE.Vector3,
      dir: THREE.Vector3,
      type: BulletType
    ) => void
  ) => {
    // Cooldown management
    if (weaponRef.current.cooldown > 0) {
      weaponRef.current.cooldown--;
    }

    // Firing logic
    if (fire && weaponRef.current.cooldown <= 0 && lookTarget) {
      const aimDir = new THREE.Vector3().subVectors(lookTarget, origin);
      aimDir.y = 0;
      aimDir.normalize();

      const type = weaponRef.current.type;

      if (type === 'shotgun') {
        // Shotgun logic
        for (let i = -2; i <= 2; i++) {
          const dir = aimDir.clone();
          const angle = i * 0.15;
          const x = dir.x * Math.cos(angle) - dir.z * Math.sin(angle);
          const z = dir.x * Math.sin(angle) + dir.z * Math.cos(angle);
          dir.set(x, 0, z);
          addBullet(origin, dir, type);
        }
        weaponRef.current.cooldown = 45;
      } else {
        // Pistol / Machinegun logic
        addBullet(origin, aimDir, type);
        weaponRef.current.cooldown = type === 'machinegun' ? 4 : 15;
      }
    }

    // Weapon timer logic (for power-ups, if implemented later)
    if (weaponRef.current.type !== 'pistol' && weaponRef.current.timer > 0) {
      weaponRef.current.timer--;
      if (weaponRef.current.timer <= 0) {
        weaponRef.current.type = 'pistol';
      }
    }
  };

  return {
    weaponRef,
    update,
  };
};
