import React from 'react';
import { Utensils, PlusCircle, History, User, LogOut, HandPlatter, ChefHat, ClipboardList } from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface NavbarProps {
  view: string;
  setView: (view: any) => void;
  profile: UserProfile;
  onLogout: () => void;
}

export function Navbar({ view, setView, profile, onLogout }: NavbarProps) {
  const allNavItems = [
    { id: 'requests-feed', label: 'Cook Jobs', icon: ChefHat, roles: ['cooker', 'admin'] },
    { id: 'request-food', label: 'Request Food', icon: HandPlatter, roles: ['customer', 'admin'] },
    { id: 'my-requests', label: profile.role === 'cooker' ? 'My Jobs' : 'My Requests', icon: ClipboardList, roles: ['customer', 'cooker', 'admin'] },
    { id: 'feed', label: 'Discover Meals', icon: Utensils, roles: ['customer', 'cooker', 'admin'] },
    { id: 'create', label: 'Post Meal', icon: PlusCircle, roles: ['cooker', 'admin'] },
    { id: 'orders', label: 'My Orders', icon: History, roles: ['customer', 'cooker', 'admin'] },
    { id: 'profile', label: 'Profile', icon: User, roles: ['customer', 'cooker', 'admin'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(profile.role));

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

          {/* Mobile Profile Icon & Logout */}
          <div className="md:hidden flex items-center gap-2">
             <button onClick={() => setView('profile')} className="p-2 rounded-full bg-stone-100 text-stone-600">
               <User className="w-5 h-5" />
             </button>
             <button onClick={onLogout} className="p-2 rounded-full bg-red-50 text-red-600">
               <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 pb-safe z-50">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.filter(item => item.id !== 'profile').map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all",
                view === item.id 
                  ? "text-emerald-600" 
                  : "text-stone-400 hover:text-stone-600"
              )}
            >
              <item.icon className={cn("w-5 h-5", view === item.id && "fill-emerald-50")} />
              <span className="text-[10px] font-medium truncate w-full text-center px-1">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
