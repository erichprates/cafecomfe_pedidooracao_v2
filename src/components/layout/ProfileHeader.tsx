import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';

export function ProfileHeader() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
      <div className="flex items-center">
        <img
          src={profile?.avatar_url || '/default-avatar.png'}
          alt="Avatar"
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {profile?.name || 'Usuário'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user?.email}
          </p>
        </div>
      </div>
      <button
        onClick={signOut}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <span className="material-symbols-outlined">logout</span>
      </button>
    </div>
  );
} 