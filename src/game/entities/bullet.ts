import * as THREE from 'three';
import { CONFIG } from '../core/config';

type BulletType = 'pistol' | 'machinegun' | 'shotgun';
/**
 * 子弹类型配置
 */
interface BulletConfig {
  color: number;
  size: number;
  name: string;
}

/**
 * 子弹配置映射
 */
const BULLET_CONFIGS: Record<BulletType, BulletConfig> = {
  pistol: {
    color: 0x000,
    size: 0.5,
    name: '手枪子弹',
  },
  machinegun: {
    color: 0x00d2ff,
    size: 0.5,
    name: '机枪子弹',
  },
  shotgun: {
    color: 0xffaa00,
    size: 0.9,
    name: '霰弹枪子弹',
  },
};

/**
 * 子弹实体类
 * 支持通过配置扩展新的子弹类型
 */
export class Bullet {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  mesh: THREE.Mesh;
  alive = true; // 存活标记
  life = 80; // 生命周期（帧数）
  type: BulletType; // 子弹类型

  constructor(
    scene: THREE.Scene,
    origin: THREE.Vector3,
    dir: THREE.Vector3,
    type: BulletType
  ) {
    this.position = origin.clone();
    this.velocity = dir.clone().normalize().multiplyScalar(CONFIG.bulletSpeed);
    this.type = type;

    // 获取子弹配置，默认为手枪配置
    const config = BULLET_CONFIGS[type] || BULLET_CONFIGS.pistol;

    // 创建子弹几何体和材质
    const geo = new THREE.SphereGeometry(config.size, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color: config.color });
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
