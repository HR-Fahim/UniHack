import React from 'react';
import { Utensils, ShieldCheck, Users, MapPin } from 'lucide-react';

interface LandingProps {
  onLogin: (role: 'customer' | 'cooker') => void;
}

export function Landing({ onLogin }: LandingProps) {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-emerald-900 py-24 sm:py-32">
        <div className="absolute inset-0 opacity-10">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80')] bg-cover bg-center" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <Utensils className="text-white w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Student-to-Student <br /> <span className="text-emerald-400">Meal Sharing</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-stone-300 max-w-2xl mx-auto">
            UniEats connects students who love to cook with students who need a fresh, affordable meal. 
            Join your campus community today.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onLogin('customer')}
              className="rounded-xl bg-emerald-500 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 transition-all w-full sm:w-auto"
            >
              Sign in as Customer
            </button>
            <button
              onClick={() => onLogin('cooker')}
              className="rounded-xl bg-stone-800 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800 transition-all w-full sm:w-auto"
            >
              Sign in as Cooker
            </button>
          </div>
          <p className="mt-4 text-sm text-stone-400">
            Requires a valid .edu.au university email
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-3 lg:gap-x-12">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 rounded-2xl bg-emerald-100 p-4">
                <ShieldCheck className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">Verified Students</h3>
              <p className="mt-4 text-stone-600">
                Only students from your university can join, ensuring a safe and trusted environment.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 rounded-2xl bg-emerald-100 p-4">
                <MapPin className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">Campus Pickup</h3>
              <p className="mt-4 text-stone-600">
                Meals are prepared and picked up right on campus or in nearby student housing.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 rounded-2xl bg-emerald-100 p-4">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">Rescue Meals</h3>
              <p className="mt-4 text-stone-600">
                Combat food waste with free or heavily discounted meals at the end of the day.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
