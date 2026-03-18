import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';

export type WishlistItem = {
  id: string;
  user_id: string;
  title: string;
  cost_pts: number;
  is_redeemed: boolean;
  created_at: string;
};

export function useRewards() {
  const { userId } = useUser();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [spentPoints, setSpentPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    
    // 获取当所有已完成作业积攒的分数
    const { data: assignments } = await supabase
      .from('assignments')
      .select('reward_pts')
      .eq('student_id', userId)
      .eq('status', 'completed');
      
    // 获取心愿清单资源
    const { data: wishes } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // 计算分班
    const total = (assignments || []).reduce((acc, curr) => acc + (curr.reward_pts || 0), 0);
    const spent = (wishes || []).filter(w => w.is_redeemed).reduce((acc, curr) => acc + curr.cost_pts, 0);

    setTotalPoints(total);
    setSpentPoints(spent);
    setWishlist(wishes || []);
    setLoading(false);
  }, [userId]);

  const addWish = async (title: string, cost_pts: number): Promise<boolean> => {
    if (!userId) return false;
    const { data, error } = await supabase
      .from('wishlist')
      .insert([{ user_id: userId, title, cost_pts }])
      .select()
      .single();
      
    if (data && !error) {
      setWishlist(prev => [data, ...prev]);
      return true;
    }
    return false;
  };

  const redeemWish = async (id: string, cost: number): Promise<boolean> => {
    const available = totalPoints - spentPoints;
    if (available < cost) return false; // Not enough points
    
    const { error } = await supabase
      .from('wishlist')
      .update({ is_redeemed: true })
      .eq('id', id);
      
    if (!error) {
      setWishlist(prev => prev.map(w => w.id === id ? { ...w, is_redeemed: true } : w));
      setSpentPoints(prev => prev + cost);
      return true;
    }
    return false;
  };

  const removeWish = async (id: string): Promise<boolean> => {
     const { error } = await supabase.from('wishlist').delete().eq('id', id);
     if (!error) {
       setWishlist(prev => prev.filter(w => w.id !== id));
       return true;
     }
     return false;
  };

  return {
    wishlist,
    totalPoints,
    spentPoints,
    availablePoints: totalPoints - spentPoints,
    loading,
    fetchData,
    addWish,
    redeemWish,
    removeWish
  };
}
