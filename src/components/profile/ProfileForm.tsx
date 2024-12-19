interface ProfileFormProps {
  email: string;
  name: string;
  onNameChange: (value: string) => void;
  onSubmit: () => void;
}

export function ProfileForm({ email, name, onNameChange, onSubmit }: ProfileFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nome
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full p-3 border rounded-lg dark:bg-gray-700"
          placeholder="Seu nome"
        />
      </div>

      <button
        onClick={onSubmit}
        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
      >
        Salvar Alterações
      </button>
    </div>
  );
}