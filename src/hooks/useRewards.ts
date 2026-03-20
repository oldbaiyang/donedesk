import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';
import { useAssignments } from './useAssignments';
import { PointTransaction } from '@/types/point_transaction';

export type WishlistItem = {
  id: string;
  user_id: string;
  title: string;
  cost_pts: number;
  is_redeemed: boolean;
  created_at: string;
};

export function useRewards() {
  const { userId: loggedInUserId } = useUser();
  const { activeStudentId } = useAssignments();
  
  // 核心逻辑：如果是家长代管模型，我们应该查看当前选中的学生的集成和心愿单
  const targetId = activeStudentId || loggedInUserId;

  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [spentPoints, setSpentPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);

  const fetchTransactions = useCallback(async () => {
    if (!targetId) return;
    const { data } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', targetId)
      .order('created_at', { ascending: false })
      .limit(100);
    setTransactions(data || []);
  }, [targetId]);

  const fetchData = useCallback(async () => {
    if (!targetId) return;
    setLoading(true);

    // 获取当所有已完成作业积攒的分数
    const { data: assignments } = await supabase
      .from('assignments')
      .select('reward_pts')
      .eq('student_id', targetId)
      .eq('status', 'completed');

    // 获取心愿清单资源
    const { data: wishes } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', targetId)
      .order('created_at', { ascending: false });

    // 计算分班
    const total = (assignments || []).reduce((acc, curr) => acc + (curr.reward_pts || 0), 0);
    const spent = (wishes || []).filter(w => w.is_redeemed).reduce((acc, curr) => acc + curr.cost_pts, 0);

    setTotalPoints(total);
    setSpentPoints(spent);
    setWishlist(wishes || []);

    // 获取积分明细
    await fetchTransactions();

    setLoading(false);
  }, [targetId, fetchTransactions]);

  const addWish = async (title: string, cost_pts: number): Promise<boolean> => {
    if (!targetId) return false;
    const { data, error } = await supabase
      .from('wishlist')
      .insert([{ user_id: targetId, title, cost_pts }])
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

    // 获取最新余额
    const { data: lastTx } = await supabase
      .from('point_transactions')
      .select('balance_after')
      .eq('user_id', targetId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const prevBalance = lastTx?.balance_after ?? totalPoints;
    const newBalance = prevBalance - cost;
    const wishItem = wishlist.find(w => w.id === id);

    await supabase.from('point_transactions').insert({
      user_id: targetId,
      type: 'spend',
      amount: cost,
      balance_after: newBalance,
      reason: '兑换心愿消耗积分',
      related_id: id,
      related_type: 'wishlist',
      description: wishItem?.title ?? null
    });

    const { error } = await supabase
      .from('wishlist')
      .update({ is_redeemed: true })
      .eq('id', id);

    if (!error) {
      setWishlist(prev => prev.map(w => w.id === id ? { ...w, is_redeemed: true } : w));
      setSpentPoints(prev => prev + cost);
      // 刷新积分明细
      await fetchTransactions();
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
    transactions,
    fetchData,
    fetchTransactions,
    addWish,
    redeemWish,
    removeWish
  };
}
