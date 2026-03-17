"use client"

import { useEffect, useState } from "react";
import { useRewards } from "@/hooks/useRewards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gift, Trash2, CheckCircle2, Ticket, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RewardsPage() {
  const { wishlist, availablePoints, totalPoints, spentPoints, loading, fetchData, addWish, redeemWish, removeWish } = useRewards();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCost, setNewCost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCost) return;
    
    setIsSubmitting(true);
    await addWish(newTitle.trim(), parseInt(newCost) || 0);
    setIsSubmitting(false);
    setIsAddOpen(false);
    setNewTitle("");
    setNewCost("");
  };

  const handleRedeem = async (id: string, cost: number) => {
    if (availablePoints < cost) {
      alert("积分不足，加油完成更多作业哦！");
      return;
    }
    await redeemWish(id, cost);
  };

  if (loading && wishlist.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const unredeemed = wishlist.filter(w => !w.is_redeemed);
  const redeemed = wishlist.filter(w => w.is_redeemed);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-amber-500 flex items-center gap-2">
            <Gift className="w-8 h-8" /> 兑换中心
          </h1>
          <p className="text-muted-foreground mt-1">你的辛勤打卡将在这里化为果实</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> 建立新心愿
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-amber-400 to-orange-500 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden flex flex-col justify-center">
          <div className="relative z-10">
            <h2 className="text-xl font-medium mb-1 opacity-90">当前可用积分 🌟</h2>
            <div className="text-7xl font-black tracking-tighter drop-shadow-sm leading-none">{availablePoints}</div>
          </div>
          <div className="absolute right-[-10%] bottom-[-20%] opacity-20 text-9xl pointer-events-none">🎁</div>
          <div className="absolute top-0 right-0 w-full h-full bg-white opacity-0 hover:opacity-10 transition-opacity duration-500 pointer-events-none"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border rounded-2xl p-6 flex flex-col justify-center text-center shadow-sm">
            <span className="text-muted-foreground text-sm font-medium mb-2">累计产出</span>
            <span className="text-3xl font-bold text-foreground">{totalPoints}</span>
          </div>
          <div className="bg-card border rounded-2xl p-6 flex flex-col justify-center text-center shadow-sm">
            <span className="text-muted-foreground text-sm font-medium mb-2">已兑换</span>
            <span className="text-3xl font-bold text-emerald-500">{spentPoints}</span>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2 mt-4">
          我的愿望表 <span className="bg-amber-500/10 text-amber-500 text-xs px-2 py-0.5 rounded-full">{unredeemed.length}</span>
        </h3>
        {unredeemed.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl bg-muted/20">
            暂无待兑换心愿项，点击右上方按钮添加一个吧！
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unredeemed.map(item => (
              <div key={item.id} className="group relative bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:border-amber-500/50 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-lg pr-6 break-words">{item.title}</h4>
                  <button 
                    onClick={() => removeWish(item.id)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    title="移除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-dashed">
                  <div className="flex items-center text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-full text-sm">
                    <Ticket className="w-4 h-4 mr-1.5" /> {item.cost_pts} 分
                  </div>
                  <Button 
                    size="sm" 
                    variant={availablePoints >= item.cost_pts ? "default" : "secondary"}
                    className={cn("transition-colors", availablePoints >= item.cost_pts ? "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500 text-white" : "opacity-70 pointer-events-none")}
                    onClick={() => handleRedeem(item.id, item.cost_pts)}
                  >
                    {availablePoints >= item.cost_pts ? "立即兑换" : "积分不足"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {redeemed.length > 0 && (
        <section className="space-y-4 pt-8 mt-8 border-t">
          <h3 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
             <CheckCircle2 className="w-5 h-5" /> 历史兑换记录
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60 hover:opacity-100 transition-opacity duration-300">
            {redeemed.map(item => (
              <div key={item.id} className="bg-muted/50 border rounded-xl p-4 flex flex-col relative overflow-hidden group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-foreground line-through break-words z-10 relative">{item.title}</h4>
                </div>
                <div className="mt-auto flex items-center text-muted-foreground text-sm pt-2 z-10 relative">
                   花费 {item.cost_pts} 积分
                </div>
                <div className="absolute right-[-10px] bottom-[-10px] text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors z-0">
                  <CheckCircle2 className="w-24 h-24" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 建立新心愿弹窗 */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>添加新愿望 🎁</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>想奖励自己什么？</Label>
              <Input 
                placeholder="例如：看半小时动画片、买一本漫画书" 
                required 
                value={newTitle} 
                onChange={e => setNewTitle(e.target.value)} 
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>兑换所需积分</Label>
              <Input 
                type="number" 
                min="1" 
                required 
                value={newCost} 
                onChange={e => setNewCost(e.target.value)} 
              />
            </div>
            <Button type="submit" className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-white" disabled={isSubmitting || !newTitle || !newCost}>
              {isSubmitting ? "保存中..." : "上架到心愿表"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
