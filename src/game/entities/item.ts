import * as THREE from 'three';

// 道具类型定义
export type ItemType = 'health' | 'machinegun' | 'shotgun';

/**
 * 道具实体类
 * 包含随机生成、类型分配与漂浮动画
 */
export class Item {
  type: ItemType;
  position: THREE.Vector3;
  mesh: THREE.Mesh;

  constructor(scene: THREE.Scene) {
    // 随机分配类型
    const rand = Math.random();
    if (rand < 0.4) this.type = 'health';
    else if (rand < 0.7) this.type = 'machinegun';
    else this.type = 'shotgun';

    // 随机生成位置
    const x = (Math.random() - 0.5) * 160;
    const z = (Math.random() - 0.5) * 160;
    this.position = new THREE.Vector3(x, 1.5, z);

    // 根据类型创建几何体与材质
    let geo: THREE.BufferGeometry;
    let mat: THREE.Material;
    if (this.type === 'health') {
      geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      mat = new THREE.MeshLambertMaterial({
        color: 0xff0000,
        emissive: 0x330000,
      });
    } else if (this.type === 'machinegun') {
      geo = new THREE.OctahedronGeometry(1);
      mat = new THREE.MeshLambertMaterial({
        color: 0x00d2ff,
        emissive: 0x0044aa,
      });
    } else {
      geo = new THREE.TetrahedronGeometry(1.2);
      mat = new THREE.MeshLambertMaterial({
        color: 0xffff00,
        emissive: 0x555500,
      });
    }

    this.mesh = new THREE.Mesh(geo, mat as THREE.Material);
    this.mesh.position.copy(this.position);
    scene.add(this.mesh);
  }

  /**
   * 更新道具动画（自转与上下浮动）
   */
  update() {
    this.mesh.rotation.y += 0.03;
    this.mesh.position.y = 1.5 + Math.sin(Date.now() * 0.003) * 0.3;
  }
}
