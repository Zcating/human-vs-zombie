import * as THREE from 'three';

/**
 * 计算鼠标在地面上的投影点
 * @param camera 当前相机
 * @param raycaster 射线投射器实例
 * @param ground 地面网格对象
 * @param mouse 归一化鼠标坐标 (-1 到 1)
 * @returns 命中的三维坐标点，若未命中则返回 null
 */
export function pickGround(
  camera: THREE.Camera,
  raycaster: THREE.Raycaster,
  ground: THREE.Object3D,
  mouse: THREE.Vector2
): THREE.Vector3 | null {
  // 从相机向鼠标位置发射射线
  raycaster.setFromCamera(mouse, camera as THREE.PerspectiveCamera);

  // 检测与地面的交点
  const hits = raycaster.intersectObject(ground);

  if (hits.length > 0) return hits[0].point.clone();
  return null;
}
