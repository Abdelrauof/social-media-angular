import { User } from './user.model';

export interface CommentCreator {
  _id: string;
  name: string;
  username?: string;
  photo?: string;
}

export interface PostComment {
  _id: string;
  content?: string;
  image?: string;
  commentCreator: CommentCreator;
  post: string;
  createdAt: string;
  likesCount?: number;
  repliesCount?: number;
  isLiked?: boolean;
}

export interface CommentReply {
  _id: string;
  content?: string;
  image?: string;
  commentCreator: CommentCreator;
  comment: string;
  createdAt: string;
  likesCount?: number;
  isLiked?: boolean;
}

