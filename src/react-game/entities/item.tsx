import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';

/**
 * 道具类型
 * - health: 恢复生命值
 * - machinegun: 获得机关枪
 * - shotgun: 获得霰弹枪
 */
export type ItemType = 'health' | 'machinegun' | 'shotgun';

export interface ItemRef {
  readonly id: string;
  readonly type: ItemType;
  readonly position: THREE.Vector3;
  readonly collected: boolean;
  update: () => void;
}

interface ItemProps {
  id: string;
  type: ItemType;
  position: [number, number, number];
}

/**
 * 道具组件
 * 渲染一个旋转的立方体，不同颜色代表不同道具
 */
export const Item = forwardRef<ItemRef, ItemProps>((props, ref) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const positionRef = useRef(new THREE.Vector3(...props.position));
  const collectedRef = useRef(false);

  // 根据类型设置颜色
  const getColor = (type: ItemType) => {
    switch (type) {
      case 'health':
        return 0x00ff00; // 绿色
      case 'machinegun':
        return 0xffff00; // 黄色
      case 'shotgun':
        return 0xff0000; // 红色
      default:
        return 0xffffff;
    }
  };

  useImperativeHandle(ref, () => ({
    get id() {
      return props.id;
    },
    get type() {
      return props.type;
    },
    get position() {
      return positionRef.current;
    },
    get collected() {
      return collectedRef.current;
    },
    update: () => {
      if (meshRef.current) {
        // 旋转动画
        meshRef.current.rotation.y += 0.02;
        meshRef.current.rotation.x += 0.01;
        // 浮动动画
        meshRef.current.position.y =
          props.position[1] + Math.sin(Date.now() * 0.003) * 0.5;
        positionRef.current.copy(meshRef.current.position);
      }
    },
  }));

  return (
    <mesh ref={meshRef} position={props.position} castShadow>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial
        color={getColor(props.type)}
        emissive={getColor(props.type)}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
});

Item.displayName = 'Item';
