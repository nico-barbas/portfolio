<script setup>
import { onMounted, ref } from "vue";
import Game from "./components/Game.vue";
import Navbar from "./components/Navbar.vue";

const projects = ref([]);

onMounted(() => {
  fetch("data/projects.json", {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log("Loaded all projects");
      projects.value = data;
    })
    .catch((err) => {
      console.error(err);
    });
});
</script>

<template>
  <Navbar msg="Vite + Vue" />
  <Game :projects="projects"></Game>
</template>
