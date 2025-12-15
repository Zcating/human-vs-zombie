import * as THREE from 'three';
import { CONFIG } from '../core/config';

/**
 * 玩家实体类
 * 包含几何体、材质以及移动/旋转逻辑
 */
export class Player {
  mesh: THREE.Mesh; // 玩家主网格
  gunMat: THREE.MeshBasicMaterial; // 枪支材质（随武器变色）
  velocity = new THREE.Vector3(); // 当前速度向量

  constructor(scene: THREE.Scene) {
    // 1. 创建玩家身体 (蓝色方块)
    const geo = new THREE.BoxGeometry(2, 2, 2);
    const mat = new THREE.MeshLambertMaterial({ color: 0x0088ff });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.y = 1;
    this.mesh.castShadow = true;

    // 2. 创建枪支部件
    const gunGeo = new THREE.BoxGeometry(0.5, 0.5, 2.5);
    this.gunMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const gun = new THREE.Mesh(gunGeo, this.gunMat);
    gun.position.set(0.8, 0, 1.5); // 设置枪支相对身体的位置
    this.mesh.add(gun);

    // 3. 添加到场景
    scene.add(this.mesh);
  }

  /**
   * 更新玩家状态
   * @param move 移动意图向量
   * @param look 瞄准目标点
   * @param camera 跟随相机
   */
  update(
    move: THREE.Vector3,
    look: THREE.Vector3 | null,
    camera: THREE.PerspectiveCamera
  ) {
    // 1. 计算速度与位置
    this.velocity.set(0, 0, 0);
    this.velocity.x = move.x * CONFIG.playerSpeed;
    this.velocity.z = move.z * CONFIG.playerSpeed;
    this.mesh.position.add(this.velocity);

    // 2. 限制在世界范围内
    const limit = CONFIG.worldLimit;
    this.mesh.position.x = Math.max(
      -limit,
      Math.min(limit, this.mesh.position.x)
    );
    this.mesh.position.z = Math.max(
      -limit,
      Math.min(limit, this.mesh.position.z)
    );

    // 3. 旋转朝向瞄准点
    if (look) this.mesh.lookAt(look.x, 1, look.z);

    // 4. 更新相机跟随位置（平滑插值）
    const targetCamPos = this.mesh.position
      .clone()
      .add(new THREE.Vector3(0, CONFIG.camHeight, CONFIG.camDist));
    camera.position.lerp(targetCamPos, 0.15);
    camera.lookAt(this.mesh.position);
  }
}
