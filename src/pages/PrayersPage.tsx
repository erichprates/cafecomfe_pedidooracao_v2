import { useState } from 'react';
import { Layout } from '../components/layout';
import { PrayerRequestForm } from '../components/prayers/PrayerRequestForm';
import { PrayerCard } from '../components/prayers/PrayerCard';
import { usePrayerRequests } from '../hooks/usePrayerRequests';
import { PrayerCategory } from '../types/prayer';

type SortOption = 'recent' | 'prayers' | 'answered';

const CATEGORIES: { value: PrayerCategory; label: string; icon: string }[] = [
  { value: 'saude', label: 'Saúde', icon: '🏥' },
  { value: 'familia', label: 'Família', icon: '👨‍👩‍👧‍👦' },
  { value: 'trabalho', label: 'Trabalho', icon: '💼' },
  { value: 'financeiro', label: 'Financeiro', icon: '💰' },
  { value: 'relacionamento', label: 'Relacionamento', icon: '💑' },
  { value: 'espiritual', label: 'Espiritual', icon: '🙏' },
  { value: 'outros', label: 'Outros', icon: '✨' }
];

export function PrayersPage() {
  const { requests, isLoading, createPrayerRequest, togglePrayer, loadRequests } = usePrayerRequests();
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PrayerCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = requests
    .filter(request => {
      const matchesCategory = selectedCategory === 'all' || request.category === selectedCategory;
      const matchesSearch = searchTerm === '' || 
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'prayers':
          return b.prayer_count - a.prayer_count;
        case 'answered':
          if (a.is_answered === b.is_answered) return 0;
          return a.is_answered ? -1 : 1;
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="material-symbols-outlined mr-2">church</span>
            Pedidos de Oração
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all transform hover:scale-105 ${
              showForm ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <span className="material-symbols-outlined mr-1">add</span>
            Pedir Oração
          </button>
        </div>

        <div className={`transition-all duration-300 ${showForm ? 'opacity-100 max-h-[800px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
          <PrayerRequestForm 
            onSubmit={async (title, description, category) => {
              await createPrayerRequest(title, description, category);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              Todos
            </button>
            {CATEGORIES.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setSelectedCategory(value)}
                className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === value
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                <span className="mr-1">{icon}</span>
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">
                <span className="material-symbols-outlined">search</span>
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar pedidos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="recent">Mais recentes</option>
              <option value="prayers">Mais orações</option>
              <option value="answered">Orações respondidas</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchTerm || selectedCategory !== 'all' ? (
              <>
                <p className="mb-4">Nenhum pedido encontrado com estes filtros.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Limpar filtros
                </button>
              </>
            ) : (
              <>
                <p className="mb-4">Nenhum pedido de oração ainda.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Seja o primeiro a compartilhar!
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <PrayerCard
                key={request.id}
                request={request}
                onPrayerClick={togglePrayer}
                onUpdate={loadRequests}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}