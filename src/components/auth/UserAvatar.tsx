interface UserAvatarProps {
  avatarUrl: string | null | undefined;
}

export function UserAvatar({ avatarUrl }: UserAvatarProps) {
  return (
    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar do usuário"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32?text=Avatar';
          }}
        />
      ) : (
        <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-sm">
          A
        </div>
      )}
    </div>
  );
}