<script setup>
import * as THREE from "three";
import { ref } from "vue";

const target = ref(null);
const launchText = ref(null);
const loadingText = ref(null);
const loading = ref(false);

function handleLaunchClick(event) {
  if (loading.value) {
    return;
  }

  launchText.value.classList.add("hidden");
  loadingText.value.classList.remove("hidden");
  loading.value = true;

  const timer = setTimeout(() => {
    startDemo();
    event.target.classList.add("hidden");
    clearTimeout(timer);
  }, 1000);
}

function startDemo() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    target.value.offsetWidth / target.value.offsetHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({
    canvas: target.value,
  });
  renderer.setSize(target.value.offsetWidth, target.value.offsetHeight);
  renderer.setClearColor(new THREE.Color("#141b25"), 1.0);

  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(cubeGeometry, material);
  scene.add(cube);

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };
  animate();
}
</script>

<template>
  <div class="w-full h-[88vh] relative">
    <canvas ref="target" class="w-full h-full"></canvas>
    <button
      class="absolute top-2/4 left-2/4 z-10 border-[1px] border-white px-4 py-2 translate-x-[-50%] translate-y-[-50%]"
      @click="handleLaunchClick"
    >
      <span ref="launchText" class="pointer-events-none">Launch Demo</span>
      <div ref="loadingText" class="hidden">
        <div class="flex items-center">
          <span
            class="h-8 w-8 inline-block border-4 border-white rounded-full animate-spin border-b-transparent mr-4"
          ></span>
          <span>Processing...</span>
        </div>
      </div>
    </button>
  </div>
</template>
