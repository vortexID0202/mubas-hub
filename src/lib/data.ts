import {
  CommunityQuestion,
  KnowledgeBaseArticle,
  LiveUpdate,
  User,
  Tag
} from '@/lib/types';

// Use a deterministic method to generate reputation to avoid hydration errors.
export const users: User[] = Array.from({ length: 10 }, (_, i) => ({
  id: `user${i + 1}`,
  name: `Student ${i + 1}`,
  avatarUrl: `https://picsum.photos/seed/user${i+1}/40/40`,
  reputation: 50 + ((i * 37) % 450), // Predictable reputation based on index
}));


export const sampleTags: Tag[] = [
  { id: '1', name: 'smis' },
  { id: '2', name: 'wifi' },
  { id: '3', name: 'fees' },
  { id: '4', name: 'academics' },
  { id: '5', name: 'exams' },
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
  {
    id: 'kb-4',
    title: 'Official Guide to Resetting Your SMIS Password',
    category: 'SMIS',
    icon: 'BookOpen',
    body: 'This is the official guide from the ICT services department for resetting your SMIS password. It covers the online "Forgot Password" process and the alternative in-person method.',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
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

    