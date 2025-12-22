import './styles/game.css';
import { Overlay } from './game/scenes/overlay';
import { boot } from './game/scenes/boot';
import { Game } from './game/core/game';
import { state } from './game/core/state';

const uidiv = `<div id="ui">
    <div>关卡: <span id="level" style="color:#ffd700">1</span></div>
    <div>时间: <span id="levelTimer" style="color:#fff"></span></div>
    <div id="invincible" style="display:none; color:#00ff00; font-weight:bold;"></div>
    HP: <span id="hp" style="color:#0f0">100</span>% <br />
    Score: <span id="score">0</span>
    <div class="weapon-status">Weapon: <span id="weaponName" style="color:#fff">Pistol</span></div>
  </div>
  <div id="mobile-controls">
    <div id="joystick-zone">
      <div id="joystick-stick"></div>
    </div>
    <div id="fire-btn">FIRE</div>
  </div>
`;
document.body.innerHTML += uidiv;

// 创建 Overlay（用于显示开始/结束界面）
const overlay = new Overlay();

// 启动游戏引导流程（显示资源加载、提示信息等）
boot(overlay);

// 绑定开始按钮点击事件
overlay.onStart = () => {
  // 设置游戏状态为已开始
  state.gameStarted = true;
  // 隐藏 Overlay 界面
  overlay.hide();
  // 实例化并启动游戏主逻辑
  const game = new Game(overlay);
  // 开始第一关
  game.startGame();
};
