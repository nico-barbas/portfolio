import * as THREE from "three";
import { Vector3 } from "three";
import { World } from "./world";
import { Player } from "./player";
import { particleSystem } from "./particules";

export function initGame(displayTarget, projects) {
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

  const renderer = new THREE.WebGLRenderer({
    canvas: displayTarget,
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(displayRect.width, displayRect.height);
  renderer.setClearColor(new THREE.Color("#141b25"), 1.0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const lightDir = new Vector3();
  const lightPos = new THREE.Vector3();
  const light = new THREE.DirectionalLight(0xfffee0, 2);
  light.position.set(0, 0, 20);
  light.castShadow = true;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 1024;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 2000;
  light.shadow.needsUpdate = true;

  const ambient = new THREE.AmbientLight(0xd1ebff, 1.5);
  scene.add(light, ambient);

  particleSystem.init(500);
  scene.add(particleSystem.instances);

  const world = new World(scene, projects);
  const player = new Player(scene, camera, world);

  let timeScale = 1;
  window.addEventListener("projectopened", () => {
    timeScale = 0;
  });
  window.addEventListener("projectclosed", () => {
    timeScale = 1;
  });
  const animate = () => {
    requestAnimationFrame(animate);

    const dt = (1 / 60) * timeScale;
    player.update(dt);
    world.updateClouds(player.plane ? player.plane.position : new Vector3());
    particleSystem.update(dt);

    if (player.plane) {
      lightDir.subVectors(player.plane.position, camera.position).normalize();
      lightPos.copy(player.plane.position).sub(lightDir.multiplyScalar(6));
      lightDir.normalize();
      light.position.copy(lightPos);
      light.target.position.copy(lightPos.add(lightDir));
      light.shadow.needsUpdate = true;
    }

    renderer.render(scene, camera);
  };
  animate();
}
