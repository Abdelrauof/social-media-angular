import { User } from './user.model';
import { PostComment } from './comment.model';

export interface Post {
  _id: string;
  body?: string;
  image?: string;
  user: User;
  createdAt: string;
  commentsCount?: number;
  likesCount?: number;
  sharesCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  topComments?: PostComment[];
  comments?: PostComment[];
  sharedPost?: Post;
}

export interface PostsResponse {
  message: string;
  data: {
    posts: Post[];
  };
  meta?: {
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      nextPage?: number;
    };
  };
}

export interface SinglePostResponse {
  message: string;
  data: {
    post: Post;
  };
}

