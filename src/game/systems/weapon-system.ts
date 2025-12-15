import * as THREE from 'three';
import { state } from '../core/state';
import { Bullet } from '../entities/bullet';

/**
 * 武器系统
 * 管理射击冷却、子弹生成与特殊武器计时
 */
export class WeaponSystem {
  /**
   * 更新武器状态并处理射击请求
   * @param scene 场景对象
   * @param playerPos 玩家位置
   * @param aimDir 瞄准方向
   * @param bullets 子弹集合
   * @param trigger 是否触发射击
   */
  updateAndFire(
    scene: THREE.Scene,
    playerPos: THREE.Vector3,
    aimDir: THREE.Vector3 | null,
    bullets: Bullet[],
    trigger: boolean
  ) {
    // 1. 冷却倒计时
    if (state.weapon.cooldown > 0) state.weapon.cooldown--;

    // 2. 检查是否可射击
    if (!trigger || !aimDir || state.weapon.cooldown > 0) return;

    const origin = playerPos.clone();
    const type = state.weapon.type;

    // 3. 根据武器类型生成子弹
    if (type === 'shotgun') {
      // 霰弹枪：扇形发射5枚子弹
      for (let i = -2; i <= 2; i++) {
        const dir = aimDir.clone();
        const angle = i * 0.15;
        // 旋转向量计算
        const x = dir.x * Math.cos(angle) - dir.z * Math.sin(angle);
        const z = dir.x * Math.sin(angle) + dir.z * Math.cos(angle);
        dir.set(x, 0, z);
        bullets.push(new Bullet(scene, origin, dir, type));
      }
      state.weapon.cooldown = 45; // 较长冷却
    } else {
      // 手枪或加特林：单发
      bullets.push(new Bullet(scene, origin, aimDir, type));
      // 加特林射速极快
      state.weapon.cooldown = type === 'machinegun' ? 4 : 15;
    }

    // 4. 特殊武器持续时间递减
    if (type !== 'pistol') {
      state.weapon.timer--;
      // 时间耗尽重置为手枪
      if (state.weapon.timer <= 0) state.weapon.type = 'pistol';
    }
  }
}
