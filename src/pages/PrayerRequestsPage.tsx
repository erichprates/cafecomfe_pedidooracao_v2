import { useState, useEffect } from 'react';
import { Layout } from '../components/layout';
import { PrayerForm } from '../components/prayer/PrayerForm';
import { PrayerCard } from '../components/prayer/PrayerCard';
import { supabase } from '../lib/supabase';
import { PrayerRequest } from '../types/prayer';

export function PrayerRequestsPage() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPrayers();
  }, []);

  async function loadPrayers() {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('prayer_requests')
        .select(`
          *,
          profiles:user_id (
            name,
            avatar_url
          ),
          prayer_interactions (
            id,
            user_id,
            profiles:user_id (
              name,
              avatar_url
            )
          ),
          _count (
            prayer_interactions
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPrayers(data || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos de oração:', error);
      alert('Erro ao carregar pedidos de oração. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Pedidos de Oração
        </h1>

        <PrayerForm onPrayerCreated={loadPrayers} />

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : prayers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Nenhum pedido de oração ainda. Seja o primeiro a compartilhar!
          </div>
        ) : (
          <div className="space-y-4">
            {prayers.map((prayer) => (
              <PrayerCard
                key={prayer.id}
                prayer={prayer}
                onPrayerUpdate={loadPrayers}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
} 