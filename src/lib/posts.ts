import { getCollection } from 'astro:content';

/** 公開済みの記事を新しい順に返す */
export async function getPublishedPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export const formatDate = (d: Date) =>
  `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
