import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PrayerRequest, PrayerCategory } from '../../types/prayer';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const CATEGORIES: { value: PrayerCategory; label: string; icon: string }[] = [
  { value: 'saude', label: 'Saúde', icon: '🏥' },
  { value: 'familia', label: 'Família', icon: '👨‍👩‍👧‍👦' },
  { value: 'trabalho', label: 'Trabalho', icon: '💼' },
  { value: 'financeiro', label: 'Financeiro', icon: '💰' },
  { value: 'relacionamento', label: 'Relacionamento', icon: '💑' },
  { value: 'espiritual', label: 'Espiritual', icon: '🙏' },
  { value: 'outros', label: 'Outros', icon: '✨' }
];

interface PrayerCardProps {
  request: PrayerRequest;
  onPrayerClick: (requestId: number) => void;
  onUpdate?: () => void;
}

export function PrayerCard({ request, onPrayerClick, onUpdate }: PrayerCardProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(request);
  const [editedTitle, setEditedTitle] = useState(request.title);
  const [editedDescription, setEditedDescription] = useState(request.description || '');
  const [editedCategory, setEditedCategory] = useState<PrayerCategory>(request.category);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCurrentRequest(request);
    setEditedTitle(request.title);
    setEditedDescription(request.description || '');
    setEditedCategory(request.category);
  }, [request]);

  const {
    id,
    title,
    description,
    created_at,
    profiles,
    prayer_count,
    has_prayed,
    praying_users,
    user_id
  } = currentRequest;

  const isAuthor = user?.id === user_id;

  const getPrayerText = () => {
    if (prayer_count === 0) return 'Seja o primeiro a orar';
    if (praying_users.length === 1) return `${praying_users[0]} está orando`;
    if (praying_users.length === 2) return `${praying_users[0]} e ${praying_users[1]} estão orando`;
    return `${praying_users[0]} e mais ${prayer_count - 1} pessoas estão orando`;
  };

  const handleSave = async () => {
    if (!editedTitle.trim()) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('prayer_requests')
        .update({
          title: editedTitle.trim(),
          description: editedDescription.trim() || null,
          category: editedCategory
        })
        .eq('id', id);

      if (error) throw error;

      setCurrentRequest({
        ...currentRequest,
        title: editedTitle.trim(),
        description: editedDescription.trim() || null,
        category: editedCategory
      });

      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      alert('Erro ao atualizar pedido. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Título
          </label>
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            maxLength={100}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Categoria
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setEditedCategory(value)}
                className={`p-2 rounded-lg border transition-all ${
                  editedCategory === value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <span className="text-xl mb-1">{icon}</span>
                <span className="block text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descrição (opcional)
          </label>
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows={3}
            maxLength={280}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              setIsEditing(false);
              setEditedTitle(title);
              setEditedDescription(description || '');
              setEditedCategory(request.category);
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !editedTitle.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img
            src={profiles?.avatar_url || '/default-avatar.png'}
            alt={`Avatar de ${profiles?.name || 'Anônimo'}`}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {profiles?.name || 'Anônimo'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(created_at), {
                addSuffix: true,
                locale: ptBR
              })}
            </p>
          </div>
        </div>
        {isAuthor && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
        )}
      </div>

      <div className="mb-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <span className="mr-1">
            {CATEGORIES.find(c => c.value === currentRequest.category)?.icon}
          </span>
          {CATEGORIES.find(c => c.value === currentRequest.category)?.label}
        </span>
      </div>

      <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
        {title}
      </h4>

      {description && (
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => onPrayerClick(id)}
          className={`flex items-center px-4 py-2 rounded-full transition-colors ${
            has_prayed
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
              : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
          }`}
        >
          {has_prayed ? 'Orando' : 'Orar'}
        </button>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {getPrayerText()}
        </p>
      </div>
    </div>
  );
}