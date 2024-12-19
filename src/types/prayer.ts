export type PrayerCategory = 
  | 'saude' 
  | 'familia' 
  | 'trabalho' 
  | 'financeiro' 
  | 'relacionamento'
  | 'espiritual'
  | 'outros';

export type PrayerStatus = 'ativo' | 'respondido' | 'arquivado';

export interface PrayerRequest {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  category: PrayerCategory;
  status: PrayerStatus;
  is_answered: boolean;
  answered_at: string | null;
  created_at: string;
  updated_at: string;
  // Campos relacionados
  profiles: {
    name: string | null;
    avatar_url: string | null;
  };
  // Campos calculados
  prayer_count: number;
  has_prayed: boolean;
  praying_users: string[];
}