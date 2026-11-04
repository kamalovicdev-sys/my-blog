import { slugify } from './slug';

export type Topic = { slug: string; name: string; description: string; tags: string[] };

// Bosh sahifadagi mavzular. Har biri bir nechta tegni birlashtiradi: post shu teglardan biriga ega bo'lsa, mavzuga kiradi.
// Yangi teg ishlatsangiz, uni shu yerdagi mavzulardan biriga qo'shing, aks holda u faqat o'z teg sahifasida ko'rinadi
export const TOPICS: Topic[] = [
  {
    slug: 'technology',
    name: 'Technology',
    description: 'Systems, databases and AI.',
    tags: ['System Design', 'Data', 'algorithm', 'python', 'database', 'sql', 'noSql', 'ai'],
  },
  {
    slug: 'relationships',
    name: 'Relationships',
    description: 'Relationships, marriage and family.',
    tags: ['munosabatlar', 'oila', 'psychology'],
  },
  {
    slug: 'mind-and-habits',
    name: 'Mind & habits',
    description: 'Procrastination, discipline and goals.',
    tags: ['procrastination', 'discipline', 'maqsad'],
  },
  {
    slug: 'space-and-science',
    name: 'Space & science',
    description: 'The universe and the search for life.',
    tags: ['Fermi Paradox', 'galaxy', 'alien'],
  },
];

// "Linux" va "linux" bitta teg: solishtirish slug orqali
export function topicHasTag(topic: Topic, tagSlug: string) {
  return topic.tags.some((tag) => slugify(tag) === tagSlug);
}
