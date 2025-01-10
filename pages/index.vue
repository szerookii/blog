<template>
  <Header />
  <LatestTitle />
  <section id="new-posts" class="grid grid-cols-1 md:grid-cols-2 gap-8 mx-8 my-28">
    <Card v-for="post in posts.slice(0, 5)" :key="post.slug" :title="post.title ?? ''" :description="post.description" :image="post.image" :tags="post.tags" :slug="post._path?.split('/').pop() || ''" />
  </section>
</template>

<script setup lang="ts">
import Header from '@/components/header.vue';
import LatestTitle from '@/components/latest_title.vue';

const posts = await queryContent('posts').sort({ pubDate: -1 }).find();

useSeoMeta({
  colorScheme: '#c084fc',
  title: 'Blog de Mathis',
  description: 'Bienvenue sur mon blog! Ici je parle de tout ce qui me passionne, de la programmation au reverse engineering en passant par le hacking éthique.',
  creator: 'szeroki',

  // Open Graph
  ogTitle: 'Blog de Mathis',
  ogDescription: 'Bienvenue sur mon blog! Ici je parle de tout ce qui me passionne, de la programmation au reverse engineering en passant par le hacking éthique.',
  ogType: 'website',
  ogUrl: 'https://blog.szeroki.fr',
  ogImage: 'https://blog.szeroki.fr/og-image.png',
  ogImageAlt: 'Blog de Mathis',

  // Twitter
  twitterTitle: 'Blog de Mathis',
  twitterDescription: 'Bienvenue sur mon blog! Ici je parle de tout ce qui me passionne, de la programmation au reverse engineering en passant par le hacking éthique.',
  twitterCard: 'summary_large_image',
  twitterImage: 'https://blog.szeroki.fr/og-image.png',
  twitterImageAlt: 'Blog de Mathis',
});

useJsonld(() => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  headline: 'Blog de Mathis',
  url: 'https://blog.szeroki.fr',
  description: 'Bienvenue sur mon blog! Ici je parle de tout ce qui me passionne, de la programmation au reverse engineering en passant par le hacking éthique.',
  mainEntity: posts.map((post) => ({
    '@type': 'BlogPosting',
    headline: post.title,
    url: `https://blog.szeroki.fr/posts/${post.slug}`,
    datePublished: post.pubDate,
    author: {
      '@type': 'Person',
      name: 'szeroki',
    },
    image: {
      '@type': 'ImageObject',
      url: `https://blog.szeroki.fr${post.image}`,
    }
  })),
}));
</script>