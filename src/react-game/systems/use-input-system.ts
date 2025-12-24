import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { isMobile } from '../../game/platform/device';
import { CONFIG } from '../../game/core/config';
import { useConstant, useConstructor } from '../hooks';
import type { PlayerRef } from '../entities/player';

export interface InputState {
  move: THREE.Vector3;
  look: THREE.Vector2; // Mouse position in NDC (-1 to 1)
  fire: boolean;
  lookTarget: THREE.Vector3 | null;
  origin: THREE.Vector3;
  switchWeapon: boolean;
}

export const useInputSystem = (camera: THREE.Camera) => {
  const keyboardControls = useControls(isMobile);
  // const mobileControls = useMobileControls();

  // Ground plane and raycaster for converting 2D mouse to 3D position
  const groundPlane = useConstant(() => {
    return new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  });
  const raycaster = useConstructor(THREE.Raycaster);

  const updateCamera = (player: PlayerRef): InputState => {
    const input = keyboardControls.get(camera, raycaster, groundPlane);

    player.update(input.move, input.lookTarget);
    camera.position.x = player.position.x;
    camera.position.z = player.position.z + CONFIG.camDist;
    camera.lookAt(player.position);

    return {
      fire: input.fire,
      move: input.move,
      look: input.look,
      lookTarget: input.lookTarget,
      origin: player.position.clone(),
      switchWeapon: input.switchWeapon,
    };
  };

  return { updateCamera };
};

/**
 * 键盘控制系统
 * @param isMobile 是否为移动端
 * @returns
 */
const useControls = (isMobile: boolean) => {
  const keysRef = useRef<Record<string, boolean>>({});
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const mouseDownRef = useRef(false);

  useEffect(() => {
    if (isMobile) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const handleMouseDown = () => {
      mouseDownRef.current = true;
    };
    const handleMouseUp = () => {
      mouseDownRef.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const get = (
    camera: THREE.Camera,
    raycaster: THREE.Raycaster,
    groundPlane: THREE.Plane
  ) => {
    const move = new THREE.Vector3();
    if (keysRef.current['w']) {
      move.z = -1;
    }
    if (keysRef.current['s']) {
      move.z = 1;
    }
    if (keysRef.current['a']) {
      move.x = -1;
    }
    if (keysRef.current['d']) {
      move.x = 1;
    }

    if (move.lengthSq() > 0) {
      move.normalize();
    }

    const look = mouseRef.current.clone();

    // Calculate look target (3D position)
    let lookTarget: THREE.Vector3 | null = null;
    raycaster.setFromCamera(look, camera);
    const target = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(groundPlane, target)) {
      lookTarget = target;
    }

    // Check for weapon switch (Q key)
    // We only want to trigger this once per press, but this is a continuous check loop.
    // Ideally we should handle this via event or have a "justPressed" logic.
    // For simplicity, we'll return true if held, and handle debounce in system.
    const switchWeapon = !!keysRef.current['q'];

    return {
      fire: mouseDownRef.current,
      move,
      look,
      lookTarget,
      switchWeapon,
    };
  };

  return { get };
};

// const useMobileControls = () => {
//   const mobileControlsRef = useRef<MobileControls | null>(null);

//   useEffect(() => {
//     if (!isMobile) return;

//     // Initialize mobile controls
//     const mc = document.getElementById('mobile-controls');
//     if (mc) mc.style.display = 'block';
//     mobileControlsRef.current = new MobileControls();

//     return () => {
//       // Clean up mobile controls if needed
//     };
//   }, []);

//   const get = () => {
//     const move = new THREE.Vector3();
//     let fire = false;

//     if (mobileControlsRef.current) {
//       const v = mobileControlsRef.current.getVector();
//       move.x = v.x;
//       move.z = v.y;
//       fire = mobileControlsRef.current.isFiring();
//     }

//     return {
//       move,
//       fire,
//     };
//   };

//   return { get };
// };
