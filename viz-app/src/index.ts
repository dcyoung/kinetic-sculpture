import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { getAngleAtTime, getRadiusAtT, linspace, polar2Cart } from "./helpers";
import { Ball, PulleyWheel } from "./models";

const ASSETS_ROOT_PATH = "assets/";
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
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();
new EXRLoader()
  .load(`${ASSETS_ROOT_PATH}env-maps/large_corridor_4k.exr`, function (texture) {
    let exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
    scene.environment = exrCubeRenderTarget.texture;
    scene.background = exrCubeRenderTarget.texture;
    texture.dispose();
  });
// new HDRCubeTextureLoader()
//   .load([
//     `${ASSETS_ROOT_PATH}pisaHDR/px.hdr`,
//     `${ASSETS_ROOT_PATH}pisaHDR/nx.hdr`,
//     `${ASSETS_ROOT_PATH}pisaHDR/py.hdr`,
//     `${ASSETS_ROOT_PATH}pisaHDR/ny.hdr`,
//     `${ASSETS_ROOT_PATH}pisaHDR/pz.hdr`,
//     `${ASSETS_ROOT_PATH}pisaHDR/nz.hdr`,
//   ], function (texture) {
//     scene.background = texture;
//     scene.environment = texture;
//   });

// Materials
const textureLoader = new THREE.TextureLoader();
const carbonDiffuse = textureLoader.load(`${ASSETS_ROOT_PATH}carbon.png`);
carbonDiffuse.encoding = THREE.sRGBEncoding;
carbonDiffuse.wrapS = THREE.RepeatWrapping;
carbonDiffuse.wrapT = THREE.RepeatWrapping;
carbonDiffuse.repeat.x = 10;
carbonDiffuse.repeat.y = 10;
const carbonNormalMap = textureLoader.load(`${ASSETS_ROOT_PATH}carbon_normal.png`);
carbonNormalMap.wrapS = THREE.RepeatWrapping;
carbonNormalMap.wrapT = THREE.RepeatWrapping;

const MATERIAL_CARBON = new THREE.MeshPhysicalMaterial({
  roughness: 0.5,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  map: carbonDiffuse,
  normalMap: carbonNormalMap
});

const normalMapRoughMetal = textureLoader.load(`${ASSETS_ROOT_PATH}water_normal.jpg`);
const clearcoatNormalMap = textureLoader.load(`${ASSETS_ROOT_PATH}gold-scratched-normal.png`);
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


const sculpture = new THREE.Group();
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
sculpture.add(cam);

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
  sculpture.add(pulleyWheel);
}

sculpture.position.y += 3;
scene.add(sculpture);

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