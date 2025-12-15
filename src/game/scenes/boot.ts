import { isMobile } from '../platform/device';
import { Overlay } from './overlay';

/**
 * 游戏引导启动函数
 * 根据设备类型切换提示信息，并通知 Overlay 准备就绪
 */
export function boot(overlay: Overlay) {
  // 根据设备类型切换显示提示
  overlay.setMobileMode(isMobile);

  // 标记界面为就绪状态（显示开始按钮）
  overlay.ready();
}
