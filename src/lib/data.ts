import {
  CommunityQuestion,
  KnowledgeBaseArticle,
  LiveUpdate,
  User,
} from '@/lib/types';

export const users: User[] = Array.from({ length: 10 }, (_, i) => ({
  id: `user${i + 1}`,
  name: `Student ${i + 1}`,
  avatarUrl: `https://picsum.photos/seed/user${i + 1}/40/40`,
  reputation: Math.floor(Math.random() * 500) + 50,
}));

const sampleTags = [
  { id: '1', name: 'smis' },
  { id: '2', name: 'wifi' },
  { id: '3', name: 'fees' },
  { id: '4', name: 'academics' },
  { id: '5', name: 'exams' },
];

export const communityQuestions: CommunityQuestion[] = [
  {
    id: '1',
    title: 'How do I reset my SMIS password?',
    body: "I've been trying to log into SMIS to check my results, but I can't remember my password. The 'Forgot Password' link doesn't seem to be working. Is there another way to reset it?",
    author: users[0],
    createdAt: '2 days ago',
    tags: [sampleTags[0], sampleTags[4]],
    votes: 15,
    answersCount: 2,
    views: 120,
    answers: [
      {
        id: 'a1-1',
        body: 'You have to go to the ICT center in person. They can reset it for you there. Make sure to bring your student ID.',
        author: users[2],
        createdAt: '2 days ago',
        votes: 20,
        comments: [],
      },
      {
        id: 'a1-2',
        body: "Sometimes the email goes to spam. Check your spam folder for the password reset link from 'smis-support@mubas.ac.mw'.",
        author: users[3],
        createdAt: '1 day ago',
        votes: 5,
        comments: [
          {
            id: 'c1-2-1',
            body: 'This worked for me, thanks!',
            author: users[0],
            createdAt: '1 day ago',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'What is the best way to prepare for supplementary exams?',
    body: 'I have a supplementary exam in Engineering Maths and I am not sure how to best prepare for it. Any tips from those who have passed it before?',
    author: users[1],
    createdAt: '5 days ago',
    tags: [sampleTags[4], sampleTags[3]],
    votes: 8,
    answersCount: 1,
    views: 250,
    answers: [
      {
        id: 'a2-1',
        body: 'Focus on past papers. The structure of the exam rarely changes. The library has a collection of them. Good luck!',
        author: users[4],
        createdAt: '5 days ago',
        votes: 12,
        comments: [],
      },
    ],
  },
  {
    id: '3',
    title: 'Where can I find the official academic calendar for this year?',
    body: 'I need to know the official dates for the semester break and when the next semester starts. The one on the main website seems outdated.',
    author: users[5],
    createdAt: '1 week ago',
    tags: [sampleTags[3]],
    votes: 22,
    answersCount: 1,
    views: 400,
    answers: [
       {
        id: 'a3-1',
        body: "It's usually posted on the main noticeboard in the Chichiri building first. Someone usually posts a picture of it on the class WhatsApp groups.",
        author: users[6],
        createdAt: '1 week ago',
        votes: 10,
        comments: [],
      },
    ]
  },
];

export const knowledgeBaseArticles: KnowledgeBaseArticle[] = [
  {
    id: 'kb-1',
    title: 'Setting up MUBAS Wi-Fi on your device',
    category: 'Wi-Fi',
    icon: 'Wifi',
    body: 'This article provides a step-by-step guide on how to connect your laptop or mobile device to the official MUBAS campus Wi-Fi network. It includes settings for Windows, macOS, Android, and iOS.',
    createdAt: '1 month ago',
  },
  {
    id: 'kb-2',
    title: 'How to Pay Your School Fees via Bank',
    category: 'Fees',
    icon: 'Landmark',
    body: 'Learn the correct procedure for paying school fees through National Bank or Standard Bank. This guide includes the correct account numbers and how to fill out the deposit slip.',
    createdAt: '2 months ago',
  },
  {
    id: 'kb-3',
    title: 'Library Services and Opening Hours',
    category: 'Academics',
    icon: 'BookOpen',
    body: 'Find all the information you need about the MUBAS library, including opening and closing times, borrowing policies, and access to online journals.',
    createdAt: '3 weeks ago',
  },
];

export const liveUpdates: LiveUpdate[] = [
  {
    id: 'update-1',
    title: 'SMIS Portal Update',
    content: 'The Student Management Information System (SMIS) will be undergoing scheduled maintenance on Friday from 10 PM to Saturday 2 AM. The portal will be inaccessible during this time.',
    category: 'Maintenance',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'update-2',
    title: 'New Wi-Fi Hotspots Added',
    content: 'We have added new Wi-Fi hotspots in the ODL building and the main cafeteria to improve network coverage. Please reconnect to the "MUBAS-WIFI" network to use them.',
    category: 'Announcement',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'update-3',
    title: 'End of Semester Examination Timetable Released',
    content: 'The final examination timetable for the current semester has been released. You can find it on the main noticeboard and on the university website\'s downloads section.',
    category: 'Academics',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'update-4',
    title: 'Library Extended Opening Hours',
    content: 'During the examination period, the library will extend its opening hours until 10 PM on weekdays and will be open from 9 AM to 5 PM on Saturdays.',
    category: 'Announcement',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  }
];
