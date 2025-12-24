import React, { useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { type ItemRef, type ItemType } from '../entities/item';
import { EventCenter } from '../core/event-center';

export interface ItemState {
  id: string;
  type: ItemType;
  position: [number, number, number];
}

let nextItemId = 0;
const generateItemId = () => `item_${nextItemId++}`;

function createItemState(position: THREE.Vector3): ItemState {
  // 随机决定道具类型
  const rand = Math.random();

  let type: ItemType;
  if (rand < 0.2) {
    // 20% 几率回血
    type = 'health';
  } else if (rand < 0.4) {
    // 40% 几率机关枪
    type = 'machinegun';
  } else {
    // 40% 几率霰弹枪
    type = 'shotgun';
  }
  return {
    id: generateItemId(),
    type,
    position: [position.x, 1, position.z],
  };
}

/**
 * 道具系统 Hook
 * 管理道具的生成、更新和拾取检测
 */
export const useItemSystem = () => {
  const [items, setItems] = useState<ItemState[]>([]);
  const itemRefs = useRef(new Map<string, ItemRef>()).current;

  /**
   * 生成一个新的道具
   */
  const spawnItem = useCallback((position: THREE.Vector3) => {
    const newItem = createItemState(position);
    setItems((prev) => [...prev, newItem]);
  }, []);

  /**
   * 移除道具
   */
  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      itemRefs.delete(id);
    },
    [itemRefs]
  );

  /**
   * 注册道具 Ref
   */
  const registerItem = useCallback(
    (id: string, ref: ItemRef | null) => {
      if (ref) {
        itemRefs.set(id, ref);
      } else {
        itemRefs.delete(id);
      }
    },
    [itemRefs]
  );

  /**
   * 更新道具状态并检查拾取
   */
  const updateItems = (
    playerPos: THREE.Vector3,
    onCollect: (type: ItemType) => void
  ) => {
    itemRefs.forEach((item) => {
      item.update();

      // 检查是否被玩家拾取
      const dist = item.position.distanceTo(playerPos);
      if (dist < 2.5) {
        // 拾取半径
        onCollect(item.type);
        removeItem(item.id);
      }
    });
  };

  // 监听僵尸死亡事件，概率掉落道具
  React.useEffect(() => {
    return EventCenter.addEventListener('ZOMBIE_KILLED', (event) => {
      // 20% 几率掉落道具
      if (Math.random() < 0.2) {
        const zombiePos = event.target.position;
        if (zombiePos) {
          spawnItem(zombiePos);
        }
      }
    });
  }, []);

  return {
    items,
    registerItem,
    updateItems,
  };
};
