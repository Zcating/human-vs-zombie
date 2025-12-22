import * as THREE from 'three';
import { state } from '../core/state';
import { CONFIG } from '../core/config';

/**
 * 无敌状态类型
 */
export enum InvincibleState {
  NORMAL = 'NORMAL',
  INVINCIBLE = 'INVINCIBLE',
  BLINKING = 'BLINKING',
}

/**
 * 无敌系统
 * 管理玩家的无敌状态、闪烁效果和倒计时
 */
export class InvincibleSystem {
  private state: InvincibleState = InvincibleState.NORMAL;
  private remainingTime: number = 0; // 剩余无敌时间（毫秒）
  private blinkInterval: number = 100; // 闪烁间隔（毫秒）
  private lastBlinkTime: number = 0;
  private isVisible: boolean = true;

  /**
   * 触发无敌状态
   * @param duration 无敌持续时间（毫秒）
   */
  activateInvincible(duration: number = CONFIG.invincibleTime): void {
    this.state = InvincibleState.INVINCIBLE;
    this.remainingTime = duration;
    this.lastBlinkTime = Date.now();
    this.isVisible = true;

    // 更新全局状态
    state.invincible = true;
    state.invincibleTimer = duration;
  }

  /**
   * 更新无敌状态
   * @param dt 时间增量（秒）
   */
  update(dt: number): void {
    if (this.state === InvincibleState.NORMAL) {
      return;
    }

    // 更新剩余时间
    this.remainingTime -= dt * 1000;

    if (this.remainingTime <= 0) {
      this.deactivateInvincible();
      return;
    }

    // 更新全局状态
    state.invincibleTimer = this.remainingTime;

    // 处理闪烁效果
    this.updateBlinking();
  }

  /**
   * 更新闪烁效果
   */
  private updateBlinking(): void {
    const currentTime = Date.now();
    const timeSinceLastBlink = currentTime - this.lastBlinkTime;

    if (timeSinceLastBlink >= this.blinkInterval) {
      this.isVisible = !this.isVisible;
      this.lastBlinkTime = currentTime;
    }

    // 根据可见性设置状态
    this.state = this.isVisible
      ? InvincibleState.INVINCIBLE
      : InvincibleState.BLINKING;
  }

  /**
   * 取消无敌状态
   */
  private deactivateInvincible(): void {
    this.state = InvincibleState.NORMAL;
    this.remainingTime = 0;
    this.isVisible = true;

    // 更新全局状态
    state.invincible = false;
    state.invincibleTimer = 0;
  }

  /**
   * 检查是否处于无敌状态
   */
  isInvincible(): boolean {
    return this.state !== InvincibleState.NORMAL;
  }

  /**
   * 检查是否可见（用于闪烁效果）
   */
  getVisibility(): boolean {
    return this.isVisible;
  }

  /**
   * 获取剩余无敌时间（毫秒）
   */
  getRemainingTime(): number {
    return Math.max(0, this.remainingTime);
  }

  /**
   * 获取当前状态
   */
  getState(): InvincibleState {
    return this.state;
  }

  /**
   * 重置系统
   */
  reset(): void {
    this.deactivateInvincible();
  }

  /**
   * 检查是否应该应用伤害（考虑无敌状态）
   * @returns 是否应该忽略伤害
   */
  shouldIgnoreDamage(): boolean {
    return this.isInvincible();
  }

  /**
   * 获取UI显示文本
   */
  getDisplayText(): string {
    if (this.state === InvincibleState.NORMAL) {
      return '';
    }

    const seconds = Math.ceil(this.remainingTime / 1000);
    return `无敌 ${seconds}s`;
  }

  /**
   * 获取UI显示颜色
   */
  getDisplayColor(): string {
    switch (this.state) {
      case InvincibleState.INVINCIBLE:
        return '#00ff00'; // 绿色
      case InvincibleState.BLINKING:
        return '#ffff00'; // 黄色
      default:
        return '#ffffff'; // 白色
    }
  }
}
