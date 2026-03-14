import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Order, UserProfile } from '../types';
import { formatPrice } from '../lib/utils';
import { Package, CheckCircle, XCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface OrderHistoryProps {
  profile: UserProfile;
}

export function OrderHistory({ profile }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('buyerId', '==', profile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(orderData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile.uid]);

  const handleComplete = async (order: Order) => {
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status: 'Completed',
        completedAt: new Date().toISOString()
      });
      toast.success('Order marked as completed!');
    } catch (error) {
      toast.error('Failed to update order.');
    }
  };

  const handleFlag = async (order: Order) => {
    const reason = window.prompt('Please provide a reason for flagging this order (Safety/Quality):');
    if (!reason) return;

    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status: 'Flagged'
      });
      
      await addDoc(collection(db, 'strikes'), {
        cookId: order.cookId,
        orderId: order.id,
        reason: reason,
        createdAt: new Date().toISOString()
      });

      toast.success('Order flagged and moderation team notified.');
    } catch (error) {
      toast.error('Failed to flag order.');
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-stone-200 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-stone-900">My Orders</h2>
        <div className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-sm font-bold">
          {orders.length} Total
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-stone-100 p-3 rounded-xl">
                  <Package className="w-6 h-6 text-stone-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-stone-900">{order.mealTitle}</h3>
                  <div className="flex items-center gap-3 text-sm text-stone-500 mt-1">
                    <span>{format(new Date(order.createdAt), 'MMM d, h:mm a')}</span>
                    <span>•</span>
                    <span className="font-bold text-emerald-700">{formatPrice(order.totalPaidCents)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                  order.status === 'Pending' ? 'bg-blue-100 text-blue-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {order.status}
                </span>

                {order.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleComplete(order)}
                      className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                      title="Mark as Completed"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleFlag(order)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Flag Safety Issue"
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
