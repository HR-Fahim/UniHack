import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { MealRequest, UserProfile } from '../types';
import { formatPrice } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { HandPlatter, Clock, CheckCircle, ChefHat } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface RequestsFeedProps {
  profile: UserProfile;
}

export function RequestsFeed({ profile }: RequestsFeedProps) {
  const [requests, setRequests] = useState<MealRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'mealRequests'),
      where('status', '==', 'Pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MealRequest));
      requestData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRequests(requestData);
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'mealRequests'));

    return () => unsubscribe();
  }, []);

  const handleAccept = async (request: MealRequest) => {
    if (profile.isBannedFromPosting) {
      toast.error('You are currently restricted from cooking due to safety strikes.');
      return;
    }

    try {
      await updateDoc(doc(db, 'mealRequests', request.id), {
        status: 'Accepted',
        cookId: profile.uid,
        cookName: profile.displayName,
        acceptedAt: new Date().toISOString()
      });
      toast.success('Request accepted! You can track it in My Requests.');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `mealRequests/${request.id}`);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 bg-stone-200 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-stone-900 flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-emerald-600" />
            Cook for Others
          </h2>
          <p className="text-stone-500 mt-1">Accept requests from students and earn money.</p>
        </div>
        <div className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-sm font-bold">
          {requests.length} Pending
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
          <HandPlatter className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">No pending requests right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-xl text-stone-900 line-clamp-2">{request.title}</h3>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full whitespace-nowrap">
                  {formatPrice(request.budgetCents)}
                </span>
              </div>
              
              <p className="text-stone-600 text-sm mb-4 flex-grow line-clamp-3">
                {request.description}
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <Clock className="w-4 h-4" />
                  <span>Requested {format(new Date(request.createdAt), 'MMM d, h:mm a')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-600">
                    {request.requesterName.charAt(0)}
                  </div>
                  <span>By {request.requesterName}</span>
                </div>
              </div>

              <button
                onClick={() => handleAccept(request)}
                className="w-full flex items-center justify-center gap-2 bg-stone-900 text-white py-3 rounded-xl font-bold hover:bg-stone-800 transition-colors mt-auto"
              >
                <CheckCircle className="w-5 h-5" />
                Accept Request
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
