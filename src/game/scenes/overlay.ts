/**
 * 游戏覆盖层管理类
 * 控制开始界面、游戏结束界面的显示与交互
 */
export class Overlay {
  // DOM 元素引用
  private container: HTMLDivElement;
  private statusText: HTMLHeadingElement;
  private loadingTips: HTMLDivElement;
  private pcTips: HTMLDivElement;
  private mobileTips: HTMLDivElement;
  private actionBtn: HTMLButtonElement;

  // 开始按钮点击回调
  onStart?: () => void;

  constructor() {
    // 1. 创建容器
    this.container = document.createElement('div');
    this.container.id = 'overlay';

    // 2. 创建状态文本
    this.statusText = document.createElement('h2');
    this.statusText.id = 'statusText';
    this.statusText.innerText = '正在加载资源...';
    this.container.appendChild(this.statusText);

    // 3. 创建加载提示
    this.loadingTips = document.createElement('div');
    this.loadingTips.id = 'loadingTips';
    this.loadingTips.style.cssText =
      'font-size:12px; color:#aaa; margin-top:10px; line-height: 1.6;';
    this.loadingTips.innerHTML = `
      <span style="color:#ff3333">■ 急救</span> &nbsp;
      <span style="color:#00d2ff">◆ 加特林</span> &nbsp;
      <span style="color:#ffff00">▲ 霰弹</span>
    `;
    this.container.appendChild(this.loadingTips);

    // 4. PC 提示
    this.pcTips = document.createElement('div');
    this.pcTips.id = 'pc-tips';
    this.pcTips.style.cssText = 'font-size:12px; color:#666; margin-top:10px;';
    this.pcTips.innerText = 'PC: WASD移动, 鼠标射击';
    this.container.appendChild(this.pcTips);

    // 5. Mobile 提示
    this.mobileTips = document.createElement('div');
    this.mobileTips.id = 'mobile-tips';
    this.mobileTips.style.cssText =
      'display:none; font-size:12px; color:#00d2ff; margin-top:10px;';
    this.mobileTips.innerHTML =
      '左侧摇杆移动，右侧按钮射击<br>(自动锁定最近敌人)';
    this.container.appendChild(this.mobileTips);

    // 6. 按钮
    this.actionBtn = document.createElement('button');
    this.actionBtn.id = 'actionBtn';
    this.actionBtn.style.display = 'none';
    this.actionBtn.innerText = 'START GAME';
    this.actionBtn.onclick = () => {
      if (this.onStart) this.onStart();
    };
    this.container.appendChild(this.actionBtn);

    // 挂载到 body
    document.body.appendChild(this.container);
  }

  /**
   * 资源就绪状态
   * 显示开始按钮
   */
  ready() {
    this.statusText.innerText = '准备就绪';
    this.statusText.style.color = '#0f0';
    this.actionBtn.style.display = 'inline-block';
    this.actionBtn.innerText = 'START GAME';
    // 重新绑定点击事件（虽然构造函数已绑定，但为了逻辑清晰保留）
    this.actionBtn.onclick = () => {
      if (this.onStart) this.onStart();
    };
  }

  /**
   * 隐藏覆盖层（进入游戏）
   */
  hide() {
    this.container.style.display = 'none';
  }

  /**
   * 切换设备提示显示
   * @param isMobile 是否为移动设备
   */
  setMobileMode(isMobile: boolean) {
    if (isMobile) {
      this.mobileTips.style.display = 'block';
      this.pcTips.style.display = 'none';
    } else {
      this.mobileTips.style.display = 'none';
      this.pcTips.style.display = 'block'; // 默认 block
    }
  }

  /**
   * 显示游戏结束界面
   * @param score 最终得分
   */
  showGameOver(score: number) {
    this.container.style.display = 'block';
    this.statusText.innerText = 'GAME OVER';
    this.statusText.style.color = '#ff3333';

    // 显示最终得分
    this.loadingTips.innerHTML = `Final Score: <span style="color:#fff; font-size:24px">${score}</span>`;

    // 隐藏操作提示
    this.pcTips.style.display = 'none';
    this.mobileTips.style.display = 'none';

    // 显示重试按钮
    this.actionBtn.innerText = 'TRY AGAIN';
    this.actionBtn.onclick = () => location.reload();
  }

  /**
   * 显示关卡完成界面
   * @param level 关卡号
   * @param score 当前得分
   * @param onNext 下一关回调
   */
  showLevelComplete(level: number, score: number, onNext: () => void) {
    this.container.style.display = 'block';
    this.statusText.innerText = `关卡 ${level} 完成！`;
    this.statusText.style.color = '#0f0';

    // 显示得分
    this.loadingTips.innerHTML = `当前得分: <span style="color:#fff; font-size:24px">${score}</span>`;

    // 隐藏操作提示
    this.pcTips.style.display = 'none';
    this.mobileTips.style.display = 'none';

    // 显示下一关按钮
    this.actionBtn.innerText = '下一关';
    this.actionBtn.onclick = () => {
      this.hide();
      onNext();
    };
  }

  /**
   * 显示游戏通关界面
   * @param score 最终得分
   */
  showGameComplete(score: number) {
    this.container.style.display = 'block';
    this.statusText.innerText = '恭喜通关！';
    this.statusText.style.color = '#ffd700';

    // 显示最终得分
    this.loadingTips.innerHTML = `最终得分: <span style="color:#fff; font-size:24px">${score}</span><br><span style="color:#ffd700">你已完成所有关卡！</span>`;

    // 隐藏操作提示
    this.pcTips.style.display = 'none';
    this.mobileTips.style.display = 'none';

    // 显示重新开始按钮
    this.actionBtn.innerText = '重新开始';
    this.actionBtn.onclick = () => location.reload();
  }
}
