import { Camera } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AvatarProps {
  imageUrl: string | null;
  onAvatarClick: () => void;
  uploading?: boolean;
  size?: 'sm' | 'lg';
}

export function Avatar({ imageUrl, onAvatarClick, uploading, size = 'lg' }: AvatarProps) {
  const [imgSrc, setImgSrc] = useState<string>('https://via.placeholder.com/150?text=Foto+de+Perfil');

  useEffect(() => {
    if (imageUrl) {
      setImgSrc(imageUrl);
    }
  }, [imageUrl]);

  const handleImageError = () => {
    setImgSrc('https://via.placeholder.com/150?text=Foto+de+Perfil');
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    lg: 'w-32 h-32'
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" onClick={onAvatarClick}>
        <img
          src={imgSrc}
          alt="Foto de Perfil"
          className={`${sizeClasses[size]} rounded-full object-cover cursor-pointer`}
          onError={handleImageError}
        />
        {size === 'lg' && (
          <div className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer">
            <Camera className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      {uploading && (
        <p className="text-sm text-gray-500 mt-2">Enviando imagem...</p>
      )}
    </div>
  );
}