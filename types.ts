export interface Video {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  views: number;
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  videoId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type Category = 'All' | 'Sermons' | 'Hymns' | 'Liturgies' | 'Bible Study' | 'Kids' | 'Events';

export const CATEGORIES: Category[] = ['All', 'Sermons', 'Hymns', 'Liturgies', 'Bible Study', 'Kids', 'Events'];

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';

export interface Notification {
  id: string;
  type: 'new_video';
  title: string;
  message: string;
  videoId?: string;
  read: boolean;
  createdAt: string;
}