import * as THREE from 'three';
import { CONFIG } from '../core/config';
import { Item } from '../entities/item';
import { state } from '../core/state';

/**
 * 道具系统
 * 管理道具生成、拾取逻辑以及对玩家状态的影响
 */
export class ItemSystem {
  frame = 0;

  /**
   * 更新道具状态与检测拾取
   * @param scene 场景对象
   * @param items 道具列表
   * @param playerPos 玩家位置
   * @param playerGunMat 玩家枪支材质（用于切换武器颜色）
   */
  update(
    scene: THREE.Scene,
    items: Item[],
    playerPos: THREE.Vector3,
    playerGunMat: THREE.MeshBasicMaterial
  ) {
    this.frame++;

    // 1. 定时生成道具
    if (this.frame % CONFIG.itemSpawnRate === 0) items.push(new Item(scene));

    // 2. 遍历道具更新动画与检测拾取
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      item.update();

      // 拾取距离判定 (< 3.0)
      if (playerPos.distanceTo(item.position) < 3.0) {
        // 根据道具类型应用效果
        if (item.type === 'health') {
          // 医疗包：恢复生命值
          state.health = Math.min(100, state.health + 30);
        } else if (item.type === 'machinegun') {
          // 加特林：高射速，持续 600 帧
          state.weapon.type = 'machinegun';
          state.weapon.timer = 600;
          playerGunMat.color.setHex(0x00d2ff);
        } else if (item.type === 'shotgun') {
          // 霰弹枪：扇形攻击，持续 600 帧
          state.weapon.type = 'shotgun';
          state.weapon.timer = 600;
          playerGunMat.color.setHex(0xffff00);
        }

        // 移除被拾取的道具
        scene.remove(item.mesh);
        items.splice(i, 1);
      }
    }
  }
}
