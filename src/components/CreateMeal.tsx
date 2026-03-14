import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, MealType } from '../types';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { toast } from 'react-hot-toast';
import { Utensils, Info, MapPin, DollarSign, Camera } from 'lucide-react';

interface CreateMealProps {
  profile: UserProfile;
  onComplete: () => void;
}

export function CreateMeal({ profile, onComplete }: CreateMealProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    allergens: '',
    type: 'Marketplace' as MealType,
    price: '',
    servings: '1',
    pickupLocation: profile.campus || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.isBannedFromPosting) {
      toast.error('You are currently banned from posting due to safety strikes.');
      return;
    }

    setLoading(true);
    try {
      const priceCents = formData.type === 'Rescue' ? 0 : Math.round(parseFloat(formData.price) * 100);
      
      await addDoc(collection(db, 'meals'), {
        cookId: profile.uid,
        cookName: profile.displayName,
        title: formData.title,
        description: formData.description,
        ingredients: formData.ingredients,
        allergens: formData.allergens,
        imageUrl: `https://picsum.photos/seed/${Date.now()}/800/600`,
        type: formData.type,
        priceCents: priceCents,
        servingsAvailable: parseInt(formData.servings),
        pickupLocationText: formData.pickupLocation,
        pickupLat: 0,
        pickupLng: 0,
        status: 'Active',
        createdAt: new Date().toISOString(),
      });

      toast.success('Meal posted successfully!');
      onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'meals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-emerald-100 p-3 rounded-2xl">
            <Utensils className="text-emerald-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-900">Post a Meal</h2>
            <p className="text-stone-500">Share your cooking with the campus community</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Meal Title</label>
            <input
              required
              type="text"
              placeholder="e.g. Homemade Butter Chicken"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Type</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as MealType })}
              >
                <option value="Marketplace">Marketplace</option>
                <option value="Rescue">Rescue (Free)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Servings</label>
              <input
                required
                type="number"
                min="1"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.servings}
                onChange={e => setFormData({ ...formData, servings: e.target.value })}
              />
            </div>
          </div>

          {formData.type === 'Marketplace' && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Price (AUD)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Description</label>
            <textarea
              required
              rows={3}
              placeholder="Tell us about your meal..."
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Pickup Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input
                required
                type="text"
                placeholder="e.g. Building B Lobby"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.pickupLocation}
                onChange={e => setFormData({ ...formData, pickupLocation: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post Meal Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
