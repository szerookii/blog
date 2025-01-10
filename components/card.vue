<template>
  <a class="bg-white shadow-pixel-art overflow-hidden p-8 md:p-12 text-center transform hover:-translate-y-2 transition-all duration-300" :href="`/posts/${slug}`">
    <h1 class="text-xl lg:text-2xl font-bold mb-6 leading-tight text-purple-500">
      {{ title }}
    </h1>
    <p class="text-ld md:text-lg mb-8 text-neutral-500 max-w-2xl mx-auto">
      {{ description }}
    </p>
    <div class="flex justify-center space-x-2">
      <span v-for="tag in tags" :key="tag" class="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
        {{ tag }}
      </span>
    </div>
  </a>
</template>

<script lang="ts" setup>
defineProps<{
  title: string;
  description: string;
  tags: string[];
  slug: string;
}>();
</script>