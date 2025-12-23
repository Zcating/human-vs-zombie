import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { CONFIG } from '../../game/core/config';
import { HealthBar, type HealthBarRef } from './health-bar';
import enemyImg from '../../assets/enermy_attack.png';
import { useConstant, useConstructor } from '../hooks';

// 静态加载纹理
const loader = new THREE.TextureLoader();
const texture = loader.load(enemyImg);

export interface ZombieRef {
  readonly id: string;
  readonly mesh: THREE.Sprite;
  readonly position: THREE.Vector3;
  readonly velocity: THREE.Vector3;
  readonly acceleration: THREE.Vector3;
  readonly health: number;
  readonly maxHealth: number;
  takeDamage: (damage: number) => boolean;
  applyBehaviors: (zombies: ZombieRef[], playerPos: THREE.Vector3) => void;
  update: () => void;
}

interface ZombieProps {
  id: string;
  health?: number;
  texture?: THREE.Texture;
  initialPosition?: [number, number, number];
  onPositionChange?: (position: THREE.Vector3) => void;
}

/**
 * React-three-fiber 丧尸组件
 * 具有自主移动行为（追踪与分离）和血量系统
 */
export const Zombie = forwardRef<ZombieRef, ZombieProps>((props, ref) => {
  const spriteRef = useRef<THREE.Sprite>(null!);
  const position = useConstant(() => {
    const initial = props.initialPosition || [0, 4, 0];
    return new THREE.Vector3(...initial);
  });
  const velocity = useConstructor(THREE.Vector3);
  const acceleration = useConstructor(THREE.Vector3);
  const healthBarRef = useRef<HealthBarRef | null>(null);
  const currentHealthRef = useRef(props.health || 1);
  const maxHealthRef = useRef(props.health || 1);

  // 创建丧尸纹理（如果没有提供）
  const createDefaultTexture = () => {
    // const canvas = document.createElement('canvas');
    // canvas.width = 64;
    // canvas.height = 64;
    // const ctx = canvas.getContext('2d')!;

    // // 绘制简单的丧尸形状
    // ctx.fillStyle = '#ff0000';
    // ctx.fillRect(0, 0, 64, 64);
    // ctx.fillStyle = '#ffffff';
    // ctx.fillRect(16, 16, 32, 32);

    // const texture = new THREE.CanvasTexture(canvas);
    // return texture;
    return texture;
  };

  /**
   * 计算追踪行为力（朝向目标移动）
   */
  const seek = (target: THREE.Vector3) => {
    const desired = new THREE.Vector3().subVectors(target, position);
    desired.normalize();
    desired.multiplyScalar(CONFIG.zombieSpeed);
    const steer = new THREE.Vector3().subVectors(desired, velocity);
    steer.clampLength(0, CONFIG.zombieMaxForce);
    return steer;
  };

  /**
   * 计算分离行为力（避免重叠）
   */
  const separate = (zombies: ZombieRef[]) => {
    const diffs = zombies.reduce((diffList, cur) => {
      if (cur.id === props.id) {
        return diffList;
      }

      const d = position.distanceTo(cur.position);
      if (d < 0 || d > CONFIG.separationDist) {
        return diffList;
      }

      // 如果距离小于设定的分离阈值
      const diff = new THREE.Vector3().subVectors(position, cur.position);
      diff.normalize();
      // 距离越近排斥力越大
      diff.divideScalar(d);

      diffList.push(diff);

      return diffList;
    }, [] as THREE.Vector3[]);

    if (diffs.length === 0) {
      return new THREE.Vector3();
    }

    const sum = new THREE.Vector3();
    diffs.forEach((item) => sum.add(item));
    sum.divideScalar(diffs.length);
    sum.normalize();
    sum.multiplyScalar(CONFIG.zombieSpeed);
    sum.sub(velocity);
    sum.clampLength(0, CONFIG.zombieMaxForce);

    return sum;
  };

  /**
   * 受到伤害
   */
  const takeDamage = (damage: number): boolean => {
    currentHealthRef.current -= damage;
    if (healthBarRef.current) {
      healthBarRef.current.setHealth(currentHealthRef.current);
    }

    if (currentHealthRef.current <= 0) {
      return true; // 丧尸死亡
    }
    return false; // 丧尸存活
  };

  /**
   * 应用所有行为力
   */
  const applyBehaviors = (zombies: ZombieRef[], playerPos: THREE.Vector3) => {
    const separateForce = separate(zombies);
    const seekForce = seek(playerPos);

    // 加权合并行为力
    // 分离权重更高，避免穿模
    acceleration.add(separateForce.multiplyScalar(2.5));
    // 追踪权重较低，避免过于集中
    acceleration.add(seekForce.multiplyScalar(1.0));
  };

  /**
   * 更新物理状态
   */
  const update = () => {
    const sprite = spriteRef.current;
    if (!sprite) {
      return;
    }
    // 更新速度和位置
    velocity.add(acceleration);
    velocity.clampLength(0, CONFIG.zombieSpeed);
    // 重置加速度
    acceleration.set(0, 0, 0);
    position.add(velocity);

    // 更新网格位置
    sprite.position.copy(position);

    // 触发位置变化回调
    if (props.onPositionChange) {
      props.onPositionChange(position);
    }
  };

  // 暴露给父组件的接口
  useImperativeHandle(ref, () => ({
    get id() {
      return props.id;
    },
    get mesh() {
      return spriteRef.current;
    },
    get position() {
      return position;
    },
    get velocity() {
      return velocity;
    },
    get acceleration() {
      return acceleration;
    },
    get health() {
      return currentHealthRef.current;
    },
    get maxHealth() {
      return maxHealthRef.current;
    },
    takeDamage,
    applyBehaviors,
    update,
  }));

  // 创建或获取纹理
  const spriteMaterial = useConstant(() => {
    return new THREE.SpriteMaterial({
      map: props.texture || createDefaultTexture(),
      color: 0xffffff,
      transparent: true,
    });
  });

  return (
    <sprite
      ref={spriteRef}
      args={[spriteMaterial]}
      scale={[8, 8, 1]}
      position={position}
    >
      <HealthBar
        ref={healthBarRef}
        maxHealth={maxHealthRef.current}
        initialHealth={currentHealthRef.current}
      />
    </sprite>
  );
});

Zombie.displayName = 'Zombie';
