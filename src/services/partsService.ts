import { supabase, BUCKET_NAME } from '@/lib/supabase';
import { Part, DashboardStats } from '@/types';

export const partsService = {
  async getParts() {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Part[];
  },

  async getPartById(id: string) {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Part;
  },

  async createPart(part: Omit<Part, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('parts')
      .insert([part])
      .select()
      .single();
    
    if (error) throw error;
    return data as Part;
  },

  async updatePart(id: string, updates: Partial<Part>) {
    const { data, error } = await supabase
      .from('parts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Part;
  },

  async deletePart(id: string) {
    const { error } = await supabase
      .from('parts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateStock(id: string, quantityChange: number, type: 'entrada' | 'saida' | 'ajuste') {
    // We should do this in a transaction or a RPC call for safety
    // For now, let's fetch, update, and log movement
    const part = await this.getPartById(id);
    const newQuantity = Math.max(0, part.quantity + quantityChange);
    
    const { data, error } = await supabase
      .from('parts')
      .update({ quantity: newQuantity })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log movement
    await supabase.from('stock_movements').insert([
      { part_id: id, quantity_change: quantityChange, type }
    ]);

    return data as Part;
  },

  async uploadImages(files: File[]) {
    const urls: string[] = [];
    for (const file of files) {
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);
      
      urls.push(publicUrl);
    }
    return urls;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const parts = await this.getParts();
    const { data: movements } = await supabase
      .from('stock_movements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    const totalParts = parts.length;
    const totalQuantity = parts.reduce((acc, p) => acc + p.quantity, 0);
    const outOfStock = parts.filter(p => p.quantity <= 0).length;
    const lowStock = parts.filter(p => p.quantity > 0 && p.quantity < 5).length;
    const totalValue = parts.reduce((acc, p) => acc + (p.price_suggested * p.quantity), 0);

    return {
      totalParts,
      totalQuantity,
      outOfStock,
      lowStock,
      totalValue,
      recentMovements: movements || []
    };
  }
};
