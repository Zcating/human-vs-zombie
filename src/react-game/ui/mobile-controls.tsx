import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';

/**
 * 移动端控制器对外暴露的接口
 */
export interface MobileControlsRef {
  /** 获取当前摇杆的归一化向量 ({x: -1~1, y: -1~1}) */
  getVector: () => { x: number; y: number };
  /** 获取当前是否正在开火 */
  isFiring: () => boolean;
}

/**
 * 移动端触控控制器组件
 * 包含左侧虚拟摇杆（控制移动）和右侧开火按钮
 */
export const MobileControls = forwardRef<MobileControlsRef>((_, ref) => {
  // DOM 引用，用于直接操作样式以获得更好的性能
  const zoneRef = useRef<HTMLDivElement>(null); // 摇杆底座区域
  const stickRef = useRef<HTMLDivElement>(null); // 摇杆操纵杆（中间的小圆）
  const fireBtnRef = useRef<HTMLDivElement>(null); // 开火按钮

  // 状态追踪 Refs (使用 ref 而不是 state 以避免重渲染)
  const stickIdRef = useRef<number | null>(null); // 追踪控制摇杆的触摸点 ID (支持多点触控)
  const vecRef = useRef({ x: 0, y: 0 }); // 当前摇杆输出向量
  const firingRef = useRef(false); // 开火状态

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    getVector: () => vecRef.current,
    isFiring: () => firingRef.current,
  }));

  /**
   * 更新摇杆位置的核心逻辑
   */
  const updateStick = useCallback((touch: React.Touch | Touch) => {
    const zone = zoneRef.current;
    const stick = stickRef.current;

    if (!zone || !stick) return;

    // 获取底座的中心点坐标
    const rect = zone.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // 计算触摸点相对于中心的偏移量
    let x = touch.clientX - cx;
    let y = touch.clientY - cy;
    const r = rect.width / 2; // 底座半径
    const d = Math.sqrt(x * x + y * y); // 距离中心的距离

    // 如果超出半径，将位置限制在圆周上
    if (d > r) {
      x = (x / d) * r;
      y = (y / d) * r;
    }

    // 直接操作 DOM 移动操纵杆
    stick.style.transform = `translate(${x}px, ${y}px)`;

    // 更新归一化向量 (x, y 在 -1 到 1 之间)
    vecRef.current = {
      x: x / r,
      y: y / r,
    };
  }, []);

  /**
   * 摇杆触摸开始
   */
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.changedTouches[0];
    stickIdRef.current = touch.identifier; // 记录当前触摸点 ID
    updateStick(touch);
  };

  /**
   * 摇杆触摸移动
   */
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    // 遍历所有变化的触摸点，找到控制摇杆的那个点
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === stickIdRef.current) {
        updateStick(e.changedTouches[i]);
        break;
      }
    }
  };

  /**
   * 摇杆触摸结束
   */
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === stickIdRef.current) {
        // 重置状态
        stickIdRef.current = null;
        if (stickRef.current) {
          stickRef.current.style.transform = `translate(0px, 0px)`; // 操纵杆回中
        }
        vecRef.current = { x: 0, y: 0 }; // 向量归零
        break;
      }
    }
  };

  /**
   * 开火按钮按下
   */
  const handleFireStart = () => {
    firingRef.current = true;
    // 添加视觉反馈
    if (fireBtnRef.current) {
      fireBtnRef.current.style.background = 'rgba(255, 50, 50, 0.8)';
      fireBtnRef.current.style.transform = 'scale(0.9)';
    }
  };

  /**
   * 开火按钮松开
   */
  const handleFireEnd = () => {
    firingRef.current = false;
    // 恢复视觉样式
    if (fireBtnRef.current) {
      fireBtnRef.current.style.background = 'rgba(255, 50, 50, 0.4)';
      fireBtnRef.current.style.transform = 'scale(1)';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* 摇杆区域 */}
      <div
        ref={zoneRef}
        className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-white/10 border-2 border-white/30 pointer-events-auto touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div
          ref={stickRef}
          className="absolute top-1/2 left-1/2 w-12 h-12 -mt-6 -ml-6 rounded-full bg-white/50 shadow-lg"
        />
      </div>

      {/* 开火按钮 */}
      <div
        ref={fireBtnRef}
        className="absolute bottom-12 right-12 w-20 h-20 rounded-full bg-red-500/40 border-2 border-white/30 flex items-center justify-center text-white/90 font-bold select-none pointer-events-auto touch-none active:bg-red-500/80 active:scale-90 transition-transform"
        onTouchStart={handleFireStart}
        onTouchEnd={handleFireEnd}
        onTouchCancel={handleFireEnd}
      >
        FIRE
      </div>
    </div>
  );
});

MobileControls.displayName = 'MobileControls';
