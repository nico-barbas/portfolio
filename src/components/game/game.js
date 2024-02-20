import * as THREE from "three";
import { World } from "./world";
import { Player } from "./player";

export function initGame(displayTarget) {
  const displayRect = displayTarget.getBoundingClientRect();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    displayRect.width / displayRect.height,
    0.1,
    1000
  );
  camera.position.z = 15;
  camera.position.y = 15;

  const directional = new THREE.DirectionalLight(0xffffff, 10);
  const ambient = new THREE.AmbientLight(0xffffff, 5);
  scene.add(directional, ambient);

  const renderer = new THREE.WebGLRenderer({
    canvas: displayTarget,
  });
  renderer.setSize(displayRect.width, displayRect.height);
  renderer.setClearColor(new THREE.Color("#141b25"), 1.0);

  const world = new World(scene);
  const player = new Player(scene, camera, world);

  const animate = () => {
    requestAnimationFrame(animate);

    player.updateSelection();
    world.updateClouds();

    renderer.render(scene, camera);
  };
  animate();
}
