import './styles/game.css';
import { Overlay } from './game/scenes/overlay';
import { boot } from './game/scenes/boot';
import { Game } from './game/core/game';
import { state } from './game/core/state';

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
