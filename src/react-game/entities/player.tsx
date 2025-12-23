import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { CONFIG } from '../../game/core/config';

export interface PlayerRef {
  mesh: THREE.Mesh;
  gunMat: THREE.MeshBasicMaterial;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  update: (move: THREE.Vector3, look: THREE.Vector3 | null) => void;
}

interface PlayerProps {
  position?: [number, number, number];
  onPositionChange?: (position: THREE.Vector3) => void;
}

/**
 * React-three-fiber 玩家组件
 * 包含玩家几何体、材质以及移动/旋转逻辑
 */
export const Player = forwardRef<PlayerRef, PlayerProps>((props, ref) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const velocityRef = useRef(new THREE.Vector3());
  const positionRef = useRef(new THREE.Vector3());
  const gunMatRef = useRef<THREE.MeshBasicMaterial>(null!);

  // 创建玩家几何体和材质
  const playerGeometry = new THREE.BoxGeometry(2, 2, 2);
  const playerMaterial = new THREE.MeshLambertMaterial({ color: 0x0088ff });

  // 创建枪支几何体和材质
  const gunGeometry = new THREE.BoxGeometry(0.5, 0.5, 2.5);
  const gunMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
  gunMatRef.current = gunMaterial;

  // 暴露给父组件的接口
  useImperativeHandle(ref, () => ({
    mesh: meshRef.current,
    gunMat: gunMatRef.current,
    position: positionRef.current,
    velocity: velocityRef.current,
    update: (move: THREE.Vector3, look: THREE.Vector3 | null) => {
      updatePlayer(move, look);
    },
  }));

  /**
   * 更新玩家状态
   */
  const updatePlayer = (move: THREE.Vector3, look: THREE.Vector3 | null) => {
    if (!meshRef.current) return;

    // 1. 计算速度与位置
    velocityRef.current.set(0, 0, 0);
    velocityRef.current.x = move.x * CONFIG.playerSpeed;
    velocityRef.current.z = move.z * CONFIG.playerSpeed;

    // 更新位置
    meshRef.current.position.add(velocityRef.current);
    positionRef.current.copy(meshRef.current.position);

    // 2. 限制在世界范围内
    const limit = CONFIG.worldLimit;
    meshRef.current.position.x = Math.max(
      -limit,
      Math.min(limit, meshRef.current.position.x)
    );
    meshRef.current.position.z = Math.max(
      -limit,
      Math.min(limit, meshRef.current.position.z)
    );

    // 3. 旋转朝向瞄准点
    if (look) {
      meshRef.current.lookAt(look.x, 1, look.z);
    }

    // 4. 触发位置变化回调
    if (props.onPositionChange) {
      props.onPositionChange(meshRef.current.position);
    }
  };

  return (
    <group>
      {/* 玩家主体 */}
      <mesh
        ref={meshRef}
        geometry={playerGeometry}
        material={playerMaterial}
        position={props.position || [0, 1, 0]}
        castShadow
      >
        {/* 枪支部件 */}
        <mesh
          geometry={gunGeometry}
          material={gunMaterial}
          position={[0.8, 0, 1.5]}
        />
      </mesh>
    </group>
  );
});

Player.displayName = 'Player';
