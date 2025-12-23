import type { BulletRef } from '../entities/bullet';
import type { ZombieRef } from '../entities/zombie';

export type EventTypeArgsMap = {
  BULLET_UPDATE: {
    target: BulletRef;
  };
  ZOMBIE_UPDATE: {
    target: ZombieRef;
  };
  ZOMBIE_KILLED: {
    id: string;
  };
};

type EventType = keyof EventTypeArgsMap;

type Teardown = () => void;
const eventListeners = new Map<EventType, ((event: unknown) => void)[]>();

/**
 * 添加事件监听器
 * @param type 事件类型
 * @param callback 事件回调函数
 * @returns {Teardown} 取消监听函数
 */
function addEventListener<T extends EventType>(
  type: T,
  callback: (event: EventTypeArgsMap[T]) => void
): Teardown;
function addEventListener<T extends EventType>(
  type: T,
  callback: (event: unknown) => void
): Teardown {
  let listeners = eventListeners.get(type);
  if (!listeners) {
    listeners = [];
    eventListeners.set(type, listeners);
  }

  listeners.push(callback as (event: unknown) => void);

  return () => {
    const index = listeners.indexOf(callback as (event: unknown) => void);
    if (index === -1) {
      return;
    }
    listeners.splice(index, 1);
  };
}

/**
 * 触发事件
 * @param type 事件类型
 * @param event 事件数据
 * @returns void
 */
function emit<T extends EventType>(type: T, event: EventTypeArgsMap[T]) {
  const listeners = eventListeners.get(type);
  if (!listeners) {
    return;
  }

  listeners.forEach((callback) => callback(event));
}

export const EventCenter = {
  addEventListener,
  emit,
};
