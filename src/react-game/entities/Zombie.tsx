import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from 'react';
import * as THREE from 'three';
import { CONFIG } from '../../game/core/config';
import { HealthBar, type HealthBarRef } from './health-bar';

export interface ZombieRef {
  id: string;
  mesh: THREE.Sprite;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  health: number;
  maxHealth: number;
  takeDamage: (damage: number) => boolean;
  applyBehaviors: (zombies: ZombieRef[], playerPos: THREE.Vector3) => void;
  update: () => void;
  destroy: () => void;
}

interface ZombieProps {
  id: string;
  scene: THREE.Scene;
  initialPosition?: [number, number, number];
  health?: number;
  texture?: THREE.Texture;
  onPositionChange?: (position: THREE.Vector3) => void;
}

/**
 * React-three-fiber 丧尸组件
 * 具有自主移动行为（追踪与分离）和血量系统
 */
export const Zombie = forwardRef<ZombieRef, ZombieProps>((props, ref) => {
  const spriteRef = useRef<THREE.Sprite>(null!);
  const positionRef = useRef(new THREE.Vector3());
  const velocityRef = useRef(new THREE.Vector3());
  const accelerationRef = useRef(new THREE.Vector3());
  const healthBarRef = useRef<HealthBarRef | null>(null);
  const currentHealthRef = useRef(props.health || 1);
  const maxHealthRef = useRef(props.health || 1);

  // 创建丧尸纹理（如果没有提供）
  const createDefaultTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // 绘制简单的丧尸形状
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(16, 16, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  // 初始化丧尸
  useEffect(() => {
    if (!spriteRef.current) return;

    // 设置初始位置
    if (props.initialPosition) {
      positionRef.current.set(...props.initialPosition);
      spriteRef.current.position.copy(positionRef.current);
    } else {
      // 随机生成位置（圆形分布）
      const angle = Math.random() * Math.PI * 2;
      const radius = 90 + Math.random() * 30;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      positionRef.current.set(x, 4, z);
      spriteRef.current.position.copy(positionRef.current);
    }
  }, []);

  /**
   * 计算追踪行为力（朝向目标移动）
   */
  const seek = (target: THREE.Vector3) => {
    const desired = new THREE.Vector3().subVectors(target, positionRef.current);
    desired.normalize();
    desired.multiplyScalar(CONFIG.zombieSpeed);
    const steer = new THREE.Vector3().subVectors(desired, velocityRef.current);
    steer.clampLength(0, CONFIG.zombieMaxForce);
    return steer;
  };

  /**
   * 计算分离行为力（避免重叠）
   */
  const separate = (zombies: ZombieRef[]) => {
    const sum = new THREE.Vector3();
    let count = 0;

    for (const other of zombies) {
      if (other.id === props.id) continue;
      const d = positionRef.current.distanceTo(other.position);
      // 如果距离小于设定的分离阈值
      if (d > 0 && d < CONFIG.separationDist) {
        const diff = new THREE.Vector3().subVectors(
          positionRef.current,
          other.position
        );
        diff.normalize();
        diff.divideScalar(d); // 距离越近排斥力越大
        sum.add(diff);
        count++;
      }
    }
    if (count > 0) {
      sum.divideScalar(count);
      sum.normalize();
      sum.multiplyScalar(CONFIG.zombieSpeed);
      sum.sub(velocityRef.current);
      sum.clampLength(0, CONFIG.zombieMaxForce);
    }
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
    separateForce.multiplyScalar(2.5); // 分离权重更高，避免穿模
    seekForce.multiplyScalar(1.0);

    accelerationRef.current.add(separateForce);
    accelerationRef.current.add(seekForce);
  };

  /**
   * 更新物理状态
   */
  const update = () => {
    if (!spriteRef.current) return;

    // 更新速度和位置
    velocityRef.current.add(accelerationRef.current);
    velocityRef.current.clampLength(0, CONFIG.zombieSpeed);
    positionRef.current.add(velocityRef.current);
    accelerationRef.current.set(0, 0, 0); // 重置加速度

    // 更新网格位置
    spriteRef.current.position.copy(positionRef.current);

    // 触发位置变化回调
    if (props.onPositionChange) {
      props.onPositionChange(positionRef.current);
    }
  };

  /**
   * 销毁丧尸
   */
  const destroy = () => {
    // React handles unmount
  };

  // 暴露给父组件的接口
  useImperativeHandle(ref, () => ({
    id: props.id,
    mesh: spriteRef.current,
    position: positionRef.current,
    velocity: velocityRef.current,
    acceleration: accelerationRef.current,
    health: currentHealthRef.current,
    maxHealth: maxHealthRef.current,
    takeDamage,
    applyBehaviors,
    update,
    destroy,
  }));

  // 创建或获取纹理
  const zombieTexture = props.texture || createDefaultTexture();

  const SpriteMaterial = new THREE.SpriteMaterial({
    map: zombieTexture,
    color: 0xffffff,
  });

  return (
    <sprite
      ref={spriteRef}
      args={[SpriteMaterial]}
      scale={[8, 8, 1]}
      position={props.initialPosition || [0, 4, 0]}
    >
      <HealthBar
        ref={healthBarRef}
        maxHealth={maxHealthRef.current}
        initialHealth={currentHealthRef.current}
        width={1} // Relative to parent scale (8) -> 8 * 1 = 8
        height={1 / 8} // Relative to parent scale (8) -> 8 * 1/8 = 1
        position={[0, 0.6, 0]} // Above the zombie
      />
    </sprite>
  );
});

Zombie.displayName = 'Zombie';
