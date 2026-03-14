import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { MealListing, UserProfile, Order } from '../types';
import { formatPrice } from '../lib/utils';
import { Clock, MapPin, Star, AlertCircle, ShoppingBag, Utensils } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';

interface MealFeedProps {
  profile: UserProfile;
}

export function MealFeed({ profile }: MealFeedProps) {
  const [meals, setMeals] = useState<MealListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Marketplace' | 'Rescue'>('All');

  useEffect(() => {
    const q = query(
      collection(db, 'meals'),
      where('status', '==', 'Active'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mealData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MealListing));
      setMeals(mealData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOrder = async (meal: MealListing) => {
    if (meal.cookId === profile.uid) {
      toast.error("You can't order your own meal!");
      return;
    }

    if (meal.servingsAvailable <= 0) {
      toast.error("Sorry, this meal is sold out!");
      return;
    }

    try {
      const buyerFee = Math.round(meal.priceCents * 0.05 + 50);
      const makerFee = Math.round(meal.priceCents * 0.05);
      
      const orderData: Partial<Order> = {
        mealId: meal.id,
        mealTitle: meal.title,
        buyerId: profile.uid,
        cookId: meal.cookId,
        quantity: 1,
        mealPriceCents: meal.priceCents,
        buyerFeeCents: buyerFee,
        makerFeeCents: makerFee,
        totalPaidCents: meal.priceCents + buyerFee,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      // Update servings
      const mealRef = doc(db, 'meals', meal.id);
      await updateDoc(mealRef, {
        servingsAvailable: increment(-1),
        status: meal.servingsAvailable === 1 ? 'SoldOut' : 'Active'
      });

      toast.success('Order placed successfully! Check "My Orders" for details.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to place order.');
    }
  };

  const filteredMeals = filter === 'All' ? meals : meals.filter(m => m.type === filter);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-stone-200 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-stone-900">Campus Discovery</h2>
          <p className="text-stone-500">Fresh meals from your fellow students at {profile.university}</p>
        </div>
        
        <div className="flex bg-stone-100 p-1 rounded-xl w-fit">
          {['All', 'Marketplace', 'Rescue'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredMeals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300">
          <Utensils className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-900">No meals found</h3>
          <p className="text-stone-500">Be the first to post a meal on your campus!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeals.map((meal) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={meal.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl transition-all group"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={meal.imageUrl || `https://picsum.photos/seed/${meal.id}/800/600`} 
                  alt={meal.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    meal.type === 'Rescue' ? 'bg-orange-500 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {meal.type}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg font-bold text-emerald-900">
                  {meal.type === 'Rescue' ? 'FREE' : formatPrice(meal.priceCents)}
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-stone-900 line-clamp-1">{meal.title}</h3>
                  <p className="text-stone-500 text-sm line-clamp-2 mt-1">{meal.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1 text-xs text-stone-500 bg-stone-50 px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3" />
                    {meal.servingsAvailable} servings left
                  </div>
                  <div className="flex items-center gap-1 text-xs text-stone-500 bg-stone-50 px-2 py-1 rounded-md">
                    <MapPin className="w-3 h-3" />
                    {meal.pickupLocationText}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                      {meal.cookName?.[0] || 'S'}
                    </div>
                    <span className="text-sm font-medium text-stone-700">{meal.cookName || 'Student Cook'}</span>
                  </div>
                  
                  <button
                    onClick={() => handleOrder(meal)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Order
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
