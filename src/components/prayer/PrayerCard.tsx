import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PrayerRequest } from '../../types/prayer';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface PrayerCardProps {
  prayer: PrayerRequest;
  onPrayerUpdate: () => void;
}

export function PrayerCard({ prayer, onPrayerUpdate }: PrayerCardProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const hasPrayed = prayer.prayer_interactions?.some(
    interaction => interaction.user_id === user?.id
  );

  const prayingUsers = prayer.prayer_interactions?.map(
    interaction => interaction.profiles?.name || 'Anônimo'
  ) || [];

  const prayerCount = prayer._count?.prayer_interactions || 0;

  const getPrayerText = () => {
    if (prayerCount === 0) return 'Seja o primeiro a orar';
    if (prayingUsers.length === 1) return `${prayingUsers[0]} está orando`;
    if (prayingUsers.length === 2) return `${prayingUsers[0]} e ${prayingUsers[1]} estão orando`;
    return `${prayingUsers[0]} e mais ${prayerCount - 1} pessoas estão orando`;
  };

  const handlePrayClick = async () => {
    if (!user || isLoading) return;

    try {
      setIsLoading(true);

      if (hasPrayed) {
        // Remover oração
        const { error } = await supabase
          .from('prayer_interactions')
          .delete()
          .match({ prayer_request_id: prayer.id, user_id: user.id });

        if (error) throw error;
      } else {
        // Adicionar oração
        const { error } = await supabase
          .from('prayer_interactions')
          .insert({
            prayer_request_id: prayer.id,
            user_id: user.id
          });

        if (error) throw error;
      }

      onPrayerUpdate();
    } catch (error) {
      console.error('Erro ao atualizar oração:', error);
      alert('Erro ao atualizar oração. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center mb-4">
        <img
          src={prayer.profiles?.avatar_url || '/default-avatar.png'}
          alt={`Avatar de ${prayer.profiles?.name || 'Usuário'}`}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {prayer.profiles?.name || 'Anônimo'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(prayer.created_at), {
              addSuffix: true,
              locale: ptBR
            })}
          </p>
        </div>
      </div>

      <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
        {prayer.title}
      </h4>

      {prayer.description && (
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {prayer.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={handlePrayClick}
          disabled={isLoading}
          className={`flex items-center px-4 py-2 rounded-full transition-colors ${
            hasPrayed
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
              : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
          }`}
        >
          <span className="material-icons-outlined mr-1 text-lg">
            {hasPrayed ? 'favorite' : 'favorite_border'}
          </span>
          {hasPrayed ? 'Orando' : 'Orar'}
        </button>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {getPrayerText()}
        </p>
      </div>
    </div>
  );
} 