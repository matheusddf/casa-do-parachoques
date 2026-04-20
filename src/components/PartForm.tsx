import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, Image as ImageIcon, Loader2, X, Sparkles } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/shadcn/card';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { Label } from '@/components/shadcn/label';
import { Textarea } from '@/components/shadcn/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/shadcn/select';
import { partsService } from '@/services/partsService';
import { geminiService } from '@/services/geminiService';
import { toast } from 'sonner';

import { Part } from '@/types';

const partSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  brand: z.string().min(1, 'Informe a marca'),
  model: z.string().min(1, 'Informe o modelo'),
  year: z.string().min(4, 'Informe o ano'),
  color: z.string().min(1, 'Informe a cor'),
  condition: z.enum(['Novo', 'Conservado', 'Usado', 'Esgotado', 'Quebrado', 'Bom']),
  price_suggested: z.number().min(0, 'Preço deve ser positivo'),
  price_cost: z.number().min(0, 'Preço deve ser positivo'),
  quantity: z.number().min(0, 'Estoque deve ser positivo'),
  location: z.string().min(1, 'Informe a localização (Ex: Prateleira 5)'),
  category: z.string().min(1, 'Informe a categoria'),
  observations: z.string().optional(),
});

type PartFormValues = z.infer<typeof partSchema>;

export function PartForm({ 
  onSuccess, 
  onCancel,
  initialData 
}: { 
  onSuccess: () => void, 
  onCancel: () => void,
  initialData?: Part
}) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(initialData?.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const form = useForm<PartFormValues>({
    resolver: zodResolver(partSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      brand: initialData.brand,
      model: initialData.model,
      year: initialData.year,
      color: initialData.color,
      condition: initialData.condition as any,
      price_suggested: initialData.price_suggested,
      price_cost: initialData.price_cost,
      quantity: initialData.quantity,
      location: initialData.location,
      category: initialData.category,
      observations: initialData.observations || '',
    } : {
      condition: 'Conservado',
      quantity: 1,
      price_suggested: 0,
      price_cost: 0,
      category: 'Outros',
      color: '',
      observations: '',
    },
  });

  const handleAIIdentify = async () => {
    if (images.length === 0) {
      toast.error('Adicione pelo menos uma foto para identificar');
      return;
    }

    try {
      setIsAnalyzing(true);
      const file = images[0];
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(file);
      
      const base64 = await base64Promise;
      const suggestions = await geminiService.analyzePartPhoto(base64);
      
      if (suggestions.name) form.setValue('name', suggestions.name);
      if (suggestions.brand) form.setValue('brand', suggestions.brand);
      if (suggestions.model) form.setValue('model', suggestions.model);
      if (suggestions.category) form.setValue('category', suggestions.category);
      if (suggestions.condition_guess) form.setValue('condition', suggestions.condition_guess);
      
      toast.success('IA identificou a peça! Revise os campos preenchidos.');
    } catch (error) {
      toast.error('Erro na identificação por IA. Tente preencher manualmente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 7) {
      toast.error('Limite máximo de 7 fotos atingido');
      return;
    }

    setImages((prev) => [...prev, ...files]);
    
    const newPreviews = files.map((file) => URL.createObjectURL(file as Blob));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: PartFormValues) => {
    try {
      setIsSubmitting(true);
      
      let imageUrls: string[] = initialData?.images || [];
      if (images.length > 0) {
        const uploadedUrls = await partsService.uploadImages(images);
        imageUrls = [...imageUrls, ...uploadedUrls].slice(0, 7);
      }

      if (initialData) {
        await partsService.updatePart(initialData.id, {
          ...values,
          images: imageUrls,
        });
        toast.success('Peça atualizada com sucesso!');
      } else {
        await partsService.createPart({
          ...values,
          images: imageUrls,
        });
        toast.success('Peça cadastrada com sucesso!');
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar peça. Verifique os dados e a conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CardContent className="p-0 space-y-8">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <Label className="text-base font-semibold">Fotos da Peça ({images.length}/7)</Label>
               <input
                 type="file"
                 id="image-upload"
                 multiple
                 accept="image/*"
                 className="hidden"
                 onChange={handleImageChange}
               />
               <div className="flex gap-2">
                 <Button 
                   type="button" 
                   variant="outline" 
                   size="sm" 
                   className="text-zinc-500"
                   onClick={handleAIIdentify}
                   disabled={isAnalyzing || images.length === 0}
                 >
                   {isAnalyzing ? <Loader2 size={16} className="animate-spin mr-2" /> : <Sparkles size={16} className="mr-2 text-amber-500" />}
                   Sugerir com IA
                 </Button>
                 <Button 
                   type="button" 
                   variant="outline" 
                   size="sm" 
                   onClick={() => document.getElementById('image-upload')?.click()}
                 >
                   <Camera className="mr-2 h-4 w-4" /> Adicionar Fotos
                 </Button>
               </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {previews.map((preview, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800">
                  <img src={preview} alt="preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {previews.length === 0 && (
                <div 
                  className="col-span-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center text-zinc-500 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <ImageIcon size={32} className="mb-2 opacity-20" />
                  <span className="text-sm">Clique para enviar fotos</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Peça</Label>
              <Input 
                id="name" 
                placeholder="Ex: Para-choque Dianteiro" 
                {...form.register('name')} 
                className={form.formState.errors.name ? 'border-red-500' : ''}
              />
              {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input id="category" placeholder="Ex: Lataria, Motor, etc." {...form.register('category')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input id="brand" placeholder="Ex: Toyota" {...form.register('brand')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input id="model" placeholder="Ex: Corolla" {...form.register('model')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Ano Compatível</Label>
              <Input id="year" placeholder="Ex: 2012-2015" {...form.register('year')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <Input id="color" placeholder="Ex: Branco Pérola" {...form.register('color')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização Interna (Prateleira/Corredor)</Label>
              <Input id="location" placeholder="Ex: Corredor A, Prateleira 4" {...form.register('location')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Estado da Peça</Label>
              <Select onValueChange={(val) => form.setValue('condition', val as any)} defaultValue="Conservado">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Novo">Novo</SelectItem>
                  <SelectItem value="Conservado">Conversado</SelectItem>
                  <SelectItem value="Usado">Usado</SelectItem>
                  <SelectItem value="Bom">Bom</SelectItem>
                  <SelectItem value="Quebrado">Com defeito / Quebrado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
               <Label htmlFor="price_cost">Preço de Custo (R$)</Label>
               <Input 
                 id="price_cost" 
                 type="number" 
                 step="0.01" 
                 {...form.register('price_cost', { valueAsNumber: true })} 
               />
            </div>

            <div className="space-y-2">
               <Label htmlFor="price_suggested">Preço de Venda (R$)</Label>
               <Input 
                 id="price_suggested" 
                 type="number" 
                 step="0.01" 
                 {...form.register('price_suggested', { valueAsNumber: true })} 
               />
            </div>

            <div className="space-y-2">
               <Label htmlFor="quantity">Quantidade em Estoque</Label>
               <Input 
                 id="quantity" 
                 type="number" 
                 {...form.register('quantity', { valueAsNumber: true })} 
               />
            </div>
          </div>

          <div className="space-y-2">
             <Label htmlFor="observations">Observações Adicionais</Label>
             <Textarea id="observations" placeholder="Detalhes técnicos, defeitos específicos, etc..." {...form.register('observations')} className="min-h-[100px]" />
          </div>
        </CardContent>

        <CardFooter className="p-0 pt-6 flex justify-end gap-4">
           <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
           <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
             {isSubmitting ? (
               <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
             ) : (
               initialData ? 'Salvar Alterações' : 'Cadastrar Peça'
             )}
           </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
