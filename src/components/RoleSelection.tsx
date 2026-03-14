import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Role } from '../types';
import { ChefHat, HandPlatter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';

export function RoleSelection({ profile, setProfile }: { profile: UserProfile, setProfile: (p: UserProfile) => void }) {
  const [loading, setLoading] = useState(false);

  const selectRole = async (role: Role) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), { role });
      setProfile({ ...profile, role });
      toast.success(`Welcome! You are now a ${role}.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="max-w-2xl w-full bg-white p-8 rounded-3xl shadow-sm border border-stone-200 text-center">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Choose Your Role</h1>
        <p className="text-stone-500 mb-8">Please select how you want to use UniEats to continue.</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <button
            disabled={loading}
            onClick={() => selectRole('customer')}
            className="flex flex-col items-center p-8 border-2 border-stone-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
          >
            <div className="bg-stone-100 p-4 rounded-full group-hover:bg-emerald-100 transition-colors mb-4">
              <HandPlatter className="w-12 h-12 text-stone-600 group-hover:text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">Customer</h2>
            <p className="text-stone-500 text-sm">I want to request and order delicious home-cooked meals.</p>
          </button>

          <button
            disabled={loading}
            onClick={() => selectRole('cook')}
            className="flex flex-col items-center p-8 border-2 border-stone-200 rounded-2xl hover:border-orange-500 hover:bg-orange-50 transition-all group"
          >
            <div className="bg-stone-100 p-4 rounded-full group-hover:bg-orange-100 transition-colors mb-4">
              <ChefHat className="w-12 h-12 text-stone-600 group-hover:text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">Cooker</h2>
            <p className="text-stone-500 text-sm">I want to cook for others, accept requests, and earn money.</p>
          </button>
        </div>
      </div>
    </div>
  );
}
