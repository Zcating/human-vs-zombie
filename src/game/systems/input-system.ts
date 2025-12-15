import * as THREE from 'three';
import { isMobile } from '../platform/device';
import { pickGround } from '../renderer/raycaster';
import { MobileControls } from '../platform/mobile-controls';

// 玩家输入意图结构体
export type Intents = {
  move: THREE.Vector3; // 移动方向 (x, z)
  fire: boolean; // 是否开火
  mouse: THREE.Vector2; // 归一化鼠标坐标
};

/**
 * 输入系统
 * 统一处理 PC (键鼠) 和移动端 (触摸) 输入，输出标准化的意图 (Intents)
 */
export class InputSystem {
  intents: Intents = {
    move: new THREE.Vector3(),
    fire: false,
    mouse: new THREE.Vector2(),
  };
  private keys: Record<string, boolean> = {}; // 按键状态映射
  private mouseDown = false; // 鼠标按下状态
  private mobile?: MobileControls; // 移动端控制器实例

  constructor() {
    // 监听键盘事件
    window.addEventListener(
      'keydown',
      (e) => (this.keys[e.key.toLowerCase()] = true)
    );
    window.addEventListener(
      'keyup',
      (e) => (this.keys[e.key.toLowerCase()] = false)
    );

    if (!isMobile) {
      // PC 端：监听鼠标移动与点击
      window.addEventListener('mousemove', (e) => {
        this.intents.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.intents.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      });
      window.addEventListener('mousedown', () => (this.mouseDown = true));
      window.addEventListener('mouseup', () => (this.mouseDown = false));
    } else {
      // 移动端：初始化虚拟摇杆并显示
      this.mobile = new MobileControls();
      const mc = document.getElementById('mobile-controls');
      if (mc) mc.style.display = 'block';
    }
  }

  /**
   * 更新输入状态
   * 每一帧调用，将底层事件转换为游戏意图
   */
  update() {
    const m = this.intents.move;
    m.set(0, 0, 0);

    if (!isMobile) {
      // PC 键盘控制移动 (WASD)
      if (this.keys['w']) m.z = -1;
      if (this.keys['s']) m.z = 1;
      if (this.keys['a']) m.x = -1;
      if (this.keys['d']) m.x = 1;
    } else if (this.mobile) {
      // 移动端摇杆控制
      const v = this.mobile.getVector();
      m.x = v.x;
      m.z = v.y;
      this.intents.fire = this.mobile.isFiring();
      return;
    }
    // PC 鼠标开火
    this.intents.fire = this.mouseDown;
  }

  /**
   * 计算玩家瞄准目标点
   * PC: 射线检测地面交点
   * Mobile: 自动向前或不做处理（由 WeaponSystem 自动锁定）
   */
  computeLookTarget(
    camera: THREE.PerspectiveCamera,
    raycaster: THREE.Raycaster,
    ground: THREE.Object3D,
    playerPos: THREE.Vector3
  ): THREE.Vector3 | null {
    if (!isMobile) {
      const p = pickGround(camera, raycaster, ground, this.intents.mouse);
      if (p) return p;
      return null;
    }
    // 移动端默认向前看（实际瞄准逻辑在 weapon system 中处理自动锁定）
    return playerPos.clone().add(new THREE.Vector3(1, 0, 0));
  }
}
