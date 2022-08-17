import Carbon from "./resources/Carbon.png";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader.js';
import TEX_CARBON from "./resources/Carbon.png";
import TEX_CARBON_NORMAL from "./resources/Carbon_Normal.png";
import TEX_WATER_NORMAL from "./resources/Water_1_M_Normal.jpg";
import TEX_SCRATCHED_GOLD from "./resources/Scratched_gold_01_1K_Normal.png";
import HDR_PX from "./resources/pisaHDR/px.hdr";
import HDR_NX from "./resources/pisaHDR/nx.hdr";
import HDR_PY from "./resources/pisaHDR/py.hdr";
import HDR_NY from "./resources/pisaHDR/ny.hdr";
import HDR_PZ from "./resources/pisaHDR/pz.hdr";
import HDR_NZ from "./resources/pisaHDR/nz.hdr";
import { getAngleAtTime, getRadiusAtT, linspace, polar2Cart } from "./helpers";
import { Ball, PulleyWheel } from "./models";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;


// Lighting
const particleLight = new THREE.Mesh(
  new THREE.SphereGeometry(4, 8, 8),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
particleLight.add(new THREE.PointLight(0xffffff, 1));
scene.add(particleLight);


// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.exposure = 1.0;
renderer.toneMappingExposure = 1.25;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
function onWindowResize() {
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);


// Controls 
const controls = new OrbitControls(camera, renderer.domElement);

// Environment Map
new HDRCubeTextureLoader()
  .load([HDR_PX, HDR_NX, HDR_PY, HDR_NY, HDR_PZ, HDR_NZ,], function (texture) {
    scene.background = texture;
    scene.environment = texture;
  });

// Materials
const textureLoader = new THREE.TextureLoader();
const carbonDiffuse = textureLoader.load(TEX_CARBON);
carbonDiffuse.encoding = THREE.sRGBEncoding;
carbonDiffuse.wrapS = THREE.RepeatWrapping;
carbonDiffuse.wrapT = THREE.RepeatWrapping;
carbonDiffuse.repeat.x = 10;
carbonDiffuse.repeat.y = 10;
const carbonNormalMap = textureLoader.load(TEX_CARBON_NORMAL);
carbonNormalMap.wrapS = THREE.RepeatWrapping;
carbonNormalMap.wrapT = THREE.RepeatWrapping;

const MATERIAL_CARBON = new THREE.MeshPhysicalMaterial({
  roughness: 0.5,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  map: carbonDiffuse,
  normalMap: carbonNormalMap
});

const normalMapRoughMetal = textureLoader.load(TEX_WATER_NORMAL);
const clearcoatNormalMap = textureLoader.load(TEX_SCRATCHED_GOLD);
const MATERIAL_METAL_RED = new THREE.MeshPhysicalMaterial({
  clearcoat: 1.0,
  metalness: 1.0,
  color: 0xff0000,
  normalMap: normalMapRoughMetal,
  normalScale: new THREE.Vector2(0.15, 0.15),
  clearcoatNormalMap: clearcoatNormalMap,

  // y scale is negated to compensate for normal map handedness.
  clearcoatNormalScale: new THREE.Vector2(2.0, - 2.0)
});
const MATERIAL_METAL_GRAY = new THREE.MeshPhysicalMaterial({
  clearcoat: 1.0,
  metalness: 1.0,
  color: 0x535654,
  normalMap: normalMapRoughMetal,
  normalScale: new THREE.Vector2(0.15, 0.15),
  clearcoatNormalMap: clearcoatNormalMap,

  // y scale is negated to compensate for normal map handedness.
  clearcoatNormalScale: new THREE.Vector2(2.0, - 2.0)
});

// Create the CAM mechanism
const verts = [];
for (const theta of linspace(0, 2 * Math.PI, 100, false)) {
  verts.push(
    polar2Cart(getRadiusAtT(theta, 0), theta)
  );
}
const camShape = new THREE.Shape();
for (const [x, y] of verts) {
  camShape.lineTo(x, y);
}
camShape.lineTo(verts[0][0], verts[0][1]);
const camGeometry = new THREE.ExtrudeGeometry(
  camShape,
  {
    steps: 1,
    depth: 0.25,
    bevelEnabled: false,
  }
);
const camMesh = new THREE.Mesh(
  camGeometry,
  MATERIAL_METAL_RED
);
camMesh.rotation.x = Math.PI / 2;
const cam = new THREE.Group();
cam.add(camMesh);
cam.add(new THREE.AxesHelper(8));
scene.add(cam);

// Create the pulley wheels
const pulleyWheels: PulleyWheel[] = [];
const nRows = 5;
const nCols = 10;
const spacing = 0.5;
const angularSpacing = 2 * Math.PI / nCols;

for (let col = 0; col < nCols; col++) {
  const balls: Ball[] = [];
  for (let row = 0; row < nRows; row++) {
    const ball = new Ball(MATERIAL_CARBON);
    ball.position.z = (row - (nRows - 1) / 2) * spacing;
    ball.position.x = (col - (nCols - 1) / 2) * spacing;
    balls.push(ball);
  }

  const pulleyWheel = new PulleyWheel(MATERIAL_METAL_GRAY, col * angularSpacing, balls);
  pulleyWheels.push(pulleyWheel);
  scene.add(pulleyWheel);
}

// Animate the mechanism
const clock = new THREE.Clock();
function animate() {
  const t_sec = clock.getElapsedTime();
  // let delta = clock.getDelta();
  requestAnimationFrame(animate);
  cam.rotation.y = getAngleAtTime(t_sec);
  for (const wheel of pulleyWheels) {
    wheel.animate(t_sec);
  }

  const timer = t_sec * 0.15;
  particleLight.position.x = Math.sin(timer * 7) * 300;
  particleLight.position.y = Math.cos(timer * 5) * 400;
  particleLight.position.z = Math.cos(timer * 3) * 300;

  renderer.render(scene, camera);
};

animate();