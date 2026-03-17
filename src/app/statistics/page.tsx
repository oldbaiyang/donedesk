"use client"

export default function StatisticsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-accent drop-shadow-sm pb-1">
            数据沉淀
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium">用可视化的数据报表洞悉你的学习效率与时间线</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="p-8 border-2 border-primary/10 rounded-3xl bg-card/60 backdrop-blur shadow-sm h-72 flex flex-col items-center justify-center text-center group hover:border-primary/30 transition-colors">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">📊</div>
          <span className="text-muted-foreground font-medium">近 7 天产出趋势图 (即将到来)</span>
        </div>
        <div className="p-8 border-2 border-primary/10 rounded-3xl bg-card/60 backdrop-blur shadow-sm h-72 flex flex-col items-center justify-center text-center group hover:border-primary/30 transition-colors">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">🥧</div>
          <span className="text-muted-foreground font-medium">学科时间精力占比 (即将到来)</span>
        </div>
      </div>
    </div>
  );
}
