import React from 'react';
import { Utensils, PlusCircle, History, User, LogOut } from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface NavbarProps {
  view: string;
  setView: (view: any) => void;
  profile: UserProfile;
  onLogout: () => void;
}

export function Navbar({ view, setView, profile, onLogout }: NavbarProps) {
  const navItems = [
    { id: 'feed', label: 'Discovery', icon: Utensils },
    { id: 'create', label: 'Post Meal', icon: PlusCircle },
    { id: 'orders', label: 'My Orders', icon: History },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('feed')}>
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <Utensils className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-emerald-900">UniEats</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium",
                  view === item.id 
                    ? "bg-emerald-50 text-emerald-700" 
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-stone-500 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile Profile Icon */}
          <div className="md:hidden flex items-center gap-4">
             <button onClick={() => setView('profile')} className="p-2 rounded-full bg-stone-100">
               <User className="w-5 h-5 text-stone-600" />
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
