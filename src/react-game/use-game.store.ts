import { create } from 'zustand';

interface LevelConfig {
  currentLevel: number;
  levelCompleted: boolean;
  allLevelsCompleted: boolean;
}

export type WeaponType = 'pistol' | 'machinegun' | 'shotgun';

interface WeaponConfig {
  type: WeaponType;
  // 特殊武器时间
  timer: number;
  // 射击冷却计时
  cooldown: number;
}

export interface GameState {
  score: number;
  health: number;
  gameStarted: boolean;
  gameOver: boolean;
  invincible: boolean;
  // 无敌时间剩余（毫秒）
  invincibleTimer: number;
  level: LevelConfig;
  weapon: WeaponConfig;
  // 丧尸数量
  zombieCount: number;
}

export interface GameAction {
  // 开始游戏
  startGame: () => void;
  // 游戏结束
  endGame: () => void;
  // 更新丧尸数量
  updateZombieCount: (count: number) => void;
  // 玩家得分
  playerScored: (points: number) => void;
  // 玩家健康值设置
  playerHealth: (health: number) => void;
  // 切换武器
  switchWeapon: (weaponType: WeaponType) => void;
  // 更新武器冷却时间
  updateWeaponCooldown: () => void;
  // 更新武器特殊时间
  updateWeaponTimer: () => void;
}

const initGameState: GameState = {
  score: 0,
  health: 100,
  gameStarted: false,
  gameOver: false,
  // 无敌状态相关
  invincible: false,
  invincibleTimer: 0, // 无敌时间剩余（毫秒）
  zombieCount: 0,
  weapon: {
    type: 'pistol' as WeaponType,
    timer: 0, // 特殊武器剩余时间（帧）
    cooldown: 15, // 射击冷却计时
  },
  // 关卡系统相关
  level: {
    currentLevel: 1,
    levelCompleted: false,
    allLevelsCompleted: false,
  },
};

export const useGameStore = create<GameState & GameAction>((set) => ({
  ...initGameState,
  // 游戏开始
  startGame: () => set({ gameStarted: true }),
  // 游戏结束
  endGame: () => set({ gameOver: true }),
  // 更新丧尸数量
  updateZombieCount: (count: number) => set({ zombieCount: count }),
  // 玩家得分
  playerScored: (points: number) =>
    set((state) => ({ score: state.score + points })),
  // 玩家健康值设置
  playerHealth: (health: number) => set({ health }),
  // 切换武器
  switchWeapon: (weaponType: WeaponType) =>
    set({ weapon: { ...initGameState.weapon, type: weaponType } }),
  // 更新武器冷却时间
  updateWeaponCooldown: () =>
    set((state) => ({
      weapon: { ...state.weapon, cooldown: state.weapon.cooldown - 1 },
    })),
  // 更新武器特殊时间
  updateWeaponTimer: () =>
    set((state) => ({
      weapon: { ...state.weapon, timer: state.weapon.timer - 1 },
    })),
}));
