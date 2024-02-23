<script setup>
import { onMounted, ref } from "vue";
import ProjectDetail from "./ProjectDetail.vue";

const props = defineProps(["projects"]);

const detailOpened = ref(false);
const currentProject = ref(null);

onMounted(() => {
  window.addEventListener("projectopened", handleProjectOpen);
});

function handleProjectOpen(event) {
  const id = event.detail.id;

  detailOpened.value = true;
  currentProject.value = props.projects.find((el) => {
    return el.id === id;
  });
}

function closeProjectDetail() {
  detailOpened.value = false;
  window.dispatchEvent(new CustomEvent("projectclosed"));
}
</script>

<template>
  <ProjectDetail
    :opened="detailOpened"
    :project="currentProject"
    @closedetail="closeProjectDetail"
  ></ProjectDetail>
</template>
