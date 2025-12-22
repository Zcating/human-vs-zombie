import { state } from './state';
import {
  type LevelConfig,
  getLevelConfig,
  getNextLevelConfig,
} from './level-config';
import { CONFIG } from './config';

/**
 * 关卡状态枚举
 */
export enum LevelState {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * 关卡管理器
 * 管理关卡进度、计时和完成条件
 */
export class LevelManager {
  private currentLevel: number = 1;
  private levelState: LevelState = LevelState.NOT_STARTED;
  private levelStartTime: number = 0;
  private levelElapsedTime: number = 0;
  private currentConfig: LevelConfig | undefined;

  constructor() {
    this.currentConfig = getLevelConfig(this.currentLevel);
  }

  /**
   * 开始当前关卡
   */
  startLevel(): void {
    if (!this.currentConfig) {
      console.warn('没有可用的关卡配置');
      return;
    }

    this.levelState = LevelState.IN_PROGRESS;
    this.levelStartTime = Date.now();
    this.levelElapsedTime = 0;

    // 应用关卡配置到游戏
    this.applyLevelConfig();

    console.log(`关卡 ${this.currentLevel} 开始: ${this.currentConfig.name}`);
  }

  /**
   * 更新关卡状态
   */
  update(): void {
    if (this.levelState !== LevelState.IN_PROGRESS) {
      return;
    }

    this.levelElapsedTime = (Date.now() - this.levelStartTime) / 1000;

    // 检查时间条件
    if (
      this.currentConfig &&
      this.levelElapsedTime >= this.currentConfig.duration
    ) {
      this.completeLevel();
    }
  }

  /**
   * 完成当前关卡
   */
  private completeLevel(): void {
    if (!this.currentConfig) return;

    this.levelState = LevelState.COMPLETED;

    // 计算奖励分数
    const timeBonus =
      Math.max(0, this.currentConfig.duration - this.levelElapsedTime) *
      this.currentConfig.timeBonusMultiplier;
    const totalBonus =
      this.currentConfig.completionBonus + Math.floor(timeBonus);

    state.score += totalBonus;

    console.log(`关卡 ${this.currentLevel} 完成！获得 ${totalBonus} 分奖励`);
  }

  /**
   * 失败当前关卡
   */
  failLevel(): void {
    this.levelState = LevelState.FAILED;
    console.log(`关卡 ${this.currentLevel} 失败`);
  }

  /**
   * 进入下一关卡
   */
  nextLevel(): boolean {
    const nextConfig = getNextLevelConfig(this.currentLevel);
    if (!nextConfig) {
      console.log('所有关卡已完成！');
      return false;
    }

    this.currentLevel++;
    this.currentConfig = nextConfig;
    this.levelState = LevelState.NOT_STARTED;
    return true;
  }

  /**
   * 重置到第一关
   */
  reset(): void {
    this.currentLevel = 1;
    this.currentConfig = getLevelConfig(this.currentLevel);
    this.levelState = LevelState.NOT_STARTED;
    this.levelStartTime = 0;
    this.levelElapsedTime = 0;
  }

  /**
   * 应用关卡配置到游戏参数
   */
  private applyLevelConfig(): void {
    if (!this.currentConfig) return;

    // 修改游戏配置
    CONFIG.spawnRate = this.currentConfig.zombieSpawnRate;
    CONFIG.maxZombies = this.currentConfig.maxZombies;
    CONFIG.zombieSpeed = 0.15 * this.currentConfig.zombieSpeedMultiplier;
    CONFIG.itemSpawnRate = this.currentConfig.itemSpawnRate;
  }

  /**
   * 获取当前关卡信息
   */
  getCurrentLevelInfo() {
    return {
      level: this.currentLevel,
      config: this.currentConfig,
      state: this.levelState,
      elapsedTime: this.levelElapsedTime,
      remainingTime: this.currentConfig
        ? Math.max(0, this.currentConfig.duration - this.levelElapsedTime)
        : 0,
    };
  }

  /**
   * 获取当前关卡号
   */
  getCurrentLevel(): number {
    return this.currentLevel;
  }

  /**
   * 获取关卡状态
   */
  getLevelState(): LevelState {
    return this.levelState;
  }

  /**
   * 是否正在进行关卡
   */
  isLevelInProgress(): boolean {
    return this.levelState === LevelState.IN_PROGRESS;
  }

  /**
   * 当前关卡是否已完成
   */
  isLevelCompleted(): boolean {
    return this.levelState === LevelState.COMPLETED;
  }

  /**
   * 获取剩余时间（秒）
   */
  getRemainingTime(): number {
    if (!this.currentConfig || this.levelState !== LevelState.IN_PROGRESS) {
      return 0;
    }
    return Math.max(0, this.currentConfig.duration - this.levelElapsedTime);
  }
}
