import React, { useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, MealRequest } from '../types';
import { toast } from 'react-hot-toast';

interface NotificationListenerProps {
  profile: UserProfile;
}

export function NotificationListener({ profile }: NotificationListenerProps) {
  const previousRequests = useRef<Record<string, MealRequest>>({});

  useEffect(() => {
    const q = query(
      collection(db, 'mealRequests'),
      where('requesterId', '==', profile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const request = { id: change.doc.id, ...change.doc.data() } as MealRequest;
        
        if (change.type === 'modified') {
          const prev = previousRequests.current[request.id];
          if (prev && prev.status !== request.status) {
            if (request.status === 'Accepted') {
              toast.success(`Good news! ${request.cookName} accepted your request for "${request.title}"!`, { duration: 6000 });
            } else if (request.status === 'Ready') {
              toast.success(`Your food is ready! "${request.title}" is waiting for you.`, { duration: 6000 });
            } else if (request.status === 'Cooking') {
              toast.success(`${request.cookName} started cooking "${request.title}"!`, { duration: 6000 });
            }
          }
        }
        
        previousRequests.current[request.id] = request;
      });
    });

    return () => unsubscribe();
  }, [profile.uid]);

  return null;
}
