import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { CONFIG } from '../../game/core/config';

export type BulletType = 'pistol' | 'machinegun' | 'shotgun';

export interface BulletRef {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  alive: boolean;
  life: number;
  update: () => void;
}

interface BulletProps {
  initialPosition: [number, number, number];
  direction: [number, number, number];
  type: BulletType;
}

const BULLET_CONFIGS: Record<BulletType, { color: number; size: number }> = {
  pistol: { color: 0x000000, size: 0.5 },
  machinegun: { color: 0x00d2ff, size: 0.5 },
  shotgun: { color: 0xffaa00, size: 0.9 },
};

export const Bullet = forwardRef<BulletRef, BulletProps>((props, ref) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const positionRef = useRef(new THREE.Vector3(...props.initialPosition));
  const velocityRef = useRef(
    new THREE.Vector3(...props.direction)
      .normalize()
      .multiplyScalar(CONFIG.bulletSpeed)
  );
  const lifeRef = useRef(80);
  const aliveRef = useRef(true);

  const config = BULLET_CONFIGS[props.type] || BULLET_CONFIGS.pistol;

  useImperativeHandle(ref, () => ({
    mesh: meshRef.current,
    position: positionRef.current,
    velocity: velocityRef.current,
    get alive() {
      return aliveRef.current;
    },
    get life() {
      return lifeRef.current;
    },
    update: () => {
      if (!aliveRef.current) return;
      positionRef.current.add(velocityRef.current);
      if (meshRef.current) {
        meshRef.current.position.copy(positionRef.current);
      }
      lifeRef.current--;
      if (lifeRef.current <= 0) {
        aliveRef.current = false;
      }
    },
  }));

  return (
    <mesh ref={meshRef} position={props.initialPosition}>
      <sphereGeometry args={[config.size, 4, 4]} />
      <meshBasicMaterial color={config.color} />
    </mesh>
  );
});

Bullet.displayName = 'Bullet';
