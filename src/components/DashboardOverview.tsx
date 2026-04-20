import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn/Card';
import { DashboardStats } from '@/types';
import { formatCurrency } from '@/lib/utils'; 

export function DashboardOverview({ stats }: { stats: DashboardStats }) {
  // Mock data for the chart based on recent movements or just general categories
  const chartData = [
    { name: 'Total', value: stats.totalParts },
    { name: 'Em Falta', value: stats.outOfStock },
    { name: 'Baixo Estoque', value: stats.lowStock },
  ];

  const COLORS = ['#09090b', '#ef4444', '#f59e0b'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total de Peças" 
          value={stats.totalParts} 
          icon={<Package className="h-4 w-4 text-zinc-500" />} 
          description="Modelos diferentes"
        />
        <StatCard 
          title="Valor em Estoque" 
          value={Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalValue)} 
          icon={<DollarSign className="h-4 w-4 text-zinc-500" />} 
          description="Estimado para venda"
          trend="+2.5% em relação ao mês passado"
        />
        <StatCard 
          title="Esgotados" 
          value={stats.outOfStock} 
          icon={<AlertTriangle className={`h-4 w-4 ${stats.outOfStock > 0 ? 'text-red-500' : 'text-zinc-500'}`} />} 
          description="Peças com estoque zero"
        />
        <StatCard 
          title="Baixo Estoque" 
          value={stats.lowStock} 
          icon={<TrendingUp className="h-4 w-4 text-amber-500" />} 
          description="Menos de 5 unidades"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base font-medium">Distribuição de Estoque</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pl-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base font-medium">Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentMovements.length > 0 ? (
                stats.recentMovements.map((movement) => (
                  <div key={movement.id} className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      movement.type === 'entrada' ? 'bg-green-100 text-green-700' : 
                      movement.type === 'saida' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      <Clock size={14} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-medium leading-none">
                        {movement.type === 'entrada' ? 'Entrada de material' : 
                         movement.type === 'saida' ? 'Venda/Saída' : 'Ajuste de estoque'}
                      </p>
                      <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-tighter">
                         Alteração: {movement.quantity_change > 0 ? '+' : ''}{movement.quantity_change} un.
                      </p>
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {new Date(movement.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-zinc-500 text-sm italic">
                  Nenhuma atividade registrada ainda.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, description, trend }: { title: string, value: string | number, icon: React.ReactNode, description: string, trend?: string }) {
  return (
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-zinc-500 mt-1">{description}</p>
        {trend && (
          <p className="mt-2 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
