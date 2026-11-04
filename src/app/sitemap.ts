import type { MetadataRoute } from 'next';
import { getAllTags, getAllTopics, getSortedPostsData } from '@/lib/posts';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getSortedPostsData();

  return [
    { url: SITE_URL, lastModified: posts[0]?.date },
    ...posts.map((post) => ({ url: `${SITE_URL}/posts/${post.slug}`, lastModified: post.date })),
    ...getAllTopics()
      .filter((topic) => topic.count > 0)
      .map((topic) => ({ url: `${SITE_URL}/topics/${topic.slug}` })),
    ...getAllTags().map((tag) => ({ url: `${SITE_URL}/tags/${tag.slug}` })),
  ];
}
