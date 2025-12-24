import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Player, type PlayerRef } from './entities/player';
import { Zombie } from './entities/zombie';
import { Bullet } from './entities/bullet';
import { Item } from './entities/item';
import { useInputSystem } from './systems/use-input-system';
import { useBulletSystem } from './systems/use-bullet-system';
import { useZombieSystem } from './systems/use-zombie-system';
import { useWeaponSystem } from './systems/use-weapon-system';
import { useGameLogicSystem } from './systems/use-game-logic-system';
import { useItemSystem } from './systems/use-item-system';
import { useGameStore } from './use-game.store';

import { type BulletState } from './systems/use-weapon-system';

export const GameContent: React.FC = () => {
  const { camera } = useThree();
  const playerRef = useRef<PlayerRef>(null);

  // Systems
  const { updateCamera } = useInputSystem(camera);
  const { createBullets, changeWeapon } = useWeaponSystem();
  const { bullets, registerBullet, updateBullets } = useBulletSystem();
  const { zombies, registerZombie, updateZombies } = useZombieSystem();
  const { items, registerItem, updateItems } = useItemSystem();
  // 1 second invincibility
  const { gameOverRef, takeDamage, heal } = useGameLogicSystem(1000);

  // Store actions
  const switchWeapon = useGameStore((state) => state.switchWeapon);
  const consumeAmmo = useGameStore((state) => state.consumeAmmo);

  useFrame(() => {
    if (gameOverRef.current) {
      return;
    }

    const player = playerRef.current;
    if (!player) {
      return;
    }

    // 1. Update Player & Camera
    const inputState = updateCamera(player);

    // Switch weapon
    if (inputState.switchWeapon) {
      // Simple toggle for now, or cycle through inventory
      // For Q key (simple toggle between pistol and best available)
      // This logic should ideally be in a system or store action
      // But switchWeapon takes a type.
      // Let's implement cycling in store or here.
      // For now, let's just use number keys or Q to cycle?
      // Since input only gives boolean switchWeapon, let's cycle.
      // We need access to inventory to cycle.
      // Let's just handle it in updateCamera or here if we had the inventory.
      // Better: inputState should probably not handle logic, just input.
      // We can check inventory in store.
      // But we can't do it inside useFrame easily without subscription or accessing state.
      // Let's access state via useGameStore.getState()
      const { inventory, weapon } = useGameStore.getState();
      const currentIndex = inventory.indexOf(weapon.type);
      const nextIndex = (currentIndex + 1) % inventory.length;
      switchWeapon(inventory[nextIndex]);
    }

    // 2. Weapon System
    // Check ammo before creating bullets
    // Pistol is always infinite (managed in store as null or special check)
    // Actually store has logic for consumeAmmo, but we need to prevent firing if empty.
    // Let's check ammo here.
    const weaponType = useGameStore.getState().weapon.type;
    const hasAmmo =
      weaponType === 'pistol' || useGameStore.getState().ammo[weaponType] > 0;

    let bullets: BulletState[] = [];
    if (hasAmmo) {
      bullets = createBullets(inputState);
      if (bullets.length > 0) {
        consumeAmmo();
      }
    }

    // 3. Update Bullets & Check Collisions
    updateBullets(bullets);

    // 4. Update Zombies & Check Player Collision
    updateZombies(player.position, () => {
      // Player hit
      if (!takeDamage(1)) {
        return;
      }
      player.flash(1000);
    });

    // 5. Update Items & Check Collection
    updateItems(player.position, (type) => {
      if (type === 'health') {
        // Heal player
        heal(20);
      } else {
        // Weapon pickup
        changeWeapon(type);
        switchWeapon(type);
      }
    });
  });

  return (
    <>
      <Player ref={playerRef} position={[0, 1, 0]} />

      {zombies.map((z) => (
        <Zombie
          key={z.id}
          id={z.id}
          ref={(ref) => registerZombie(z.id, ref)}
          initialPosition={z.initialPosition}
          health={z.health}
        />
      ))}

      {bullets.map((bullet) => (
        <Bullet
          key={bullet.id}
          ref={(ref) => registerBullet(bullet.id, ref)}
          initialPosition={bullet.position}
          direction={bullet.direction}
          type={bullet.type}
        />
      ))}

      {items.map((item) => (
        <Item
          key={item.id}
          id={item.id}
          ref={(ref) => registerItem(item.id, ref)}
          type={item.type}
          position={item.position}
        />
      ))}
    </>
  );
};
