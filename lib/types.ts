export interface Post {
  id: string;
  title: string;
  slug: string;
  content?: string;
  createdAt: string | Date;
}
