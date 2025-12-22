// 武器类型定义
export type WeaponType = 'pistol' | 'machinegun' | 'shotgun';

/**
 * 全局游戏状态对象
 * 存储分数、生命值、游戏进程标记与武器状态
 */
export const state = {
  score: 0,
  health: 100,
  gameStarted: false,
  gameOver: false,
  // 无敌状态相关
  invincible: false,
  invincibleTimer: 0, // 无敌时间剩余（毫秒）
  weapon: {
    type: 'pistol' as WeaponType,
    timer: 0, // 特殊武器剩余时间（帧）
    cooldown: 0, // 射击冷却计时（帧）
    maxCooldown: 15, // 当前武器的最大冷却时间
  },
  // 关卡系统相关
  level: {
    currentLevel: 1,
    levelCompleted: false,
    allLevelsCompleted: false,
  },
};

/**
 * 重置游戏状态
 * 在游戏重新开始时调用
 */
export function resetState() {
  state.score = 0;
  state.health = 100;
  state.gameStarted = false;
  state.gameOver = false;
  state.invincible = false;
  state.invincibleTimer = 0;
  state.weapon.type = 'pistol';
  state.weapon.timer = 0;
  state.weapon.cooldown = 0;
  state.weapon.maxCooldown = 15;
  state.level.currentLevel = 1;
  state.level.levelCompleted = false;
  state.level.allLevelsCompleted = false;
}
