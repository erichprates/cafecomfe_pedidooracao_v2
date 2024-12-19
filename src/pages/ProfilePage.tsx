import { useState, useRef, useEffect } from 'react';
import { Layout } from '../components/layout';
import { Avatar } from '../components/profile/Avatar';
import { ProfileForm } from '../components/profile/ProfileForm';
import { supabase, uploadAvatar } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';

export function ProfilePage() {
  const { user } = useAuth();
  const { profile, isLoading, loadProfile } = useProfile();
  const [name, setName] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile?.name !== undefined) {
      setName(profile.name || '');
    }
  }, [profile?.name]);

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para upload.');
      }

      const file = event.target.files[0];
      if (!user?.id) throw new Error('Usuário não encontrado');

      const publicUrl = await uploadAvatar(file, user.id);
      console.log('URL pública gerada:', publicUrl);
      await loadProfile();
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
      alert('Erro ao atualizar avatar. Tente novamente.');
    } finally {
      setUploading(false);
    }
  }

  async function handleUpdateProfile() {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      alert('Perfil atualizado com sucesso!');
      await loadProfile();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-20">
        <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>

        <div className="space-y-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            className="hidden"
            accept="image/*"
          />

          <Avatar
            imageUrl={profile?.avatar_url ?? null}
            onAvatarClick={handleAvatarClick}
            uploading={uploading}
          />

          <ProfileForm
            email={user?.email || ''}
            name={name}
            onNameChange={setName}
            onSubmit={handleUpdateProfile}
          />
        </div>
      </div>
    </Layout>
  );
}