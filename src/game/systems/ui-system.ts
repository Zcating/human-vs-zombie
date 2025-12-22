import { state } from '../core/state';
import { LevelManager } from '../core/level-manager';
import { InvincibleSystem } from './invincible-system';

/**
 * UI 系统
 * 负责同步游戏状态（HP、分数、武器、关卡、无敌状态）到 DOM 界面
 */
export class UISystem {
  // UI 元素引用
  hpEl = document.getElementById('hp') as HTMLSpanElement | null;
  scoreEl = document.getElementById('score') as HTMLSpanElement | null;
  weaponNameEl = document.getElementById(
    'weaponName'
  ) as HTMLSpanElement | null;
  levelEl = document.getElementById('level') as HTMLSpanElement | null;
  levelTimerEl = document.getElementById(
    'levelTimer'
  ) as HTMLSpanElement | null;
  invincibleEl = document.getElementById(
    'invincible'
  ) as HTMLSpanElement | null;

  constructor(
    private levelManager?: LevelManager,
    private invincibleSystem?: InvincibleSystem
  ) {
    //
  }

  /**
   * 每一帧调用，刷新 UI 显示
   */
  update() {
    // 1. 更新武器名称与倒计时
    if (this.weaponNameEl) {
      let tName = 'Pistol';
      let color = '#fff';

      // 根据武器类型设置名称与颜色
      if (state.weapon.type === 'machinegun') {
        tName = 'Minigun';
        color = '#00d2ff';
      }
      if (state.weapon.type === 'shotgun') {
        tName = 'Shotgun';
        color = '#ffff00';
      }

      // 如果是特殊武器，显示剩余时间
      if (state.weapon.type !== 'pistol') {
        tName += ` (${Math.ceil(state.weapon.timer / 60)}s)`;
      }

      this.weaponNameEl.innerText = tName;
      this.weaponNameEl.style.color = color;
    }

    // 2. 更新生命值（低血量变红）
    if (this.hpEl) {
      this.hpEl.innerText = String(state.health);
      this.hpEl.style.color = state.health < 30 ? 'red' : '#0f0';
    }

    // 3. 更新分数
    if (this.scoreEl) this.scoreEl.innerText = String(state.score);

    // 4. 更新关卡信息
    if (this.levelEl) {
      this.levelEl.innerText = `关卡 ${state.level.currentLevel}`;
    }

    // 5. 更新关卡倒计时
    if (this.levelTimerEl && this.levelManager) {
      const remainingTime = this.levelManager.getRemainingTime();
      if (remainingTime > 0) {
        this.levelTimerEl.innerText = `剩余时间: ${Math.ceil(remainingTime)}s`;
        this.levelTimerEl.style.color = remainingTime < 10 ? 'red' : '#fff';
      } else {
        this.levelTimerEl.innerText = '';
      }
    }

    // 6. 更新无敌状态
    if (this.invincibleEl && this.invincibleSystem) {
      const invincibleText = this.invincibleSystem.getDisplayText();
      if (invincibleText) {
        this.invincibleEl.innerText = invincibleText;
        this.invincibleEl.style.color = this.invincibleSystem.getDisplayColor();
        this.invincibleEl.style.display = 'block';
      } else {
        this.invincibleEl.style.display = 'none';
      }
    }
  }
}
