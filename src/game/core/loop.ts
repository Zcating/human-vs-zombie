// 更新回调函数类型，dt 为两帧间隔时间（秒）
type Update = (dt: number) => void;

/**
 * 游戏主循环类
 * 封装 requestAnimationFrame，提供基于时间的更新回调
 */
export class Loop {
  private last = 0; // 上一帧的时间戳
  private rafId = 0; // requestAnimationFrame ID
  private running = false; // 运行状态标记
  private update: Update; // 更新逻辑回调

  constructor(update: Update) {
    this.update = update;
  }

  /**
   * 启动循环
   */
  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();

    const tick = (t: number) => {
      if (!this.running) return;
      // 计算时间增量（秒）
      const dt = (t - this.last) / 1000;
      this.last = t;
      // 执行更新逻辑
      this.update(dt);
      // 请求下一帧
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  /**
   * 停止循环
   */
  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
