import { FieldValue } from 'firebase/firestore';

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  reputation: number;
  createdAt: FieldValue;
  status?: 'active' | 'suspended';
};

export type User = {
  id:string;
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
  isFlagged?: boolean;
  answers?: QuestionAnswer[];
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

export type Log = {
    id: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    createdAt: FieldValue | string;
    context?: {
        userId?: string;
        ip?: string;
        service?: string;
    }
}

export type Notification = {
    id: string;
    userId: string; // The user who should receive the notification
    actorId: string; // The user who performed the action
    actorName: string;
    actorAvatar: string;
    type: 'new_answer' | 'question_upvote' | 'answer_approved' | 'question_flagged';
    questionTitle: string;
    relatedItemId: string; // e.g., question ID
    createdAt: FieldValue | string;
    isRead: boolean;
}
