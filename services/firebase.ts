import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInAnonymously,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  limit,
  getDocs,
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();
const GLOBAL_GROUP_ID = "gabdev-global";

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const groupRef = doc(db, "groups", GLOBAL_GROUP_ID);
    const groupSnap = await getDoc(groupRef);
    if (!groupSnap.exists()) {
      await setDoc(groupRef, {
        id: GLOBAL_GROUP_ID,
        name: "GABdev Global Hub",
        description:
          "Le coeur de la communaute tech gabonaise. Partages, tech-talks et networking.",
        memberCount: 0,
        category: "general",
        createdAt: new Date().toISOString(),
      });
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || "Hacker",
        email: user.email,
        photoURL: user.photoURL || "",
        joinedAt: new Date().toISOString(),
        role: "developpeur",
        points: 0,
        badges: ["Rookie"],
        bio: "",
        skills: [],
        groups: [GLOBAL_GROUP_ID],
        notificationPreferences: {
          emailDigest: true,
          pushEnabled: false,
          realTime: true,
        },
      });

      const memberRef = doc(db, `groups/${GLOBAL_GROUP_ID}/members`, user.uid);
      await setDoc(memberRef, {
        uid: user.uid,
        joinedAt: new Date().toISOString(),
        displayName: user.displayName,
        photoURL: user.photoURL,
      });

      await updateDoc(groupRef, {
        memberCount: increment(1),
      });
    }

    return user;
  } catch (error: any) {
    if (error.code === "auth/popup-blocked") {
      throw new Error(
        "Le popup de connexion a ete bloque par votre navigateur. Veuillez autoriser les popups pour GABdev.",
      );
    }

    if (error.code === "auth/cancelled-popup-request") {
      throw new Error(
        "Requete de connexion annulee. Veuillez reessayer en cliquant une seule fois.",
      );
    }

    if (error.code === "auth/unauthorized-domain") {
      throw new Error(
        "Ce domaine local n'est pas encore autorise dans Firebase. Ajoutez `localhost` et `127.0.0.1` dans Firebase Console > Authentication > Settings > Authorized domains.",
      );
    }

    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signInQuick = async (nickname?: string) => {
  const finalName = nickname?.trim() || `Hacker_${Math.floor(100 + Math.random() * 900)}`;
  
  try {
    const result = await signInAnonymously(auth);
    const user = result.user;
    
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      displayName: finalName,
      email: `${finalName.toLowerCase()}@gabdev.local`,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      joinedAt: new Date().toISOString(),
      role: "developpeur",
      points: 5,
      badges: ["Rookie"],
      bio: "Membre du Hub",
      skills: [],
      groups: [GLOBAL_GROUP_ID],
    });
    
    return user;
  } catch (error) {
    console.warn("Firebase Anonymous Sign-In failed, falling back to local simulated session:", error);
    
    const mockUser = {
      uid: `guest-${Date.now()}`,
      displayName: finalName,
      email: `${finalName.toLowerCase()}@gabdev.local`,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${finalName}`,
      isAnonymous: true,
    };
    
    const mockProfile = {
      uid: mockUser.uid,
      displayName: finalName,
      email: mockUser.email,
      photoURL: mockUser.photoURL,
      joinedAt: new Date().toISOString(),
      role: "developpeur",
      points: 5,
      badges: ["Invité"],
    };
    
    const guestData = { user: mockUser, profile: mockProfile };
    localStorage.setItem("gabdev_guest_user", JSON.stringify(guestData));
    
    window.dispatchEvent(new Event("gabdev_guest_login"));
    
    return mockUser;
  }
};

export const logout = async () => {
  localStorage.removeItem("gabdev_guest_user");
  window.dispatchEvent(new Event("gabdev_guest_logout"));
  await signOut(auth);
};

export const getUserProfile = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};

export const updateUserProfile = async (uid: string, data: any) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, data);
};

export const joinCommunityGroup = async (
  userId: string,
  groupId: string,
  photoURL?: string,
  displayName?: string,
) => {
  const groupRef = doc(db, "groups", groupId);
  const userRef = doc(db, "users", userId);

  const memberRef = doc(db, `groups/${groupId}/members`, userId);
  await setDoc(memberRef, {
    uid: userId,
    joinedAt: new Date().toISOString(),
    displayName: displayName || "Hacker",
    photoURL: photoURL || "",
  });

  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const currentGroups = userData.groups || [];
    if (!currentGroups.includes(groupId)) {
      await updateDoc(userRef, {
        groups: [...currentGroups, groupId],
      });

      await updateDoc(groupRef, {
        memberCount: increment(1),
      });
    }
  }
};

// --- SOCIAL NETWORK FUNCTIONS ---

export const createPost = async (
  title: string,
  content: string,
  tags: string[],
  group: string,
  authorId: string,
  authorName: string,
  authorPhoto?: string
) => {
  const postsRef = collection(db, "posts");
  await addDoc(postsRef, {
    authorId,
    authorName,
    authorPhoto: authorPhoto || "",
    title,
    content,
    tags,
    group: group || "React Gabon",
    likesCount: 0,
    likes: [],
    commentsCount: 0,
    createdAt: new Date().toISOString(),
  });
};

export const likePost = async (postId: string, userId: string) => {
  const postRef = doc(db, "posts", postId);
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) return;

  const data = postSnap.data();
  const likes = data.likes || [];
  const hasLiked = likes.includes(userId);

  await updateDoc(postRef, {
    likes: hasLiked ? arrayRemove(userId) : arrayUnion(userId),
    likesCount: increment(hasLiked ? -1 : 1),
  });
};

export const addCommentToPost = async (
  postId: string,
  authorId: string,
  authorName: string,
  authorPhoto: string,
  content: string
) => {
  const commentsRef = collection(db, `posts/${postId}/comments`);
  await addDoc(commentsRef, {
    authorId,
    authorName,
    authorPhoto,
    content,
    createdAt: new Date().toISOString(),
  });

  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    commentsCount: increment(1),
  });
};

export const createProject = async (
  name: string,
  description: string,
  imageUrl: string,
  demoUrl: string,
  githubUrl: string,
  tags: string[],
  authorId: string,
  authorName: string,
  authorPhoto?: string
) => {
  const projectsRef = collection(db, "projects");
  await addDoc(projectsRef, {
    authorId,
    authorName,
    authorPhoto: authorPhoto || "",
    name,
    description,
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop",
    demoUrl,
    githubUrl,
    tags,
    likesCount: 0,
    likes: [],
    commentsCount: 0,
    createdAt: new Date().toISOString(),
  });
};

export const likeProject = async (projectId: string, userId: string) => {
  const projectRef = doc(db, "projects", projectId);
  const projectSnap = await getDoc(projectRef);
  if (!projectSnap.exists()) return;

  const data = projectSnap.data();
  const likes = data.likes || [];
  const hasLiked = likes.includes(userId);

  await updateDoc(projectRef, {
    likes: hasLiked ? arrayRemove(userId) : arrayUnion(userId),
    likesCount: increment(hasLiked ? -1 : 1),
  });
};

export const addCommentToProject = async (
  projectId: string,
  authorId: string,
  authorName: string,
  authorPhoto: string,
  content: string
) => {
  const commentsRef = collection(db, `projects/${projectId}/comments`);
  await addDoc(commentsRef, {
    authorId,
    authorName,
    authorPhoto,
    content,
    createdAt: new Date().toISOString(),
  });

  const projectRef = doc(db, "projects", projectId);
  await updateDoc(projectRef, {
    commentsCount: increment(1),
  });
};

export const sendCommunityMessage = async (
  senderId: string,
  senderName: string,
  senderPhoto: string,
  text: string
) => {
  const messagesRef = collection(db, "community_messages");
  await addDoc(messagesRef, {
    senderId,
    senderName,
    senderPhoto: senderPhoto || "",
    text,
    createdAt: new Date().toISOString(),
  });
};

export const listenToCommunityMessages = (
  callback: (messages: any[]) => void,
  errorCallback?: (error: any) => void
) => {
  const q = query(
    collection(db, "community_messages"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(messages);
    },
    (error) => {
      console.error("Firestore listen error:", error);
      if (errorCallback) errorCallback(error);
    }
  );
};
