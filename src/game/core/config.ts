import { isMobile } from '../../game/platform/device';

/**
 * 游戏核心配置参数
 * 包含速度、生成率、相机设置等常量
 */
export const CONFIG = {
  // 玩家移动速度，移动端稍慢以适应触控
  playerSpeed: isMobile ? 0.6 : 0.9,

  // 丧尸移动速度
  zombieSpeed: 0.15,

  // 丧尸最大转向力（用于分离和追踪行为）
  zombieMaxForce: 0.05,

  // 丧尸生成帧间隔（每多少帧生成一只）
  spawnRate: 60,

  // 道具生成帧间隔
  itemSpawnRate: 300,

  // 丧尸群分离距离（避免重叠）
  separationDist: 3,

  // 子弹飞行速度
  bulletSpeed: 2.2,

  // 相机高度，移动端视角稍高
  camHeight: isMobile ? 80 : 60,

  // 相机距离，移动端稍远
  camDist: isMobile ? 45 : 35,

  // 世界边界限制（玩家移动范围）
  worldLimit: 95,

  // 受伤后无敌时间（毫秒）
  invincibleTime: 2000,
};
