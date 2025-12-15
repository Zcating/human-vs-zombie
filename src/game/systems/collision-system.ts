import { Bullet } from '../entities/bullet';
import { Zombie } from '../entities/zombie';
import { state } from '../core/state';
import * as THREE from 'three';

/**
 * 碰撞系统
 * 处理子弹与丧尸的碰撞检测
 */
export class CollisionSystem {
  /**
   * 更新碰撞状态
   * 遍历所有子弹与丧尸检测距离
   */
  update(scene: THREE.Scene, bullets: Bullet[], zombies: Zombie[]) {
    // 逆序遍历子弹，以便安全移除
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.update();

      // 移除生命周期结束的子弹
      if (!b.alive) {
        scene.remove(b.mesh);
        bullets.splice(i, 1);
        continue;
      }

      // 检测与所有丧尸的碰撞
      for (let j = zombies.length - 1; j >= 0; j--) {
        const z = zombies[j];
        // 简单距离判定 (< 2.0)
        if (b.position.distanceTo(z.position) < 2.0) {
          // 移除丧尸
          scene.remove(z.mesh);
          zombies.splice(j, 1);

          // 移除子弹
          scene.remove(b.mesh);
          bullets.splice(i, 1);
          b.alive = false;

          // 增加得分
          state.score += 10;
          break; // 子弹击中一个目标后销毁
        }
      }
    }
  }
}
