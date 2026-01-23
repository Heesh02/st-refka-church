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

export type Category = 'All' | 'Sermons' | 'Liturgies' | 'Bible Study' | 'El Hekaya' | 'Youth Meeting' | 'Ma3loma' | 'Kids';

export const CATEGORIES: Category[] = ['All', 'Sermons', 'Liturgies', 'Bible Study', 'El Hekaya', 'Youth Meeting', 'Ma3loma', 'Kids'];

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