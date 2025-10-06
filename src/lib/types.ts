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
  author: User;
  createdAt: string;
  tags: Tag[];
  votes: number;
  answersCount: number;
  views: number;
  answers: QuestionAnswer[];
};

export type QuestionAnswer = {
  id: string;
  body: string;
  author: User;
  createdAt: string;
  votes: number;
  comments: AnswerComment[];
  isVerified?: boolean;
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
  body: string;
  createdAt: string;
};

export type LiveUpdate = {
  id: string;
  title: string;
  content: string;
  category: 'Announcement' | 'Maintenance' | 'Academics';
  createdAt: string;
}
