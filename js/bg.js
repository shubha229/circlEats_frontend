// js/bg.js
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const geometry = new THREE.BufferGeometry();
const vertices = [];
for (let i=0; i<1000; i++) {
  vertices.push((Math.random()-0.5)*2000);
  vertices.push((Math.random()-0.5)*2000);
  vertices.push((Math.random()-0.5)*2000);
}
geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

const material = new THREE.PointsMaterial({ color: 0x00ffcc, size: 1 });
const points = new THREE.Points(geometry, material);
scene.add(points);

camera.position.z = 100;

function animate() {
  requestAnimationFrame(animate);
  points.rotation.y += 0.001;
  points.rotation.x += 0.0005;
  renderer.render(scene, camera);
}
animate();

// resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
