
import { FieldValue } from 'firebase/firestore';

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  reputation: number;
  createdAt: FieldValue;
};

export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  reputation: number;
};

export type Tag = {
  id: string;
  name: string;
};

export type CommunityQuestion = {
  id: string;
  title: string;
  body: string;
  authorId: string;
  author: User; // Author data is now denormalized and required
  createdAt: FieldValue | string;
  updatedAt?: FieldValue | string;
  tags: Tag[];
  votes: number;
  answersCount: number;
  views: number;
  isVerified?: boolean;
  upvotedBy?: string[];
};

export type QuestionAnswer = {
  id:string;
  body: string;
  author: User;
  authorId: string;
  questionId: string;
  createdAt: FieldValue | string;
  votes: number;
  comments: AnswerComment[];
  isVerified?: boolean;
  upvotedBy?: string[];
  approved?: boolean;
};

export type AnswerComment = {
  id: string;
  body: string;
  author: User;
  createdAt: string;
};

export type KnowledgeBaseArticle = {
  id: string;
  title: string;
  category: string;
  icon: string;
  content: string;
  createdAt: FieldValue | string;
  tagIds?: string[];
};

export type LiveUpdate = {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: FieldValue | string;
  authorId: string;
}
