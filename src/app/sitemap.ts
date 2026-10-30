import type { MetadataRoute } from 'next';
import { getAllTags, getSortedPostsData } from '@/lib/posts';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getSortedPostsData();

  return [
    { url: SITE_URL, lastModified: posts[0]?.date },
    ...posts.map((post) => ({ url: `${SITE_URL}/posts/${post.slug}`, lastModified: post.date })),
    ...getAllTags().map((tag) => ({ url: `${SITE_URL}/tags/${tag.slug}` })),
  ];
}
