import * as THREE from 'three';
import { CONFIG } from '../core/config';
import { Zombie } from '../entities/zombie';

/**
 * 丧尸系统
 * 管理丧尸生成、批量更新与行为驱动
 */
export class ZombieSystem {
  frame = 0;
  spawnRate = CONFIG.spawnRate;

  /**
   * 每一帧更新丧尸状态
   */
  update(scene: THREE.Scene, zombies: Zombie[], playerPos: THREE.Vector3) {
    this.frame++;

    // 1. 生成新丧尸
    if (this.frame % this.spawnRate === 0) {
      zombies.push(new Zombie(scene));
      // 随着时间推移，加快生成速度（增加难度）
      if (this.spawnRate > 10 && this.frame % 600 === 0) this.spawnRate -= 5;
    }

    // 2. 更新每只丧尸的行为与位置
    for (let i = zombies.length - 1; i >= 0; i--) {
      const z = zombies[i];
      // 应用群体行为（分离）与追踪行为
      z.applyBehaviors(zombies, playerPos);
      z.update();
    }
  }
}
