type Vec2 = { x: number; y: number };

/**
 * 移动端触控控制器
 * 管理虚拟摇杆与开火按钮的触摸事件
 */
export class MobileControls {
  // DOM 元素引用
  private zone = document.getElementById(
    'joystick-zone'
  ) as HTMLDivElement | null;
  private stick = document.getElementById(
    'joystick-stick'
  ) as HTMLDivElement | null;
  private fireBtn = document.getElementById(
    'fire-btn'
  ) as HTMLDivElement | null;

  private stickId: number | null = null; // 当前控制摇杆的触摸点 ID
  private vec: Vec2 = { x: 0, y: 0 }; // 摇杆输出向量 (-1 到 1)
  private firing = false; // 是否正在按住开火按钮

  constructor() {
    if (!this.zone || !this.stick) return;

    // --- 摇杆触摸事件绑定 ---
    this.zone.addEventListener(
      'touchstart',
      (e) => {
        const touch = (e as TouchEvent).changedTouches[0];
        this.stickId = touch.identifier;
        this.updateStick(touch);
      },
      { passive: false }
    );

    this.zone.addEventListener(
      'touchmove',
      (e) => {
        const te = e as TouchEvent;
        for (let i = 0; i < te.changedTouches.length; i++) {
          if (te.changedTouches[i].identifier === this.stickId) {
            this.updateStick(te.changedTouches[i]);
            break;
          }
        }
      },
      { passive: false }
    );

    this.zone.addEventListener('touchend', (e) => {
      const te = e as TouchEvent;
      for (let i = 0; i < te.changedTouches.length; i++) {
        if (te.changedTouches[i].identifier === this.stickId) {
          // 重置摇杆状态
          this.stickId = null;
          if (this.stick) this.stick.style.transform = `translate(0px, 0px)`;
          this.vec = { x: 0, y: 0 };
          break;
        }
      }
    });

    // --- 开火按钮触摸事件绑定 ---
    if (this.fireBtn) {
      this.fireBtn.addEventListener(
        'touchstart',
        (_e) => {
          this.firing = true;
          // 按下时的视觉反馈
          this.fireBtn!.style.background = 'rgba(255, 50, 50, 0.8)';
          this.fireBtn!.style.transform = 'scale(0.9)';
        },
        { passive: false }
      );

      this.fireBtn.addEventListener(
        'touchend',
        (_e) => {
          this.firing = false;
          // 抬起时恢复样式
          this.fireBtn!.style.background = 'rgba(255, 50, 50, 0.4)';
          this.fireBtn!.style.transform = 'scale(1)';
        },
        { passive: false }
      );
    }
  }

  /**
   * 更新摇杆位置与向量计算
   */
  private updateStick(touch: Touch) {
    if (!this.zone || !this.stick) return;
    const rect = this.zone.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // 计算触摸点相对于中心的位置
    let x = touch.clientX - cx;
    let y = touch.clientY - cy;
    const r = rect.width / 2;
    const d = Math.sqrt(x * x + y * y);

    // 限制摇杆在圆圈范围内
    if (d > r) {
      x = (x / d) * r;
      y = (y / d) * r;
    }

    // 更新 DOM 位置
    this.stick.style.transform = `translate(${x}px, ${y}px)`;

    // 归一化输出向量
    this.vec.x = x / r;
    this.vec.y = y / r;
  }

  /**
   * 获取摇杆方向向量
   */
  getVector(): Vec2 {
    return this.vec;
  }

  /**
   * 获取开火按钮状态
   */
  isFiring(): boolean {
    return this.firing;
  }
}
