import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ivbvgltqspevvhlnvenl.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2YnZnbHRxc3BldnZobG52ZW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NTY3ODksImV4cCI6MjA0OTQzMjc4OX0.sz7YwHPLQq1JWtCZ-0Q5BSpv-Qm4qwdivVy0ql48Gj4';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

export async function uploadAvatar(file: File, userId: string) {
  try {
    // Remove avatar antigo se existir
    const { data: existingFiles } = await supabase.storage
      .from('avatars')
      .list(`${userId}`);

    if (existingFiles?.length) {
      await supabase.storage
        .from('avatars')
        .remove(existingFiles.map(f => `${userId}/${f.name}`));
    }

    // Upload do novo avatar
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '0',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Atualizar perfil com nova URL do avatar
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    return publicUrl;
  } catch (error) {
    console.error('Erro no upload do avatar:', error);
    throw error;
  }
}