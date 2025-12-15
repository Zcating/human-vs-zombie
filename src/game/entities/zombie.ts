import * as THREE from 'three';
import { CONFIG } from '../core/config';
import enemyImg from '../../assets/enermy_attack.png';

// 静态加载纹理
const loader = new THREE.TextureLoader();
const texture = loader.load(enemyImg);

/**
 * 丧尸实体类
 * 具有自主移动行为（追踪与分离）
 */
export class Zombie {
  position = new THREE.Vector3();
  velocity = new THREE.Vector3();
  acceleration = new THREE.Vector3();
  mesh: THREE.Sprite; // 使用 Sprite 替代 Mesh

  constructor(scene: THREE.Scene) {
    // 随机生成位置（圆形分布）
    const angle = Math.random() * Math.PI * 2;
    const radius = 90 + Math.random() * 30;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    // 调整 Y 轴，确保 Sprite 底部贴地
    // 假设 Sprite 高度为 8，中心点在 (0.5, 0.5)，则 position.y 需要设为 4
    this.position.set(x, 4, z);

    // 创建 Sprite 材质
    const mat = new THREE.SpriteMaterial({
      map: texture,
      color: 0xffffff,
      transparent: true,
    });

    // 创建 Sprite
    this.mesh = new THREE.Sprite(mat);
    // 设置 Sprite 尺寸 (根据图片比例调整，这里暂设为 8x8)
    this.mesh.scale.set(8, 8, 1);

    this.mesh.position.copy(this.position);
    scene.add(this.mesh);
  }

  /**
   * 计算追踪行为力（朝向目标移动）
   */
  seek(target: THREE.Vector3) {
    const desired = new THREE.Vector3().subVectors(target, this.position);
    desired.normalize();
    desired.multiplyScalar(CONFIG.zombieSpeed);
    const steer = new THREE.Vector3().subVectors(desired, this.velocity);
    steer.clampLength(0, CONFIG.zombieMaxForce);
    return steer;
  }

  /**
   * 计算分离行为力（避免重叠）
   */
  separate(zombies: Zombie[]) {
    const sum = new THREE.Vector3();
    let count = 0;
    for (const other of zombies) {
      if (other === this) continue;
      const d = this.position.distanceTo(other.position);
      // 如果距离小于设定的分离阈值
      if (d > 0 && d < CONFIG.separationDist) {
        const diff = new THREE.Vector3().subVectors(
          this.position,
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
      sum.sub(this.velocity);
      sum.clampLength(0, CONFIG.zombieMaxForce);
    }
    return sum;
  }

  /**
   * 应用所有行为力
   */
  applyBehaviors(zombies: Zombie[], playerPos: THREE.Vector3) {
    const separate = this.separate(zombies);
    const seek = this.seek(playerPos);

    // 加权合并行为力
    separate.multiplyScalar(2.5); // 分离权重更高，避免穿模
    seek.multiplyScalar(1.0);

    this.acceleration.add(separate);
    this.acceleration.add(seek);
  }

  /**
   * 更新物理状态
   */
  update() {
    this.velocity.add(this.acceleration);
    this.velocity.clampLength(0, CONFIG.zombieSpeed);
    this.position.add(this.velocity);
    this.acceleration.set(0, 0, 0); // 重置加速度

    this.mesh.position.copy(this.position);

    // Sprite 默认永远朝向摄像机，无需调用 lookAt
    // 只需要更新位置即可
  }
}
