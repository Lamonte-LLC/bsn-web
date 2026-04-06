export type NewsTagType = {
  slug: string;
  name: string;
};

export type NewsType = {
  id: string;
  title: string;
  content: string;
  slug: string;
  excerpt?: string;
  publishedAt: string;
  imageUrl?: string;
  tags?: NewsTagType[];
};
