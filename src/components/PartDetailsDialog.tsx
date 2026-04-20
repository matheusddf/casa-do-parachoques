import React from 'react';
import { Part } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { MapPin, Info, ArrowRightLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function PartDetailsDialog({ part, open, onOpenChange }: { part: Part | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  if (!part) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Carousel */}
          <div className="bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center p-4 min-h-[300px] md:min-h-full">
            {part.images && part.images.length > 0 ? (
              <Carousel className="w-full max-w-sm mx-auto">
                <CarouselContent>
                  {part.images.map((url, i) => (
                    <CarouselItem key={i}>
                      <div className="aspect-square relative rounded-xl overflow-hidden shadow-sm">
                        <img 
                          src={url} 
                          alt={`${part.name} - ${i + 1}`} 
                          className="h-full w-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {part.images.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </>
                )}
              </Carousel>
            ) : (
              <div className="text-zinc-400 italic">Nenhuma foto disponível</div>
            )}
          </div>

          {/* Right: Info */}
          <div className="p-8 space-y-6 bg-white dark:bg-zinc-950">
            <DialogHeader>
              <div className="flex gap-2 mb-2">
                <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800 border-none font-mono text-[10px] uppercase">
                  {part.category}
                </Badge>
                <Badge className={part.condition === 'Novo' ? 'bg-emerald-500' : 'bg-zinc-500'}>
                  {part.condition}
                </Badge>
              </div>
              <DialogTitle className="text-3xl font-bold tracking-tighter uppercase">{part.name}</DialogTitle>
              <p className="text-sm text-zinc-500 font-medium uppercase tracking-widest mt-1">
                {part.brand} {part.model} · {part.year}
              </p>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem icon={<MapPin size={16} />} label="Localização" value={part.location} />
                <InfoItem icon={<ArrowRightLeft size={16} />} label="Estoque" value={`${part.quantity} unidades`} />
              </div>
              
              <Separator className="opacity-50" />
              
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest leading-none">Preço sugerido</span>
                <div className="text-4xl font-black text-zinc-900 dark:text-zinc-50">
                   {formatCurrency(part.price_suggested)}
                </div>
                <p className="text-[10px] text-zinc-500 italic mt-1">Custo: {formatCurrency(part.price_cost)}</p>
              </div>

              {part.observations && (
                <>
                  <Separator className="opacity-50" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50 font-semibold text-sm">
                      <Info size={16} /> 
                      Observações
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                      {part.observations}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest leading-none block">{label}</span>
      <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50 text-sm font-medium">
        {icon}
        {value}
      </div>
    </div>
  );
}
