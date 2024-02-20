<script setup>
import { ref } from "vue";
import { initGame } from "./game/game";
import GameUI from "./GameUI.vue";

const props = defineProps(["projects"]);

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
  initGame(target.value);
}
</script>

<template>
  <div class="w-full h-[88vh] relative">
    <canvas ref="target" class="w-full h-full"></canvas>
    <div class="absolute top-0 left-0 w-full h-full">
      <GameUI :projects="props.projects"></GameUI>
    </div>
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
          <span>Loading...</span>
        </div>
      </div>
    </button>
  </div>
</template>
