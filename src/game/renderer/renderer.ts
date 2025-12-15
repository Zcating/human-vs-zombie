import * as THREE from 'three';
import { CONFIG } from '../core/config';

/**
 * 游戏渲染器类
 * 管理 Three.js 的 Scene, Camera, Renderer 以及光照和地面
 */
export class Renderer {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  groundPlane: THREE.Mesh;
  raycaster: THREE.Raycaster;

  constructor() {
    // 1. 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a1a); // 深灰背景
    this.scene.fog = new THREE.Fog(0x1a1a1a, 60, 200); // 雾效

    // 2. 添加辅助网格
    const grid = new THREE.GridHelper(200, 50, 0x444444, 0x333333);
    this.scene.add(grid);

    // 3. 创建地面平面（用于射线检测，不可见）
    const planeGeo = new THREE.PlaneGeometry(300, 300);
    const planeMat = new THREE.MeshBasicMaterial({ visible: false });
    this.groundPlane = new THREE.Mesh(planeGeo, planeMat);
    this.groundPlane.rotation.x = -Math.PI / 2;
    this.scene.add(this.groundPlane);

    // 4. 添加光照
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(50, 100, 50);
    dir.castShadow = true;
    this.scene.add(dir);

    // 5. 创建相机
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, CONFIG.camHeight, CONFIG.camDist);
    this.camera.lookAt(0, 0, 0);

    // 6. 初始化 WebGL 渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.renderer.domElement);

    // 7. 初始化射线投射器
    this.raycaster = new THREE.Raycaster();

    // 监听窗口大小变化
    window.addEventListener('resize', this.onResize);
  }

  /**
   * 窗口大小调整回调
   * 更新相机纵横比和渲染尺寸
   */
  onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  /**
   * 执行渲染
   */
  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
