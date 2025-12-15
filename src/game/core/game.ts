import * as THREE from 'three';
import { Renderer } from '../renderer/renderer';
import { Player } from '../entities/player';
import { Bullet } from '../entities/bullet';
import { Zombie } from '../entities/zombie';
import { Item } from '../entities/item';
import { InputSystem } from '../systems/input-system';
import { WeaponSystem } from '../systems/weapon-system';
import { ZombieSystem } from '../systems/zombie-system';
import { ItemSystem } from '../systems/item-system';
import { CollisionSystem } from '../systems/collision-system';
import { UISystem } from '../systems/ui-system';
import { Loop } from './loop';
import { state } from './state';
import { Overlay } from '../scenes/overlay';

/**
 * 游戏主类
 * 负责组装渲染器、实体与各子系统，并管理生命周期
 */
export class Game {
  renderer: Renderer;
  player: Player;
  // 实体集合
  bullets: Bullet[] = [];
  zombies: Zombie[] = [];
  items: Item[] = [];

  // 子系统实例
  input = new InputSystem();
  weapon = new WeaponSystem();
  zombiesSys = new ZombieSystem();
  itemsSys = new ItemSystem();
  collisions = new CollisionSystem();
  ui = new UISystem();

  loop: Loop;
  overlay: Overlay;

  constructor(overlay: Overlay) {
    // 初始化渲染器与玩家
    this.renderer = new Renderer();
    this.player = new Player(this.renderer.scene);
    this.overlay = overlay;

    // 启动主循环
    this.loop = new Loop(this.update);
    this.loop.start();
  }

  /**
   * 每一帧的更新逻辑
   * @param dt 时间增量（秒）
   */
  update = (_dt: number) => {
    if (state.gameOver) return;

    // 1. 处理输入
    this.input.update();

    // 计算玩家朝向（PC: 鼠标指向；移动端: 自动瞄准或移动方向）
    const look = this.input.computeLookTarget(
      this.renderer.camera,
      this.renderer.raycaster,
      this.renderer.groundPlane,
      this.player.mesh.position
    );

    // 2. 更新玩家位置与旋转
    const move = new THREE.Vector3(
      this.input.intents.move.x,
      0,
      this.input.intents.move.z
    );
    this.player.update(move, look, this.renderer.camera);

    // 3. 计算瞄准方向
    let aimDir: THREE.Vector3 | null = null;
    if (look) {
      aimDir = new THREE.Vector3().subVectors(look, this.player.mesh.position);
      aimDir.y = 0;
      aimDir.normalize();
    }

    // 4. 更新武器系统（发射子弹）
    this.weapon.updateAndFire(
      this.renderer.scene,
      this.player.mesh.position,
      aimDir,
      this.bullets,
      this.input.intents.fire
    );

    // 5. 更新道具系统（生成、旋转、拾取）
    this.itemsSys.update(
      this.renderer.scene,
      this.items,
      this.player.mesh.position,
      this.player.gunMat
    );

    // 6. 更新丧尸系统（生成、行为、移动）
    this.zombiesSys.update(
      this.renderer.scene,
      this.zombies,
      this.player.mesh.position
    );

    // 7. 处理碰撞检测（子弹击中丧尸）
    this.collisions.update(this.renderer.scene, this.bullets, this.zombies);

    // 8. 检测玩家与丧尸碰撞（游戏结束判定）
    if (
      this.zombies.some(
        (z) => z.position.distanceTo(this.player.mesh.position) < 2
      )
    ) {
      state.health -= 1;
      if (state.health <= 0) {
        state.gameOver = true;
        this.overlay.showGameOver(state.score);
      }
    }

    // 9. 更新 UI 显示
    this.ui.update();

    // 10. 渲染场景
    this.renderer.render();
  };
}
