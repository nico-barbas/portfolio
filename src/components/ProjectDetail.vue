<script setup>
import {} from "vue";

const props = defineProps(["opened", "project"]);
const emit = defineEmits(["closedetail"]);
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

      <div class="flex flex-col justify-center items-center text-stone-600">
        <h2 class="mb-2">{{ project.title }}</h2>
        <h3>
          {{ project.dateStart }} -
          {{ project.dateEnd ? project.dateEnd : "Present" }}
        </h3>

        <div class="w-2/3 flex flex-wrap justify-center gap-1 my-2">
          <div v-for="tag in project.tags" class="bg-red-100 rounded-xl">
            <p class="text-center px-3">{{ tag }}</p>
          </div>
        </div>

        <div class="mt-4">
          <p>{{ project.description }}</p>
        </div>
      </div>
    </div>
    <p></p>
  </div>
</template>
