import React, { useState } from 'react';
import { Part } from '@/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/shadcn/Card';
import { Badge } from '@/components/shadcn/Badge';
import { Button } from '@/components/shadcn/Button';
import { MoreHorizontal, Edit, Trash, PackagePlus, PackageMinus, MapPin, Pencil } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/shadcn/DropdownMenu';
import { partsService } from '@/services/partsService';
import { toast } from 'sonner';
import { PartDetailsDialog } from './PartDetailsDialog';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/Dialog";
import { PartForm } from './PartForm';

export function PartGrid({ parts, onUpdate }: { parts: Part[], onUpdate: () => void }) {
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [editingPart, setEditingPart] = useState<Part | null>(null);

  if (parts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
        <PackagePlus size={48} className="text-zinc-300 mb-4" />
        <h3 className="text-lg font-medium">Nenhuma peça encontrada</h3>
        <p className="text-zinc-500 max-w-xs mx-auto">Tente ajustar sua pesquisa ou cadastre um novo item.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {parts.map((part) => (
          <PartCard 
            key={part.id} 
            part={part} 
            onUpdate={onUpdate} 
            onView={() => setSelectedPart(part)}
            onEdit={() => setEditingPart(part)}
          />
        ))}
      </div>

      <PartDetailsDialog 
        part={selectedPart} 
        open={!!selectedPart} 
        onOpenChange={(open) => !open && setSelectedPart(null)} 
      />

      <Dialog open={!!editingPart} onOpenChange={(open) => !open && setEditingPart(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Peça: {editingPart?.name}</DialogTitle>
          </DialogHeader>
          {editingPart && (
            <PartForm 
              initialData={editingPart} 
              onSuccess={() => {
                setEditingPart(null);
                onUpdate();
              }} 
              onCancel={() => setEditingPart(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function PartCard({ 
  part, 
  onUpdate, 
  onView, 
  onEdit 
}: { 
  part: Part, 
  onUpdate: () => void, 
  onView: () => void,
  onEdit: () => void,
  key?: string
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStockUpdate = async (change: number) => {
    try {
      setIsUpdating(true);
      await partsService.updateStock(part.id, change, change > 0 ? 'entrada' : 'saida');
      onUpdate();
      toast.success('Estoque atualizado');
    } catch (error) {
      toast.error('Erro ao atualizar estoque');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta peça?')) return;
    try {
      await partsService.deletePart(part.id);
      onUpdate();
      toast.success('Peça excluída com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir peça');
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Novo': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200';
      case 'Conservado': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
      case 'Usado': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200';
      case 'Quebrado': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200';
      default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
    }
  };

  return (
    <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md group flex flex-col h-full">
      <div 
        className="relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-pointer"
        onClick={onView}
      >
        {part.images && part.images.length > 0 ? (
          <img 
            src={part.images[0]} 
            alt={part.name} 
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400 italic text-xs">
            Sem foto
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          <Badge variant="outline" className={getConditionColor(part.condition)}>
            {part.condition}
          </Badge>
          {part.quantity === 0 && (
            <Badge variant="destructive">Esgotado</Badge>
          )}
        </div>
      </div>
      
      <CardHeader className="p-4 space-y-1">
        <div className="flex justify-between items-start">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-base line-clamp-1">{part.name}</CardTitle>
            <CardDescription className="text-xs uppercase tracking-wider font-mono">
              {part.brand} {part.model} · {part.year}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil size={14} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              <Trash size={14} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 py-0 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-zinc-500">Estoque:</span>
          <span className={part.quantity < 5 ? 'text-amber-600 font-bold' : ''}>
            {part.quantity} unidades
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <MapPin size={12} className="text-zinc-400" />
          <span>{part.location}</span>
        </div>
        <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-1">
          {Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(part.price_suggested)}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-4 flex flex-col gap-3 border-t border-zinc-100 dark:border-zinc-800 mt-4">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800" 
            onClick={(e) => {
              e.stopPropagation();
              handleStockUpdate(1);
            }}
            disabled={isUpdating}
          >
            <PackagePlus className="mr-1.5 h-3.5 w-3.5 text-green-600" /> +1 Entrada
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-900/30 border-amber-200 dark:border-amber-800"
            onClick={(e) => {
              e.stopPropagation();
              handleStockUpdate(-1);
            }}
            disabled={isUpdating || part.quantity <= 0}
          >
            <PackageMinus className="mr-1.5 h-3.5 w-3.5 text-amber-600" /> -1 Saída
          </Button>
        </div>
        <Button 
          variant="destructive" 
          size="sm" 
          className="w-full text-xs"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
        >
          <Trash className="mr-1.5 h-3.5 w-3.5" /> Apagar Peça Permanentemente
        </Button>
      </CardFooter>
    </Card>
  );
}
