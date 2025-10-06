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
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: [sampleTags[0], sampleTags[4]],
    votes: 15,
    answersCount: 2,
    views: 120,
    answers: [
      {
        id: 'a1-1',
        body: 'You have to go to the ICT center in person. They can reset it for you there. Make sure to bring your student ID.',
        author: users[2],
        createdAt: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        votes: 20,
        comments: [],
        isVerified: true,
      },
      {
        id: 'a1-2',
        body: "Sometimes the email goes to spam. Check your spam folder for the password reset link from 'smis-support@mubas.ac.mw'.",
        author: users[3],
        createdAt: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
        votes: 5,
        comments: [
          {
            id: 'c1-2-1',
            body: 'This worked for me, thanks!',
            author: users[0],
            createdAt: new Date(
              Date.now() - 1 * 24 * 60 * 60 * 1000
            ).toISOString(),
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
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: [sampleTags[4], sampleTags[3]],
    votes: 8,
    answersCount: 1,
    views: 250,
    answers: [
      {
        id: 'a2-1',
        body: 'Focus on past papers. The structure of the exam rarely changes. The library has a collection of them. Good luck!',
        author: users[4],
        createdAt: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
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
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    tags: [sampleTags[3]],
    votes: 22,
    answersCount: 1,
    views: 400,
    answers: [
      {
        id: 'a3-1',
        body: "It's usually posted on the main noticeboard in the Chichiri building first. Someone usually posts a picture of it on the class WhatsApp groups.",
        author: users[6],
        createdAt: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        votes: 10,
        comments: [],
      },
    ],
  },
  {
    id: '4',
    title: 'Is the library open during the weekend?',
    body: 'I want to study in the library this weekend, but I am not sure about the opening hours during the weekend. Can anyone confirm?',
    author: users[3],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    tags: [sampleTags[3]],
    votes: 5,
    answersCount: 1,
    views: 90,
    answers: [
       {
        id: 'a4-1',
        body: 'Yes, it is open on Saturdays from 9 AM to 5 PM. It is closed on Sundays.',
        author: users[8],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        votes: 8,
        comments: [],
      }
    ]
  },
   {
    id: '5',
    title: 'How can I apply for a scholarship?',
    body: 'I am a first-year student and I would like to apply for a scholarship. What are the requirements and where can I find the application forms?',
    author: users[7],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    tags: [sampleTags[2], sampleTags[3]],
    votes: 18,
    answersCount: 0,
    views: 150,
    answers: []
  },
   {
    id: '6',
    title: 'What are the requirements for joining the basketball team?',
    body: 'I love basketball and I would like to join the university team. What is the process for tryouts and what are the requirements?',
    author: users[9],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    tags: [],
    votes: 3,
    answersCount: 0,
    views: 60,
    answers: []
  }
];

export const knowledgeBaseArticles: KnowledgeBaseArticle[] = [
  {
    id: 'kb-1',
    title: 'Setting up MUBAS Wi-Fi on your device',
    category: 'Wi-Fi',
    icon: 'Wifi',
    body: 'This article provides a step-by-step guide on how to connect your laptop or mobile device to the official MUBAS campus Wi-Fi network. It includes settings for Windows, macOS, Android, and iOS.',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'kb-2',
    title: 'How to Pay Your School Fees via Bank',
    category: 'Fees',
    icon: 'Landmark',
    body: 'Learn the correct procedure for paying school fees through National Bank or Standard Bank. This guide includes the correct account numbers and how to fill out the deposit slip.',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'kb-3',
    title: 'Library Services and Opening Hours',
    category: 'Academics',
    icon: 'BookOpen',
    body: 'Find all the information you need about the MUBAS library, including opening and closing times, borrowing policies, and access to online journals.',
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const liveUpdates: LiveUpdate[] = [
  {
    id: 'update-1',
    title: 'SMIS Portal Update',
    content:
      'The Student Management Information System (SMIS) will be undergoing scheduled maintenance on Friday from 10 PM to Saturday 2 AM. The portal will be inaccessible during this time.',
    category: 'Maintenance',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'update-2',
    title: 'New Wi-Fi Hotspots Added',
    content:
      'We have added new Wi-Fi hotspots in the ODL building and the main cafeteria to improve network coverage. Please reconnect to the "MUBAS-WIFI" network to use them.',
    category: 'Announcement',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'update-3',
    title: 'End of Semester Examination Timetable Released',
    content:
      "The final examination timetable for the current semester has been released. You can find it on the main noticeboard and on the university website's downloads section.",
    category: 'Academics',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'update-4',
    title: 'Library Extended Opening Hours',
    content:
      'During the examination period, the library will extend its opening hours until 10 PM on weekdays and will be open from 9 AM to 5 PM on Saturdays.',
    category: 'Announcement',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
