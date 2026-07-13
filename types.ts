
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

export interface Lesson {
  title: string;
  content: string;
  practicalExercise?: string;
}

export interface TrainingModule {
  id: string;
  order: number;
  title: string;
  description: string;
  category: string;
  lessons: Lesson[];
  duration: string;
}
