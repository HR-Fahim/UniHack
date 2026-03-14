import React, { useState, useEffect } from 'react';
import { auth, db, signInWithGoogle, logout } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { UserProfile, MealListing, Order } from './types';
import { Navbar } from './components/Navbar';
import { MealFeed } from './components/MealFeed';
import { CreateMeal } from './components/CreateMeal';
import { OrderHistory } from './components/OrderHistory';
import { Profile } from './components/Profile';
import { Landing } from './components/Landing';
import { Toaster, toast } from 'react-hot-toast';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'feed' | 'create' | 'orders' | 'profile'>('feed');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Check if email is .edu.au
        if (!firebaseUser.email?.endsWith('.edu.au') && firebaseUser.email !== 'hrfprofessional@gmail.com') {
          toast.error('Only university students with .edu.au emails can join UniEats.');
          await logout();
          setLoading(false);
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
          // Create new profile
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Student',
            university: 'Unknown University',
            campus: 'Main Campus',
            avgRating: 5,
            strikeCount: 0,
            isBannedFromPosting: false,
            createdAt: new Date().toISOString(),
            role: firebaseUser.email === 'hrfprofessional@gmail.com' ? 'admin' : 'student',
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Landing onLogin={signInWithGoogle} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      <Navbar view={view} setView={setView} profile={profile} onLogout={logout} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'feed' && <MealFeed profile={profile} />}
        {view === 'create' && <CreateMeal profile={profile} onComplete={() => setView('feed')} />}
        {view === 'orders' && <OrderHistory profile={profile} />}
        {view === 'profile' && <Profile profile={profile} setProfile={setProfile} />}
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
