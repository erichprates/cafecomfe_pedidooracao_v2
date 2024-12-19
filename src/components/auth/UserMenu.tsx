import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../profile/Avatar';
import { useProfile } from '../../hooks/useProfile';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleAvatarClick = () => {
    navigate('/profile');
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Avatar 
          imageUrl={profile?.avatar_url} 
          onAvatarClick={handleAvatarClick}
          size="sm"
        />
        <span className="text-sm text-gray-700 dark:text-gray-200">
          {profile?.name || user.email}
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Sair"
      >
        <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );
}