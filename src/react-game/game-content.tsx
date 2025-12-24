import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Player, type PlayerRef } from './entities/player';
import { Zombie } from './entities/zombie';
import { Bullet } from './entities/bullet';
import { useInputSystem } from './systems/use-input-system';
import { useBulletSystem } from './systems/use-bullet-system';
import { useZombieSystem } from './systems/use-zombie-system';
import { useWeaponSystem } from './systems/use-weapon-system';
import { useGameLogicSystem } from './systems/use-game-logic-system';

export const GameContent: React.FC = () => {
  const { camera } = useThree();
  const playerRef = useRef<PlayerRef>(null);

  // Systems
  const { updateCamera } = useInputSystem(camera);
  const { createBullets } = useWeaponSystem();
  const { bullets, registerBullet, updateBullets } = useBulletSystem();
  const { zombies, registerZombie, updateZombies } = useZombieSystem();
  // 1 second invincibility
  const { gameOverRef, takeDamage } = useGameLogicSystem(1000);

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

    // 2. Weapon System
    const bullets = createBullets(inputState);

    // 3. Update Bullets & Check Collisions
    updateBullets(bullets);

    // 4. Update Zombies & Check Player Collision
    updateZombies(player.position, () => {
      // Player hit
      if (takeDamage(1)) {
        playerRef.current?.flash(1000);
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
    </>
  );
};
