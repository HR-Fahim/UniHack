import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, MealRequest } from '../types';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { toast } from 'react-hot-toast';
import { HandPlatter, Info, DollarSign } from 'lucide-react';

interface RequestFoodProps {
  profile: UserProfile;
  onComplete: () => void;
}

export function RequestFood({ profile, onComplete }: RequestFoodProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budgetCents: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const budget = parseFloat(formData.budgetCents);
      if (isNaN(budget) || budget <= 0) {
        toast.error('Please enter a valid budget.');
        setLoading(false);
        return;
      }

      const requestData: Omit<MealRequest, 'id'> = {
        requesterId: profile.uid,
        requesterName: profile.displayName,
        title: formData.title,
        description: formData.description,
        budgetCents: Math.round(budget * 100),
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'mealRequests'), requestData);
      
      toast.success('Food request posted successfully!');
      onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'mealRequests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-stone-900 flex items-center gap-3">
          <HandPlatter className="w-8 h-8 text-emerald-600" />
          Request Food
        </h2>
        <p className="text-stone-500 mt-2 text-lg">
          Tell the community what you're craving, and a student cook will make it for you!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">What do you want to eat?</label>
          <input
            required
            type="text"
            placeholder="e.g., Spicy Chicken Curry, Vegan Pasta..."
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Details & Allergies</label>
          <textarea
            required
            rows={4}
            placeholder="Describe how you want it, any allergies, preferred pickup time..."
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Your Budget ($)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <DollarSign className="w-5 h-5 text-stone-400" />
            </div>
            <input
              required
              type="number"
              min="1"
              step="0.01"
              placeholder="10.00"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              value={formData.budgetCents}
              onChange={(e) => setFormData({ ...formData, budgetCents: e.target.value })}
            />
          </div>
          <p className="text-xs text-stone-500 mt-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Cooks will see this budget and decide if they can make it.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <HandPlatter className="w-5 h-5" />
              Post Request
            </>
          )}
        </button>
      </form>
    </div>
  );
}
