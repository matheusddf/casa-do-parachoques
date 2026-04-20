import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, PlusCircle, Search, Settings, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { DashboardOverview } from '@/components/DashboardOverview';
import { PartGrid } from '@/components/PartGrid';
import { PartForm } from '@/components/PartForm';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { partsService } from '@/services/partsService';
import { Part, DashboardStats } from '@/types';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'inventory' | 'add'>('dashboard');
  const [parts, setParts] = useState<Part[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        throw new Error('Credenciais do Supabase não configuradas nos Segredos.');
      }

      setLoading(true);
      const [fetchedParts, fetchedStats] = await Promise.all([
        partsService.getParts(),
        partsService.getDashboardStats(),
      ]);
      setParts(fetchedParts);
      setStats(fetchedStats);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      const message = error.message?.includes('relation "parts" does not exist')
        ? 'As tabelas ainda não foram criadas no Supabase. Execute o SQL schema.'
        : error.message || 'Erro ao carregar dados. Verifique suas credenciais.';
      
      toast.error(message, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredParts = parts.filter(part => {
    const query = searchQuery.toLowerCase();
    return (
      part.name.toLowerCase().includes(query) ||
      part.brand.toLowerCase().includes(query) ||
      part.model.toLowerCase().includes(query) ||
      part.year.toLowerCase().includes(query) ||
      part.color.toLowerCase().includes(query) ||
      part.location.toLowerCase().includes(query)
    );
  });

  if (loading && !parts.length) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-900 dark:text-zinc-50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Toaster position="top-right" richColors />
      
      {/* Sidebar */}
      <div className="flex h-screen overflow-hidden">
        <aside className="hidden w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:flex">
          <div className="flex h-16 items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight uppercase tracking-tighter">Casa do Para-choques</span>
              <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Maguin Auto Peças</span>
            </div>
          </div>
          
          <nav className="flex-1 space-y-1 p-4">
            <NavItem 
              active={view === 'dashboard'} 
              icon={<LayoutDashboard size={20} />} 
              label="Painel Geral" 
              onClick={() => setView('dashboard')} 
            />
            <NavItem 
              active={view === 'inventory'} 
              icon={<Package size={20} />} 
              label="Estoque / Peças" 
              onClick={() => setView('inventory')} 
            />
            <NavItem 
              active={view === 'add'} 
              icon={<PlusCircle size={20} />} 
              label="Cadastrar Peça" 
              onClick={() => setView('add')} 
            />
          </nav>
          
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
            <NavItem icon={<Settings size={20} />} label="Configurações" onClick={() => toast.info('Configurações em breve')} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="lg:hidden flex flex-col">
               <span className="font-bold text-sm tracking-tighter uppercase">Casa do Para-choques</span>
            </div>
            
            <div className="flex items-center gap-4 flex-1 justify-end max-w-xl mx-auto lg:mx-0">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  type="search"
                  placeholder="Pesquisar por peça, modelo, ano..."
                  className="pl-9 bg-zinc-100/50 border-none focus-visible:ring-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button size="icon" variant="outline" className="lg:hidden" onClick={() => setView('add')}>
                <PlusCircle size={20} />
              </Button>
            </div>
          </header>

          {/* Viewport */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            {view === 'dashboard' && stats && (
              <DashboardOverview stats={stats} />
            )}
            
            {view === 'inventory' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">Estoque Geral</h2>
                  <Button onClick={() => setView('add')}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Cadastrar Peça
                  </Button>
                </div>
                <PartGrid parts={filteredParts} onUpdate={fetchData} />
              </div>
            )}
            
            {view === 'add' && (
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                   <h2 className="text-2xl font-bold tracking-tight">Cadastrar Nova Peça</h2>
                   <p className="text-zinc-500">Adicione uma nova peça ao estoque da Maguin Auto Peças.</p>
                </div>
                <PartForm 
                  onSuccess={() => {
                    setView('inventory');
                    fetchData();
                  }} 
                  onCancel={() => setView('dashboard')} 
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-full shadow-2xl z-50">
        <MobileNavItem icon={<LayoutDashboard size={20} />} active={view === 'dashboard'} onClick={() => setView('dashboard')} />
        <MobileNavItem icon={<Package size={20} />} active={view === 'inventory'} onClick={() => setView('inventory')} />
        <MobileNavItem icon={<PlusCircle size={20} />} active={view === 'add'} onClick={() => setView('add')} />
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active 
          ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50' 
          : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileNavItem({ icon, active, onClick }: { icon: React.ReactNode, active?: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-full transition-all ${
        active 
          ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 scale-110 shadow-lg' 
          : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
      }`}
    >
      {icon}
    </button>
  );
}
