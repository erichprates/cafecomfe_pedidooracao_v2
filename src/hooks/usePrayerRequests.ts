import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { PrayerRequest, PrayerCategory } from '../types/prayer';

export function usePrayerRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      
      // Buscar os pedidos de oração
      const { data: prayerRequests, error: requestsError } = await supabase
        .from('prayer_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      console.log('Pedidos encontrados:', prayerRequests);

      if (!prayerRequests || prayerRequests.length === 0) {
        console.log('Nenhum pedido encontrado');
        setRequests([]);
        return;
      }

      // Buscar os perfis dos usuários
      const userIds = [...new Set(prayerRequests.map(pr => pr.user_id))];
      console.log('IDs de usuários:', userIds);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;
      console.log('Perfis encontrados:', profiles);

      // Buscar as interações
      const { data: interactions, error: interactionsError } = await supabase
        .from('prayer_interactions')
        .select('prayer_request_id, user_id')
        .in('prayer_request_id', prayerRequests.map(pr => pr.id));

      if (interactionsError) throw interactionsError;
      console.log('Interações encontradas:', interactions);

      // Mapear os perfis para fácil acesso
      const profilesMap = new Map(profiles.map(p => [p.id, p]));

      // Processar os dados
      const formattedRequests = prayerRequests.map(request => {
        const profile = profilesMap.get(request.user_id);
        console.log('Perfil para request', request.id, ':', profile);
        
        const requestInteractions = interactions?.filter(i => i.prayer_request_id === request.id) || [];
        console.log('Interações para request', request.id, ':', requestInteractions);
        
        const prayingProfiles = requestInteractions
          .map(i => profilesMap.get(i.user_id))
          .filter(Boolean);
        console.log('Perfis orando para request', request.id, ':', prayingProfiles);

        return {
          ...request,
          profiles: {
            name: profile?.name || null,
            avatar_url: profile?.avatar_url || null
          },
          prayer_count: requestInteractions.length,
          has_prayed: requestInteractions.some(i => i.user_id === user?.id),
          praying_users: prayingProfiles.map(p => p?.name || 'Anônimo')
        };
      });

      console.log('Requests formatados:', formattedRequests);
      setRequests(formattedRequests);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPrayerRequest = async (title: string, description: string, category: PrayerCategory) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('prayer_requests')
        .insert({
          user_id: user.id,
          title,
          description: description || null,
          category
        });

      if (error) throw error;

      await loadRequests();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
  };

  const togglePrayer = async (requestId: number) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      if (request.has_prayed) {
        const { error } = await supabase
          .from('prayer_interactions')
          .delete()
          .match({ prayer_request_id: requestId, user_id: user.id });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('prayer_interactions')
          .insert({
            prayer_request_id: requestId,
            user_id: user.id
          });

        if (error) throw error;
      }

      await loadRequests();
    } catch (error) {
      console.error('Erro ao atualizar oração:', error);
      throw error;
    }
  };

  const markAsAnswered = async (requestId: number) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('prayer_requests')
        .update({
          is_answered: true,
          answered_at: new Date().toISOString(),
          status: 'respondido'
        })
        .eq('id', requestId)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadRequests();
    } catch (error) {
      console.error('Erro ao marcar como respondido:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  return {
    requests,
    isLoading,
    createPrayerRequest,
    togglePrayer,
    markAsAnswered,
    loadRequests
  };
}