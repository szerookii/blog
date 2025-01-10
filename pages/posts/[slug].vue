<template>
  <div class="max-w-4xl mx-auto px-8 pb-12">
    <header class="mb-8 space-y-3 mt-12">
      <p class="text-gray-600">{{ dayjs(post.pubDate).format('DD MMMM YYYY') }}
        &bull; {{ post.readingTime }} minute{{ post.readingTime > 1 ? "s" : "" }} de lecture</p>
      <h1 class="text-4xl font-bold mb-2">{{ post.title }}</h1>
      <p class="text-gray-600 space-y-1">Tags: <span v-for="tag in post.tags" :key="tag"
          class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-white bg-purple-400 mr-2">{{
          tag }}</span></p>
      <img :src="post.image" alt="Post image" class="w-full h-auto object-contain mt-4 rounded-lg" />
    </header>

    <article class="prose prose-code:!bg-background prose-pre:!p-0 max-w-full prose-hr:border-gray-600 prose-li:marker:text-black font-mono">
      <ContentRendererMarkdown :value="post">
        <template #empty>
          <p>Aucun contenu pour cet article.</p>
        </template>
      </ContentRendererMarkdown>
    </article>
  </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
dayjs.locale('fr'); // TODO: move this to a global setup

import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import "highlight.js/styles/tokyo-night-dark.min.css";

definePageMeta({
  async validate({ params }) {
    return await queryContent('posts').where({
      slug: params.slug,
    }).findOne() !== null;
  },
});

const route = useRoute();
const post = await queryContent('posts').where({
  slug: route.params.slug as string,
}).findOne();

useSeoMeta({
  colorScheme: "#c084fc",
  title: post.title,
  description: post.description,

  creator: 'szeroki',
  author: 'szeroki',
  articleAuthor: ["szeroki"],
  articlePublishedTime: post.pubDate,
  articleModifiedTime: post.pubDate,
  articleTag: post.tags,

  // Open Graph
  ogTitle: post.title,
  ogImage: post.image,
  ogImageAlt: post.title,
  ogDescription: post.description,
  ogType: 'article',
  ogUrl: `https://blog.szeroki.fr/posts/${post.slug}`,

  // Twitter
  twitterTitle: post.title,
  twitterImage: post.image,
  twitterImageAlt: post.title,
  twitterDescription: post.description,
  twitterCard: 'summary_large_image',
});

useJsonld(() => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.description,
  author: {
    '@type': 'Person',
    name: 'szeroki',
  },
  publisher: {
    '@type': 'Organization',
    name: 'szeroki',
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `https://blog.szeroki.fr/posts/${post.slug}`,
  },
  image: {
    '@type': 'ImageObject',
    url: `https://blog.szeroki.fr${post.image}`,
  },
  datePublished: post.pubDate,
  dateModified: post.pubDate,
  wordCount: post.wordCount,
  articleSection: post.tags.join(', '),
  inLanguage: 'fr-FR',
  keywords: post.tags.join(', '),
  potentialAction: {
    '@type': 'ReadAction',
    target: `https://blog.szeroki.fr/posts/${post.slug}`,
  },
}));  

onMounted(() => {
  hljs.registerLanguage('javascript', javascript);
  hljs.registerLanguage('json', json);
  hljs.highlightAll();
});
</script>