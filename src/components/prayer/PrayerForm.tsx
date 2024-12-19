import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface PrayerFormProps {
  onPrayerCreated: () => void;
}

export function PrayerForm({ onPrayerCreated }: PrayerFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isLoading || !title.trim()) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('prayer_requests')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null
        });

      if (error) throw error;

      setTitle('');
      setDescription('');
      onPrayerCreated();
      alert('Pedido de oração criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar pedido de oração:', error);
      alert('Erro ao criar pedido de oração. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Título do Pedido *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Ex: Oração pela minha família"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descrição (opcional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={280}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Compartilhe mais detalhes sobre seu pedido de oração..."
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !title.trim()}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Enviando...' : 'Enviar Pedido de Oração'}
      </button>
    </form>
  );
} 