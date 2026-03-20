export type PointTransactionType = 'earn' | 'spend';

export type PointTransaction = {
  id: string;
  user_id: string;
  type: PointTransactionType;
  amount: number;
  balance_after: number;
  reason: string;
  related_id: string | null;
  related_type: 'assignment' | 'wishlist' | 'manual' | null;
  description: string | null;
  created_at: string;
};
