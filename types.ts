
import React from 'react';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string;
  bio?: string;
  skills?: string[];
  role: 'développeur' | 'designer' | 'entrepreneur' | 'admin';
  points: number;
  badges: string[];
  joinedAt: string;
  notificationPreferences?: {
    emailDigest: boolean;
    pushEnabled: boolean;
    realTime: boolean;
  };
  pushToken?: string;
  groups?: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'social' | 'system' | 'news';
  read: boolean;
  link?: string;
  createdAt: any;
}
export interface NavItem {
  label: string;
  href: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Resource {
  id: string;
  category: 'TUTORIEL' | 'DOCUMENTATION' | 'OUTIL' | 'SNIPPET';
  title: string;
  description: string;
  author: string;
  level: 'Débutant' | 'Intermédiaire' | 'Expert';
  readTime: string;
  icon: React.ReactNode;
  tags: string[];
}

export interface Member {
  id: string;
  hacker_name: string;
  email: string;
  registered_at: string;
}

export interface Reminder {
  id: string;
  task: string;
  dueTime: string; // ISO string
  createdAt: string; // ISO string
  notified: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  title: string;
  content: string;
  tags: string[];
  group?: string; // React Gabon, Flutter, Débutants, Freelance, IA
  likesCount: number;
  likes?: string[]; // user UIDs who liked
  commentsCount: number;
  createdAt: string; // ISO String
}

export interface Project {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  name: string;
  description: string;
  demoUrl?: string;
  githubUrl?: string;
  imageUrl?: string;
  tags: string[];
  likesCount: number;
  likes?: string[]; // user UIDs who liked
  commentsCount: number;
  createdAt: string; // ISO String
  isOfficial?: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  createdAt: string; // ISO String
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  createdAt: string; // ISO String
}

export interface Inquiry {
  id: string;
  name: string;
  contact: string;
  service: string;
  description: string;
  status: 'nouveau' | 'en_cours' | 'traite' | 'archive';
  createdAt: string;
  budget?: string;
  notes?: string;
}


