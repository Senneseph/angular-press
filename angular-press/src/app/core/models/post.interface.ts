export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  status: 'draft' | 'published';
  publishDate: Date;
  categories: string[];
  tags: string[];
  featured_image: string;
  meta: Record<string, any>;
  slug: string;
  type: 'post' | 'page';
  modified: Date;
}

export interface Page extends Post {
  template: string;
  parent?: string;
  order: number;
}