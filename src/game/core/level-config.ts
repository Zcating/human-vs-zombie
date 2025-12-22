/**
 * 关卡配置接口
 */
export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  duration: number; // 关卡持续时间（秒）
  targetScore?: number; // 目标分数（可选）

  // 丧尸生成配置
  zombieSpawnRate: number; // 生成帧间隔
  maxZombies: number;
  zombieSpeedMultiplier: number; // 速度倍率
  zombieHealth: number; // 丧尸血量

  // 道具生成配置
  itemSpawnRate: number; // 生成帧间隔

  // 奖励配置
  completionBonus: number; // 完成奖励分数
  timeBonusMultiplier: number; // 时间奖励倍率
}

/**
 * 关卡配置数据
 * 每个关卡都有独特的挑战参数
 */
export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: '新手训练',
    description: '在60秒内生存下来',
    duration: 60,
    zombieSpawnRate: 120, // 每120帧生成一只
    maxZombies: 5,
    zombieSpeedMultiplier: 0.8,
    zombieHealth: 10, // 1点血量
    itemSpawnRate: 300,
    completionBonus: 100,
    timeBonusMultiplier: 2,
  },
  {
    id: 2,
    name: '街头求生',
    description: '在60秒内面对更多丧尸',
    duration: 60,
    zombieSpawnRate: 90, // 每90帧生成一只
    maxZombies: 8,
    zombieSpeedMultiplier: 1.0,
    zombieHealth: 20, // 2点血量
    itemSpawnRate: 250,
    completionBonus: 200,
    timeBonusMultiplier: 1.5,
  },
  {
    id: 3,
    name: '末日降临',
    description: '在60秒内面对丧尸潮',
    duration: 60,
    zombieSpawnRate: 60, // 每60帧生成一只
    maxZombies: 12,
    zombieSpeedMultiplier: 1.2,
    zombieHealth: 30, // 3点血量
    itemSpawnRate: 200,
    completionBonus: 300,
    timeBonusMultiplier: 1.2,
  },
  {
    id: 4,
    name: '无尽噩梦',
    description: '在60秒内面对最强丧尸群',
    duration: 60,
    zombieSpawnRate: 45, // 每45帧生成一只
    maxZombies: 15,
    zombieSpeedMultiplier: 1.5,
    zombieHealth: 50, // 5点血量
    itemSpawnRate: 150,
    completionBonus: 500,
    timeBonusMultiplier: 1.0,
  },
];

/**
 * 获取指定关卡配置
 */
export function getLevelConfig(levelId: number): LevelConfig | undefined {
  return LEVELS.find((level) => level.id === levelId);
}

/**
 * 获取所有关卡数量
 */
export function getTotalLevels(): number {
  return LEVELS.length;
}

/**
 * 获取下一关卡配置
 */
export function getNextLevelConfig(
  currentLevelId: number
): LevelConfig | undefined {
  return LEVELS.find((level) => level.id === currentLevelId + 1);
}
