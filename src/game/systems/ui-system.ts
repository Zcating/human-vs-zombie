import { state } from '../core/state';

/**
 * UI 系统
 * 负责同步游戏状态（HP、分数、武器）到 DOM 界面
 */
export class UISystem {
  // UI 元素引用
  hpEl = document.getElementById('hp') as HTMLSpanElement | null;
  scoreEl = document.getElementById('score') as HTMLSpanElement | null;
  weaponNameEl = document.getElementById(
    'weaponName'
  ) as HTMLSpanElement | null;

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
  }
}
