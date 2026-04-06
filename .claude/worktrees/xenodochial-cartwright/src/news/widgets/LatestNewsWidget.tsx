import {
  HOME_LATEST_NEWS_COUNT,
  loadLatestNewsForHome,
} from '@/news/server/loadLatestNews';

import LatestNewsSidebar from './LatestNewsSidebar';

/** Sidebar de noticias: misma query que home pero sin compartir props (página aislada). */
export default async function LatestNewsWidget() {
  const news = await loadLatestNewsForHome(HOME_LATEST_NEWS_COUNT);
  const sidebarArticles = news.slice(1);
  return <LatestNewsSidebar articles={sidebarArticles} />;
}
