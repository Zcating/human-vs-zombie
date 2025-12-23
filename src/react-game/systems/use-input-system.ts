import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { isMobile } from '../../game/platform/device';
import { MobileControls } from '../../game/platform/mobile-controls';

export interface InputState {
  move: THREE.Vector3;
  look: THREE.Vector2; // Mouse position in NDC (-1 to 1)
  fire: boolean;
}

export const useInputSystem = () => {
  const keysRef = useRef<Record<string, boolean>>({});
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const mouseDownRef = useRef(false);
  const mobileControlsRef = useRef<MobileControls | null>(null);

  useEffect(() => {
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

    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      // Initialize mobile controls
      // Ensure the DOM elements exist or wait for them?
      // For now assume they are in index.html
      const mc = document.getElementById('mobile-controls');
      if (mc) mc.style.display = 'block';
      mobileControlsRef.current = new MobileControls();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (!isMobile) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
      }
      // Clean up mobile controls if needed
    };
  }, []);

  // Return a function to get current input state synchronously
  // This is better for useFrame than React state
  const getInput = () => {
    const move = new THREE.Vector3();
    let fire = false;

    if (!isMobile) {
      if (keysRef.current['w']) move.z = -1;
      if (keysRef.current['s']) move.z = 1;
      if (keysRef.current['a']) move.x = -1;
      if (keysRef.current['d']) move.x = 1;
      fire = mouseDownRef.current;
    } else if (mobileControlsRef.current) {
      const v = mobileControlsRef.current.getVector();
      move.x = v.x;
      move.z = v.y;
      fire = mobileControlsRef.current.isFiring();
    }

    // Normalize move vector if needed, but existing code doesn't seem to enforce strict normalization for stick?
    // MobileControls does normalization. Keyboard does not (diagonal is faster).
    if (!isMobile && move.lengthSq() > 0) {
      move.normalize();
    }

    return {
      move,
      look: mouseRef.current.clone(),
      fire,
    };
  };

  return getInput;
};
