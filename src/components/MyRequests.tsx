import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { MealRequest, UserProfile } from '../types';
import { formatPrice } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { HandPlatter, ChefHat, CheckCircle, Clock, XCircle, Flame } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface MyRequestsProps {
  profile: UserProfile;
}

export function MyRequests({ profile }: MyRequestsProps) {
  const [myRequests, setMyRequests] = useState<MealRequest[]>([]);
  const [myCookingJobs, setMyCookingJobs] = useState<MealRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'eating' | 'cooking'>(profile.role === 'cooker' ? 'cooking' : 'eating');

  useEffect(() => {
    const qRequests = query(
      collection(db, 'mealRequests'),
      where('requesterId', '==', profile.uid)
    );

    const qCooking = query(
      collection(db, 'mealRequests'),
      where('cookId', '==', profile.uid)
    );

    const unsubRequests = onSnapshot(qRequests, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MealRequest));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMyRequests(data);
      if (loading) setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'mealRequests_eating'));

    const unsubCooking = onSnapshot(qCooking, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MealRequest));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMyCookingJobs(data);
      if (loading) setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'mealRequests_cooking'));

    return () => {
      unsubRequests();
      unsubCooking();
    };
  }, [profile.uid]);

  const updateStatus = async (request: MealRequest, status: MealRequest['status']) => {
    try {
      const updates: any = { status };
      if (status === 'Ready') updates.readyAt = new Date().toISOString();
      if (status === 'Completed') updates.completedAt = new Date().toISOString();
      
      await updateDoc(doc(db, 'mealRequests', request.id), updates);
      toast.success(`Request marked as ${status}!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `mealRequests/${request.id}`);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-stone-200 rounded-2xl" />)}</div>;

  const currentList = tab === 'eating' ? myRequests : myCookingJobs;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-stone-900">
          {profile.role === 'cooker' ? 'My Cooking Jobs' : 'My Food Requests'}
        </h2>
        
        {profile.role === 'admin' && (
          <div className="flex bg-stone-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setTab('eating')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === 'eating' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <HandPlatter className="w-4 h-4" />
              Eating ({myRequests.length})
            </button>
            <button
              onClick={() => setTab('cooking')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === 'cooking' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              Cooking ({myCookingJobs.length})
            </button>
          </div>
        )}
      </div>

      {currentList.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
          {tab === 'eating' ? <HandPlatter className="w-12 h-12 text-stone-300 mx-auto mb-4" /> : <ChefHat className="w-12 h-12 text-stone-300 mx-auto mb-4" />}
          <p className="text-stone-500">
            {tab === 'eating' ? "You haven't requested any food yet." : "You haven't accepted any cooking jobs yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((request) => (
            <div key={request.id} className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-stone-100 p-3 rounded-xl">
                  {tab === 'eating' ? <HandPlatter className="w-6 h-6 text-stone-600" /> : <ChefHat className="w-6 h-6 text-emerald-600" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-stone-900">{request.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-stone-500 mt-1">
                    <span>{format(new Date(request.createdAt), 'MMM d, h:mm a')}</span>
                    <span>•</span>
                    <span className="font-bold text-emerald-700">{formatPrice(request.budgetCents)}</span>
                    {request.cookName && tab === 'eating' && (
                      <>
                        <span>•</span>
                        <span className="text-stone-600">Cook: {request.cookName}</span>
                      </>
                    )}
                    {tab === 'cooking' && (
                      <>
                        <span>•</span>
                        <span className="text-stone-600">For: {request.requesterName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  request.status === 'Completed' ? 'bg-stone-100 text-stone-700' :
                  request.status === 'Ready' ? 'bg-emerald-100 text-emerald-700' :
                  request.status === 'Cooking' ? 'bg-orange-100 text-orange-700' :
                  request.status === 'Accepted' ? 'bg-blue-100 text-blue-700' :
                  request.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {request.status}
                </span>

                {/* Actions for Eater */}
                {tab === 'eating' && request.status === 'Pending' && (
                  <button
                    onClick={() => updateStatus(request, 'Cancelled')}
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    title="Cancel Request"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
                {tab === 'eating' && request.status === 'Ready' && (
                  <button
                    onClick={() => updateStatus(request, 'Completed')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Picked Up
                  </button>
                )}

                {/* Actions for Cook */}
                {tab === 'cooking' && request.status === 'Accepted' && (
                  <button
                    onClick={() => updateStatus(request, 'Cooking')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors text-sm font-bold"
                  >
                    <Flame className="w-4 h-4" />
                    Start Cooking
                  </button>
                )}
                {tab === 'cooking' && request.status === 'Cooking' && (
                  <button
                    onClick={() => updateStatus(request, 'Ready')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Ready
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
