import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.querySelector("canvas.webgl");
const canvasSize = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(
  75,
  canvasSize.width / canvasSize.height,
  1,
  1000
);

const control = new OrbitControls(cam, canvas);
control.autoRotate = true;
control.autoRotateSpeed = 0.69;
control.enableDamping = true;
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
window.addEventListener("resize", () => {
  canvasSize.width = window.innerWidth;
  canvasSize.height = window.innerHeight;
  cam.aspect = canvasSize.width / canvasSize.height;
  cam.updateProjectionMatrix();
  renderer.setSize(canvasSize.width, canvasSize.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.render(scene, cam);
});
renderer.setSize(canvasSize.width, canvasSize.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const geometry = new THREE.BufferGeometry();
const count = 100000;
const radius = 50;
const sizeMin = 0.5;
const sizeMax = 3;
const layers = 7;
const vertices = new Float32Array(count * 3 * 3);
geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

const redMat = new THREE.MeshBasicMaterial({
  color: "red",
  wireframe: true,
});
const orangeMat = new THREE.MeshBasicMaterial({
  color: "orange",
  wireframe: true,
});
const yellowMat = new THREE.MeshBasicMaterial({
  color: "yellow",
  wireframe: true,
});
const greenMat = new THREE.MeshBasicMaterial({
  color: "green",
  wireframe: true,
});
const cyanMat = new THREE.MeshBasicMaterial({
  color: "cyan",
  wireframe: true,
});
const blueMat = new THREE.MeshBasicMaterial({
  color: "blue",
  wireframe: true,
});
const purpleMat = new THREE.MeshBasicMaterial({
  color: "purple",
  wireframe: true,
});

const materials = [
  redMat,
  orangeMat,
  yellowMat,
  greenMat,
  cyanMat,
  blueMat,
  purpleMat,
];
const weights = Array.from({ length: layers }, (_, i) => i + 1); // [1, 2, 3, 4, 5, 6, 7]
const weightSum = weights.reduce((a, b) => a + b, 0);

// Compute triangle counts per layer
const trianglesPerLayer = weights.map((w) =>
  Math.round((w / weightSum) * count)
);

for (let layer = 0; layer < layers; layer++) {
  const triangleCount = trianglesPerLayer[layer];
  const layerGeometry = new THREE.BufferGeometry();
  const layerVertices = new Float32Array(triangleCount * 3 * 3);

  const minR = (layer / layers) * radius;
  const maxR = ((layer + 1) / layers) * radius;

  for (let i = 0; i < triangleCount; i++) {
    const triIndex = i * 9;
    const center = new THREE.Vector3().setFromSphericalCoords(
      THREE.MathUtils.randFloat(minR, maxR),
      Math.random() * Math.PI,
      Math.random() * 2 * Math.PI
    );

    const size = THREE.MathUtils.randFloat(sizeMin, sizeMax);
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
  const mesh = new THREE.Mesh(layerGeometry, materials[layer]);
  scene.add(mesh);
}

scene.add(cam);
cam.position.z = 100;
cam.position.y = 1;
cam.lookAt(new THREE.Vector3(0));
const clock = new THREE.Clock();
const tick = () => {
  renderer.render(scene, cam);
  control.update(clock.getDelta());
  window.requestAnimationFrame(tick);
};
tick();
renderer.render(scene, cam);
