import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";

// === Canvas & Sizes ===
const canvas = document.querySelector("canvas.webgl");
const canvasSize = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// === Scene & Camera ===
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(
  75,
  canvasSize.width / canvasSize.height,
  1,
  1000
);
cam.position.set(0, 1, 100);
scene.add(cam);

// === Renderer ===
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(canvasSize.width, canvasSize.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// === Resize Handling ===
window.addEventListener("resize", () => {
  canvasSize.width = window.innerWidth;
  canvasSize.height = window.innerHeight;
  cam.aspect = canvasSize.width / canvasSize.height;
  cam.updateProjectionMatrix();
  renderer.setSize(canvasSize.width, canvasSize.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// === Orbit Controls ===
const controls = new OrbitControls(cam, canvas);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.69;

// === Materials per Layer ===
const baseColors = [
  "red",
  "orange",
  "yellow",
  "green",
  "cyan",
  "blue",
  "purple",
];
const materials = baseColors.map(
  (color) => new THREE.MeshBasicMaterial({ color, wireframe: true })
);

// === GUI Parameters ===
const gui = new GUI();
const params = {
  autoRotateSpeed: 0.69,
  count: 100000,
  radius: 50,
  sizeMin: 0.5,
  sizeMax: 3,
  wireframe: true,
  regenerate: () => buildTriangles(),
};

// GUI Controls
gui
  .add(params, "autoRotateSpeed", 0, 5, 0.01)
  .onChange((val) => (controls.autoRotateSpeed = val));
gui
  .add(params, "count", 1000, 200000, 1000)
  .onFinishChange(() => buildTriangles());
gui.add(params, "radius", 10, 100, 1).onFinishChange(() => buildTriangles());
gui.add(params, "sizeMin", 0.1, 5, 0.1).onFinishChange(() => buildTriangles());
gui.add(params, "sizeMax", 0.1, 5, 0.1).onFinishChange(() => buildTriangles());
gui.add(params, "wireframe").onChange(() => buildTriangles());
gui.add(params, "regenerate");

// === Geometry Generation ===
const layers = 7;
let triangleMeshes = [];

function buildTriangles() {
  // Clean old
  triangleMeshes.forEach((mesh) => {
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
  });
  triangleMeshes = [];

  const weights = Array.from({ length: layers }, (_, i) => i + 1);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const trianglesPerLayer = weights.map((w) =>
    Math.round((w / weightSum) * params.count)
  );

  for (let layer = 0; layer < layers; layer++) {
    const triangleCount = trianglesPerLayer[layer];
    const layerGeometry = new THREE.BufferGeometry();
    const layerVertices = new Float32Array(triangleCount * 3 * 3);

    const minR = (layer / layers) * params.radius;
    const maxR = ((layer + 1) / layers) * params.radius;

    for (let i = 0; i < triangleCount; i++) {
      const triIndex = i * 9;
      const center = new THREE.Vector3().setFromSphericalCoords(
        THREE.MathUtils.randFloat(minR, maxR),
        Math.random() * Math.PI,
        Math.random() * 2 * Math.PI
      );

      const size = THREE.MathUtils.randFloat(params.sizeMin, params.sizeMax);
      for (let v = 0; v < 3; v++) {
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * size,
          (Math.random() - 0.5) * size,
          (Math.random() - 0.5) * size
        );
        const vertex = center.clone().add(offset);
        layerVertices[triIndex + v * 3 + 0] = vertex.x;
        layerVertices[triIndex + v * 3 + 1] = vertex.y;
        layerVertices[triIndex + v * 3 + 2] = vertex.z;
      }
    }

    layerGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(layerVertices, 3)
    );

    const mat = materials[layer].clone();
    mat.wireframe = params.wireframe;

    const mesh = new THREE.Mesh(layerGeometry, mat);
    scene.add(mesh);
    triangleMeshes.push(mesh);
  }
}

// Initial build
buildTriangles();

// === Animation Loop ===
const clock = new THREE.Clock();
function tick() {
  const delta = clock.getDelta();
  controls.update(delta);
  renderer.render(scene, cam);
  requestAnimationFrame(tick);
}
tick();
