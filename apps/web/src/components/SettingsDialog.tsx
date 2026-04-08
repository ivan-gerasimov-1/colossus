import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { X } from 'lucide-react';

type Props = {
	onClose: () => void;
	email: string | undefined;
	name: string | undefined;
	publicId: string;
};

export default function SettingsDialog({
	onClose,
	email,
	name,
	publicId,
}: Props) {
	const [nameValue, setNameValue] = useState(name ?? '');
	const [publicIdValue, setPublicIdValue] = useState(publicId);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const updateProfile = useMutation(api.users.updateProfile);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);

		// Клиентская валидация
		if (publicIdValue.length < 3) {
			setError('Минимум 3 символа');
			return;
		}
		if (!/^[a-zA-Z0-9.-]+$/.test(publicIdValue)) {
			setError('Разрешены только буквы, цифры, дефисы и точки');
			return;
		}

		setLoading(true);
		try {
			await updateProfile({
				name: nameValue || undefined,
				publicId: publicIdValue,
			});
			onClose();
		} catch (err: any) {
			setError(err.message || 'Ошибка при сохранении');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div className="bg-card border rounded-lg shadow-lg w-full max-w-sm mx-4">
				<div className="flex items-center justify-between px-4 py-3 border-b">
					<h2 className="font-semibold text-sm">Настройки</h2>
					<button
						onClick={onClose}
						className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent transition-colors text-muted-foreground"
					>
						<X size={16} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="px-4 py-4 flex flex-col gap-3">
					{/* Email - readonly */}
					<div className="flex flex-col gap-1.5">
						<label className="text-sm font-medium" htmlFor="settings-email">
							Почта
						</label>
						<input
							id="settings-email"
							type="email"
							value={email ?? ''}
							readOnly
							className="flex h-9 w-full rounded-md border bg-muted/50 px-3 py-1 text-sm text-muted-foreground outline-none cursor-not-allowed"
						/>
					</div>

					{/* Password - readonly, masked */}
					<div className="flex flex-col gap-1.5">
						<label className="text-sm font-medium" htmlFor="settings-password">
							Пароль
						</label>
						<input
							id="settings-password"
							type="password"
							value="••••••••"
							readOnly
							className="flex h-9 w-full rounded-md border bg-muted/50 px-3 py-1 text-sm text-muted-foreground outline-none cursor-not-allowed"
						/>
					</div>

					{/* Public ID - editable */}
					<div className="flex flex-col gap-1.5">
						<label className="text-sm font-medium" htmlFor="settings-publicId">
							Публичный ID
						</label>
						<input
							id="settings-publicId"
							type="text"
							value={publicIdValue}
							onChange={(e) => setPublicIdValue(e.target.value)}
							placeholder="cosmic.nebula.42"
							className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-[3px] placeholder:text-muted-foreground"
						/>
						<p className="text-xs text-muted-foreground">
							Минимум 3 символа, только буквы, цифры, дефисы и точки
						</p>
					</div>

					{/* Name - editable */}
					<div className="flex flex-col gap-1.5">
						<label className="text-sm font-medium" htmlFor="settings-name">
							Имя
						</label>
						<input
							id="settings-name"
							type="text"
							value={nameValue}
							onChange={(e) => setNameValue(e.target.value)}
							placeholder="Ваше имя"
							className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-[3px] placeholder:text-muted-foreground"
						/>
					</div>

					{error && <p className="text-sm text-destructive">{error}</p>}

					<button
						type="submit"
						disabled={loading}
						className="inline-flex items-center justify-center h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium shadow-xs hover:bg-primary/90 disabled:opacity-50 transition-colors"
					>
						{loading ? 'Сохранение...' : 'Сохранить'}
					</button>
				</form>
			</div>
		</div>
	);
}
