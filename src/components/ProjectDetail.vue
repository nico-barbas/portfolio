<script setup>
import {} from "vue";

const props = defineProps(["opened", "project"]);
const emit = defineEmits(["closedetail"]);

console.log(props);
</script>

<template>
  <div
    class="w-3/4 h-3/4 relative top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] bg-yellow-50 rounded-[4rem]"
    v-if="props.opened"
  >
    <div class="relative w-full h-full p-8">
      <div
        class="w-8 h-8 flex justify-center items-center absolute top-0 right-0 m-8 rounded-full bg-red-300 hover:bg-red-200 cursor-pointer"
        @click="$emit('closedetail')"
      >
        X
      </div>

      <div class="flex justify-center text-stone-600">
        <h3>{{ props.project.title }}</h3>
      </div>
    </div>
    <p></p>
  </div>
</template>
