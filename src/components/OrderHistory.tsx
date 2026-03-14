import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, addDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Order, UserProfile } from '../types';
import { formatPrice } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Package, CheckCircle, XCircle, AlertTriangle, MessageSquare, ShoppingCart, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface OrderHistoryProps {
  profile: UserProfile;
}

export function OrderHistory({ profile }: OrderHistoryProps) {
  const [purchases, setPurchases] = useState<Order[]>([]);
  const [sales, setSales] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'purchases' | 'sales'>('purchases');

  useEffect(() => {
    const qPurchases = query(
      collection(db, 'orders'),
      where('buyerId', '==', profile.uid)
    );

    const qSales = query(
      collection(db, 'orders'),
      where('cookId', '==', profile.uid)
    );

    const unsubPurchases = onSnapshot(qPurchases, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPurchases(data);
      if (loading) setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'orders_purchases'));

    const unsubSales = onSnapshot(qSales, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSales(data);
      if (loading) setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'orders_sales'));

    return () => {
      unsubPurchases();
      unsubSales();
    };
  }, [profile.uid]);

  const handleComplete = async (order: Order) => {
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status: 'Completed',
        completedAt: new Date().toISOString()
      });
      toast.success('Order marked as completed!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${order.id}`);
    }
  };

  const handleFlag = async (order: Order) => {
    const reason = window.prompt('Please provide a reason for flagging this order (Safety/Quality):');
    if (!reason) return;

    try {
      // 1. Mark order as flagged
      await updateDoc(doc(db, 'orders', order.id), {
        status: 'Flagged'
      });
      
      // 2. Add strike document
      await addDoc(collection(db, 'strikes'), {
        cookId: order.cookId,
        orderId: order.id,
        reason: reason,
        createdAt: new Date().toISOString()
      });

      // 3. Increment cook's strike count and check for ban
      const cookRef = doc(db, 'users', order.cookId);
      const cookDoc = await getDoc(cookRef);
      if (cookDoc.exists()) {
        const cookData = cookDoc.data() as UserProfile;
        const newStrikeCount = (cookData.strikeCount || 0) + 1;
        await updateDoc(cookRef, {
          strikeCount: increment(1),
          isBannedFromPosting: newStrikeCount >= 2
        });
      }

      toast.success('Order flagged and moderation team notified.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'flag_order');
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-stone-200 rounded-2xl" />)}</div>;

  const currentOrders = tab === 'purchases' ? purchases : sales;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-stone-900">Order History</h2>
        <div className="flex bg-stone-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setTab('purchases')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'purchases' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Purchases ({purchases.length})
          </button>
          <button
            onClick={() => setTab('sales')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'sales' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Sales ({sales.length})
          </button>
        </div>
      </div>

      {currentOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">
            {tab === 'purchases' ? "You haven't placed any orders yet." : "You haven't received any orders yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentOrders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-stone-100 p-3 rounded-xl">
                  {tab === 'purchases' ? <ShoppingCart className="w-6 h-6 text-stone-600" /> : <DollarSign className="w-6 h-6 text-emerald-600" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-stone-900">{order.mealTitle}</h3>
                  <div className="flex items-center gap-3 text-sm text-stone-500 mt-1">
                    <span>{format(new Date(order.createdAt), 'MMM d, h:mm a')}</span>
                    <span>•</span>
                    <span className="font-bold text-emerald-700">{formatPrice(order.totalPaidCents)}</span>
                    {tab === 'sales' && (
                      <>
                        <span>•</span>
                        <span className="text-stone-400">Buyer ID: {order.buyerId.slice(0, 6)}...</span>
                      </>
                    )}
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

                {order.status === 'Pending' && tab === 'purchases' && (
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

                {order.status === 'Pending' && tab === 'sales' && (
                  <p className="text-xs text-stone-400 italic">Waiting for buyer to complete</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
