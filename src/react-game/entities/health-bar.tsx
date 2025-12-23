import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from 'react';
import * as THREE from 'three';
import { useConstant } from '../hooks';

export interface HealthBarRef {
  setHealth: (health: number) => void;
}

interface HealthBarProps {
  maxHealth?: number;
  initialHealth?: number;
}

export const HealthBar = forwardRef<HealthBarRef, HealthBarProps>(
  ({ maxHealth = 100, initialHealth = 100 }, ref) => {
    const width = useConstant(() => 1);
    const height = useConstant(() => 1);
    const position = useConstant(() => [0, 0, 0] as const);

    const textureRef = useRef<THREE.CanvasTexture>(null!);
    const currentHealthRef = useRef(initialHealth);

    const barCanvas = useConstant<HTMLCanvasElement>(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      return canvas;
    });

    const draw = (health: number) => {
      const ctx = barCanvas.getContext('2d');
      if (!ctx) {
        return;
      }

      const healthPercent = health / maxHealth;
      const barHeight = 24;
      const y = barCanvas.height - barHeight;

      // Clear
      ctx.clearRect(0, y, barCanvas.width, barHeight);

      // Background border
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, y, barCanvas.width, barHeight);

      // Inner background
      ctx.fillStyle = '#333333';
      ctx.fillRect(2, 2 + y, barCanvas.width - 4, barHeight - 4);

      // Fill
      const fillWidth = (barCanvas.width - 4) * healthPercent;
      let fillColor = '#00ff00';
      if (healthPercent <= 0.3) fillColor = '#ff0000';
      else if (healthPercent <= 0.6) fillColor = '#ffaa00';

      ctx.fillStyle = fillColor;
      ctx.fillRect(2, 2 + y, fillWidth, barHeight - 4);

      if (textureRef.current) {
        textureRef.current.needsUpdate = true;
      }
    };

    // Initial draw
    useEffect(() => {
      draw(initialHealth);
    }, []);

    useImperativeHandle(ref, () => ({
      setHealth: (health: number) => {
        currentHealthRef.current = Math.max(0, Math.min(health, maxHealth));
        draw(currentHealthRef.current);
      },
    }));

    return (
      <sprite position={position} scale={[width, height, 1]}>
        <spriteMaterial
          ref={(mat) => {
            if (mat && !textureRef.current) {
              textureRef.current = new THREE.CanvasTexture(barCanvas);
              textureRef.current.minFilter = THREE.LinearFilter;
              textureRef.current.magFilter = THREE.LinearFilter;
              mat.map = textureRef.current;
              // Trigger initial update
              draw(currentHealthRef.current);
            }
          }}
          transparent
          alphaTest={0.1}
        />
      </sprite>
    );
  }
);

HealthBar.displayName = 'HealthBar';
