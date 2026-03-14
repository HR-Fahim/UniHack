import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { toast } from 'react-hot-toast';
import { User, Mail, School, MapPin, Star, ShieldAlert } from 'lucide-react';

interface ProfileProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}

export function Profile({ profile, setProfile }: ProfileProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile.displayName,
    university: profile.university,
    campus: profile.campus,
    role: profile.role,
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), formData);
      setProfile({ ...profile, ...formData });
      toast.success('Profile updated!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl border border-stone-200 p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-3xl bg-emerald-600 flex items-center justify-center text-white text-3xl font-bold">
            {profile.displayName[0]}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-stone-900">{profile.displayName}</h2>
            <p className="text-stone-500">{profile.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
            <div className="flex items-center gap-2 text-stone-500 text-sm mb-1">
              <Star className="w-4 h-4 text-amber-500" />
              Cook Rating
            </div>
            <div className="text-2xl font-bold text-stone-900">{profile.avgRating.toFixed(1)} / 5.0</div>
          </div>
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
            <div className="flex items-center gap-2 text-stone-500 text-sm mb-1">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              Safety Strikes
            </div>
            <div className="text-2xl font-bold text-stone-900">{profile.strikeCount} / 2</div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Display Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input
                required
                type="text"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.displayName}
                onChange={e => setFormData({ ...formData, displayName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">University</label>
            <div className="relative">
              <School className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input
                required
                type="text"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.university}
                onChange={e => setFormData({ ...formData, university: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Campus</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input
                required
                type="text"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.campus}
                onChange={e => setFormData({ ...formData, campus: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Role</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
              <select
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none bg-white"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as 'customer' | 'cooker' | 'admin' })}
                disabled={profile.role === 'admin'}
              >
                <option value="customer">Customer</option>
                <option value="cooker">Cooker</option>
                {profile.role === 'admin' && <option value="admin">Admin</option>}
              </select>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {profile.isBannedFromPosting && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-3xl flex items-start gap-4">
          <ShieldAlert className="text-red-600 w-6 h-6 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-red-900">Account Restricted</h3>
            <p className="text-red-700 text-sm mt-1">
              You have received 2 or more safety strikes. You are currently restricted from posting new meals. 
              Please contact campus moderation for review.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
