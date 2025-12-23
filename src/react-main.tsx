import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactGame } from './react-game/react-game';
import './styles/game.css';

/**
 * React版本的入口文件
 * 演示如何使用React-three-fiber重构游戏
 */

// 创建React根节点
const root = ReactDOM.createRoot(document.getElementById('app')!);

// 渲染React游戏
root.render(
  <React.StrictMode>
    <ReactGame />
  </React.StrictMode>
);

console.log('React-three-fiber 游戏版本已启动！');
