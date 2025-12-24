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
  // 子弹数量 (null 表示无限)
  ammo: number | null;
  // 备弹
  reserveAmmo: number;
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
  // 当前持有武器
  weapon: WeaponConfig;
  // 拥有的武器列表
  inventory: WeaponType[];
  // 各武器弹药状态
  ammo: Record<WeaponType, number>;
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
  // 获得武器
  addWeapon: (weaponType: WeaponType) => void;
  // 消耗弹药
  consumeAmmo: () => void;
  // 增加弹药
  addAmmo: (weaponType: WeaponType, amount: number) => void;
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
    ammo: null, // 无限弹药
    reserveAmmo: 0,
  },
  inventory: ['pistol'],
  ammo: {
    pistol: 9999,
    machinegun: 60,
    shotgun: 20,
  },
  // 关卡系统相关
  level: {
    currentLevel: 1,
    levelCompleted: false,
    allLevelsCompleted: false,
  },
};

export const useGameStore = create<GameState & GameAction>((set, get) => ({
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
  switchWeapon: (weaponType: WeaponType) => {
    const state = get();
    if (!state.inventory.includes(weaponType)) {
      return;
    }

    set({
      weapon: {
        ...state.weapon,
        type: weaponType,
        ammo: weaponType === 'pistol' ? null : state.ammo[weaponType],
      },
    });
  },
  // 获得武器
  addWeapon: (weaponType: WeaponType) => {
    const state = get();
    if (!state.inventory.includes(weaponType)) {
      set({ inventory: [...state.inventory, weaponType] });
    }
    // 增加对应弹药
    const addAmount = weaponType === 'machinegun' ? 60 : 20;
    get().addAmmo(weaponType, addAmount);
  },
  // 消耗弹药
  consumeAmmo: () => {
    const state = get();
    const currentWeapon = state.weapon.type;
    if (currentWeapon === 'pistol') return; // 手枪无限子弹

    const currentAmmo = state.ammo[currentWeapon];
    if (currentAmmo > 0) {
      const newAmmo = currentAmmo - 1;
      set({
        ammo: { ...state.ammo, [currentWeapon]: newAmmo },
        weapon: { ...state.weapon, ammo: newAmmo },
      });
    }
  },
  // 增加弹药
  addAmmo: (weaponType: WeaponType, amount: number) => {
    const state = get();
    const newAmmo = state.ammo[weaponType] + amount;
    set({
      ammo: { ...state.ammo, [weaponType]: newAmmo },
      weapon: {
        ...state.weapon,
        ammo: state.weapon.type === weaponType ? newAmmo : state.weapon.ammo,
      },
    });
  },
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
