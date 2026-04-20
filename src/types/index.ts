
export type PartCondition = 'Novo' | 'Conservado' | 'Usado' | 'Esgotado' | 'Quebrado' | 'Bom';

export interface Part {
  id: string;
  created_at: string;
  name: string;
  brand: string;
  model: string;
  year: string;
  color: string;
  condition: PartCondition;
  price_suggested: number;
  price_cost: number;
  quantity: number;
  location: string;
  category: string;
  observations?: string;
  images: string[]; // URLs from storage
}

export interface StockMovement {
  id: string;
  part_id: string;
  user_id: string;
  quantity_change: number;
  type: 'entrada' | 'saida' | 'ajuste';
  created_at: string;
  reason?: string;
}

export interface DashboardStats {
  totalParts: number;
  totalQuantity: number;
  outOfStock: number;
  lowStock: number;
  totalValue: number;
  recentMovements: StockMovement[];
}
