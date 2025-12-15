import * as THREE from 'three';
import { CONFIG } from '../core/config';

/**
 * 子弹实体类
 */
export class Bullet {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  mesh: THREE.Mesh;
  alive = true; // 存活标记
  life = 80; // 生命周期（帧数）

  constructor(
    scene: THREE.Scene,
    origin: THREE.Vector3,
    dir: THREE.Vector3,
    type: string
  ) {
    this.position = origin.clone();
    this.velocity = dir.clone().normalize().multiplyScalar(CONFIG.bulletSpeed);

    // 根据武器类型设置子弹样式
    let color = 0xffff00;
    let size = 0.3;
    if (type === 'machinegun') {
      color = 0x00d2ff;
      size = 0.25;
    }
    if (type === 'shotgun') {
      color = 0xffaa00;
      size = 0.25;
    }

    const geo = new THREE.SphereGeometry(size, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(this.position);
    scene.add(this.mesh);
  }

  /**
   * 更新子弹位置与生命周期
   */
  update() {
    this.position.add(this.velocity);
    this.mesh.position.copy(this.position);
    this.life--;
    // 生命周期结束标记为死亡
    if (this.life <= 0) this.alive = false;
  }
}
