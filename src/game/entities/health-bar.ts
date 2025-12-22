import * as THREE from 'three';

/**
 * 血条类
 * 使用Canvas绘制的动态血条，始终面向摄像机
 */
export class HealthBar {
  private sprite: THREE.Sprite;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private maxHealth: number;
  private currentHealth: number;
  private width: number;
  private height: number;

  /**
   * @param mesh 父物体（用于添加血条精灵）
   * @param maxHealth 最大血量
   * @param width 血条宽度（世界单位）
   * @param height 血条高度（世界单位）
   */
  constructor(
    mesh: THREE.Object3D,
    maxHealth: number = 100,
    width: number = 8,
    height: number = 1
  ) {
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.width = width;
    this.height = height;

    // 创建 Canvas 元素
    this.canvas = document.createElement('canvas');
    this.canvas.width = 256; // 高分辨率以获得更好的质量
    this.canvas.height = 256;
    this.context = this.canvas.getContext('2d')!;

    // 创建 Canvas 纹理
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;

    // 创建血条精灵
    const material = new THREE.SpriteMaterial({
      map: this.texture,
      transparent: true,
      alphaTest: 0.1,
    });

    this.sprite = new THREE.Sprite(material);

    mesh.add(this.sprite);

    // 初始绘制
    this.drawHealthBar();
  }

  /**
   * 绘制血条
   */
  private drawHealthBar() {
    const ctx = this.context;
    const canvas = this.canvas;
    const healthPercent = this.currentHealth / this.maxHealth;
    const y = this.canvas.height - 24;
    const height = 24;
    // 清空画布
    ctx.clearRect(0, y, canvas.width, height);

    // 绘制背景边框
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, y, canvas.width, height);

    // 绘制内部背景
    ctx.fillStyle = '#333333';
    ctx.fillRect(2, 2 + y, canvas.width - 4, height - 4);

    // 计算填充宽度
    const fillWidth = (canvas.width - 4) * healthPercent;

    // 根据血量设置颜色
    let fillColor = '#00ff00'; // 绿色
    if (healthPercent <= 0.3) {
      fillColor = '#ff0000'; // 红色
    } else if (healthPercent <= 0.6) {
      fillColor = '#ffaa00'; // 橙色s
    }

    // 绘制血条填充
    ctx.fillStyle = fillColor;
    ctx.fillRect(2, 2 + y, fillWidth, height - 4);

    // 更新纹理
    this.texture.needsUpdate = true;
  }

  /**
   * 更新血量
   */
  setHealth(health: number): void {
    this.currentHealth = Math.max(0, Math.min(health, this.maxHealth));
    this.drawHealthBar();
  }

  /**
   * 获取当前血量
   */
  getHealth(): number {
    return this.currentHealth;
  }

  /**
   * 获取最大血量
   */
  getMaxHealth(): number {
    return this.maxHealth;
  }

  /**
   * 受到伤害
   * @param damage 伤害值
   * @returns 是否死亡
   */
  takeDamage(damage: number): boolean {
    this.setHealth(this.currentHealth - damage);
    return this.currentHealth <= 0;
  }

  /**
   * 设置位置
   */
  setPosition(x: number, y: number, z: number): void {
    this.sprite.position.set(x, y, z);
  }

  /**
   * 更新位置
   */
  updatePosition(position: THREE.Vector3): void {
    this.sprite.position.copy(position);
  }

  /**
   * 从场景中移除
   */
  destroy(): void {
    if (this.sprite.parent) {
      this.sprite.parent.remove(this.sprite);
    }
    this.texture.dispose();
  }

  /**
   * 设置可见性
   */
  setVisible(visible: boolean): void {
    this.sprite.visible = visible;
  }

  /**
   * 获取精灵对象
   */
  getSprite(): THREE.Sprite {
    return this.sprite;
  }
}
