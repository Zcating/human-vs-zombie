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
import { InvincibleSystem } from '../systems/invincible-system';
import { Loop } from './loop';
import { state } from './state';
import { Overlay } from '../scenes/overlay';
import { CONFIG } from './config';
import { LevelManager } from './level-manager';

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
  ui: UISystem; // 改为属性声明
  levelManager: LevelManager; // 关卡管理器
  invincible: InvincibleSystem; // 无敌系统

  loop: Loop;
  overlay: Overlay;

  constructor(overlay: Overlay) {
    // 初始化渲染器与玩家
    this.renderer = new Renderer();
    this.player = new Player(this.renderer.scene);
    this.overlay = overlay;
    this.levelManager = new LevelManager(); // 初始化关卡管理器
    this.invincible = new InvincibleSystem(); // 初始化无敌系统
    this.ui = new UISystem(this.levelManager, this.invincible); // 初始化UI系统并传入关卡管理器和无敌系统
    this.update = this.update.bind(this);

    // 启动主循环
    this.loop = new Loop(this.update);
    this.loop.start();
  }

  /**
   * 每一帧的更新逻辑
   * @param dt 时间增量（秒）
   */
  update(dt: number) {
    if (state.gameOver) {
      return;
    }

    // 更新关卡状态
    this.levelManager.update();

    // 检查关卡完成状态
    this.checkLevelStatus();

    // 0. 更新无敌状态
    this.invincible.update(dt);
    this.updatePlayerVisibility();

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
    this.checkPlayerZombieCollisions();

    // 9. 更新 UI 显示
    this.ui.update();

    // 10. 渲染场景
    this.renderer.render();
  }

  /**
   * 更新玩家可见性（无敌闪烁效果）
   */
  private updatePlayerVisibility(): void {
    if (this.invincible.isInvincible()) {
      this.player.mesh.visible = this.invincible.getVisibility();
    } else {
      this.player.mesh.visible = true;
    }
  }

  /**
   * 检查玩家与丧尸的碰撞
   * 处理伤害扣除和无敌状态触发
   */
  private checkPlayerZombieCollisions() {
    if (this.invincible.isInvincible()) return;

    const hit = this.zombies.some(
      (z) => z.position.distanceTo(this.player.mesh.position) < 2
    );

    if (hit) {
      state.health -= 10;
      if (state.health <= 0) {
        state.gameOver = true;
        this.overlay.showGameOver(state.score);
      } else {
        // 触发无敌状态
        this.invincible.activateInvincible(CONFIG.invincibleTime);
      }
    }
  }

  /**
   * 检查关卡状态
   */
  private checkLevelStatus(): void {
    const levelInfo = this.levelManager.getCurrentLevelInfo();

    // 更新全局状态
    state.level.currentLevel = levelInfo.level;
    state.level.levelCompleted = this.levelManager.isLevelCompleted();

    // 如果关卡完成，显示完成界面
    if (this.levelManager.isLevelCompleted()) {
      const nextConfig = this.levelManager.getCurrentLevelInfo().config;
      if (nextConfig) {
        // 显示关卡完成界面
        this.overlay.showLevelComplete(levelInfo.level, state.score, () => {
          // 进入下一关
          if (this.levelManager.nextLevel()) {
            // 应用新的丧尸血量配置
            const zombieHealth = this.levelManager.getCurrentZombieHealth();
            this.zombiesSys.setZombieHealth(zombieHealth);
            this.levelManager.startLevel();
          } else {
            // 所有关卡完成
            state.level.allLevelsCompleted = true;
            this.overlay.showGameComplete(state.score);
          }
        });
      }
    }
  }

  /**
   * 开始游戏（包括第一关）
   */
  public startGame(): void {
    // 应用丧尸血量配置
    const zombieHealth = this.levelManager.getCurrentZombieHealth();
    this.zombiesSys.setZombieHealth(zombieHealth);
    this.levelManager.startLevel();
  }
}
