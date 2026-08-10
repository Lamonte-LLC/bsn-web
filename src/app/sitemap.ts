import type { MetadataRoute } from 'next';

const BASE_URL = 'https://bsnpr.com';
const WP_API = 'https://wp.bsnpr.com/wp-json/wp/v2';

// Team codes used in /equipos/[code]
const TEAM_CODES = [
  'AGU', // Santeros
  'ARE', // Capitanes
  'BAY', // Vaqueros
  'CAG', // Criollos
  'CAR', // Gigantes
  'GBO', // Mets
  'MAN', // Osos
  'MAY', // Indios
  'PON', // Leones
  'QUE', // Piratas
  'SCE', // Cangrejeros
  'SGE', // Atléticos
];

type WpPost = { slug: string; modified: string };

// Fetch all post slugs from WordPress (paginated, 100 per page)
async function getWpPosts(): Promise<WpPost[]> {
  const posts: WpPost[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `${WP_API}/posts?per_page=100&page=${page}&_fields=slug,modified`,
      { next: { revalidate: 3600 } } // re-fetch at most once per hour
    );
    if (!res.ok) break; // WP returns 400 past the last page

    const batch: WpPost[] = await res.json();
    posts.push(...batch);

    const totalPages = Number(res.headers.get('X-WP-TotalPages') ?? 1);
    if (page >= totalPages) break;
    page++;
  }

  return posts;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/calendario`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/playoffs`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/noticias`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/jugadores`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/estadisticas`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/boletos`, changeFrequency: 'weekly', priority: 0.7 },
  ];

  const teamRoutes: MetadataRoute.Sitemap = TEAM_CODES.map((code) => ({
    url: `${BASE_URL}/equipos/${code}`,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  let newsRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await getWpPosts();
    newsRoutes = posts.map((post) => ({
      url: `${BASE_URL}/noticias/${post.slug}`,
      lastModified: new Date(post.modified),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch {
    // If WP is unreachable, still serve the static portion of the sitemap
  }

  return [...staticRoutes, ...teamRoutes, ...newsRoutes];
}
