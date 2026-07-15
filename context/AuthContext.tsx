import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { UserProfile } from "../types";
import { doc, onSnapshot, DocumentSnapshot } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const checkGuestUser = () => {
      const savedGuest = localStorage.getItem("gabdev_guest_user");
      if (savedGuest) {
        const guestData = JSON.parse(savedGuest);
        setUser(guestData.user);
        setProfile(guestData.profile);
        setLoading(false);
        return true;
      }
      return false;
    };

    const handleGuestLogin = () => {
      checkGuestUser();
    };

    const handleGuestLogout = () => {
      setUser(null);
      setProfile(null);
      setLoading(false);
    };

    window.addEventListener("gabdev_guest_login", handleGuestLogin);
    window.addEventListener("gabdev_guest_logout", handleGuestLogout);

    // Check if we already have a guest user loaded
    const hasGuest = checkGuestUser();

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (authUser: User | null) => {
        // If we have a local guest user, ignore the null auth state from Firebase
        if (!authUser && localStorage.getItem("gabdev_guest_user")) {
          checkGuestUser();
          return;
        }

        setUser(authUser);

        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }

        if (authUser) {
          unsubscribeProfile = onSnapshot(
            doc(db, "users", authUser.uid),
            (docSnap: DocumentSnapshot) => {
              if (docSnap.exists()) {
                setProfile(docSnap.data() as UserProfile);
              }
              setLoading(false);
            },
          );
        } else {
          setProfile(null);
          setLoading(false);
        }
      },
    );

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      window.removeEventListener("gabdev_guest_login", handleGuestLogin);
      window.removeEventListener("gabdev_guest_logout", handleGuestLogout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
