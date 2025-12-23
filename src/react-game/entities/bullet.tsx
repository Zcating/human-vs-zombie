import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { CONFIG } from '../../game/core/config';
import { useConstant } from '../hooks';

export type BulletType = 'pistol' | 'machinegun' | 'shotgun';

export interface BulletRef {
  readonly mesh: THREE.Mesh | null;
  readonly position: THREE.Vector3;
  readonly velocity: THREE.Vector3;
  life: number;
  alive: boolean;
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
  const meshRef = useRef<THREE.Mesh>(null);
  const position = useConstant(
    () => new THREE.Vector3(...props.initialPosition)
  );
  const velocity = useConstant(() =>
    new THREE.Vector3(...props.direction)
      .normalize()
      .multiplyScalar(CONFIG.bulletSpeed)
  );
  const lifeRef = useRef(80);
  const aliveRef = useRef(true);

  const config = BULLET_CONFIGS[props.type] || BULLET_CONFIGS.pistol;

  useImperativeHandle(ref, () => ({
    get mesh() {
      return meshRef.current;
    },
    get position() {
      return position;
    },
    get velocity() {
      return velocity;
    },
    get alive() {
      return aliveRef.current;
    },
    set alive(value) {
      aliveRef.current = value;
    },
    get life() {
      return lifeRef.current;
    },
    set life(value) {
      lifeRef.current = value;
    },
    update: () => {
      if (!aliveRef.current) {
        return;
      }
      position.add(velocity);
      if (meshRef.current) {
        meshRef.current.position.copy(position);
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
