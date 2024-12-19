import { useState } from 'react';
import { PrayerCategory } from '../../types/prayer';

interface PrayerRequestFormProps {
  onSubmit: (title: string, description: string, category: PrayerCategory) => Promise<void>;
  onCancel: () => void;
}

const CATEGORIES: { value: PrayerCategory; label: string; icon: string }[] = [
  { value: 'saude', label: 'Saúde', icon: '🏥' },
  { value: 'familia', label: 'Família', icon: '👨‍👩‍👧‍👦' },
  { value: 'trabalho', label: 'Trabalho', icon: '💼' },
  { value: 'financeiro', label: 'Financeiro', icon: '💰' },
  { value: 'relacionamento', label: 'Relacionamento', icon: '💑' },
  { value: 'espiritual', label: 'Espiritual', icon: '🙏' },
  { value: 'outros', label: 'Outros', icon: '✨' }
];

export function PrayerRequestForm({ onSubmit, onCancel }: PrayerRequestFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PrayerCategory>('outros');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !title.trim()) return;

    try {
      setIsLoading(true);
      await onSubmit(title.trim(), description.trim(), category);
      setTitle('');
      setDescription('');
      setCategory('outros');
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 animate-slideDown">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
        <span className="material-icons-outlined mr-2">add</span>
        Compartilhe seu Pedido de Oração
      </h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Categoria
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CATEGORIES.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              className={`p-2 rounded-lg border transition-all ${
                category === value
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
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Qual seu pedido? *
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
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {100 - title.length} caracteres restantes
        </p>
      </div>

      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Conte um pouco mais (opcional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={280}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Compartilhe mais detalhes sobre seu pedido..."
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {280 - description.length} caracteres restantes
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading || !title.trim()}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          <span className="material-icons-outlined mr-2">send</span>
          {isLoading ? 'Enviando...' : 'Enviar Oração'}
        </button>
      </div>
    </form>
  );
}