import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useConvexMutation } from '@convex-dev/react-query';
import { api } from '../../convex/_generated/api';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

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
	const [error, setError] = useState<string | null>(null);

	const { mutate: updateProfile, isPending } = useMutation({
		mutationFn: useConvexMutation(api.users.updateProfile),
	});

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

		updateProfile({
			name: nameValue || undefined,
			publicId: publicIdValue,
		});
		onClose();
	}

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>Настройки</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="flex flex-col gap-3">
					{/* Email - readonly */}
					<div className="flex flex-col gap-1.5">
						<label className="text-sm font-medium" htmlFor="settings-email">
							Почта
						</label>
						<Input
							id="settings-email"
							type="email"
							value={email ?? ''}
							readOnly
							disabled
							className="bg-muted/50 text-muted-foreground cursor-not-allowed"
						/>
					</div>

					{/* Password - readonly, masked */}
					<div className="flex flex-col gap-1.5">
						<label className="text-sm font-medium" htmlFor="settings-password">
							Пароль
						</label>
						<Input
							id="settings-password"
							type="password"
							value="••••••••"
							readOnly
							disabled
							className="bg-muted/50 text-muted-foreground cursor-not-allowed"
						/>
					</div>

					{/* Public ID - editable */}
					<div className="flex flex-col gap-1.5">
						<label className="text-sm font-medium" htmlFor="settings-publicId">
							Публичный ID
						</label>
						<Input
							id="settings-publicId"
							value={publicIdValue}
							onChange={(e) => setPublicIdValue(e.target.value)}
							placeholder="cosmic.nebula.42"
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
						<Input
							id="settings-name"
							value={nameValue}
							onChange={(e) => setNameValue(e.target.value)}
							placeholder="Ваше имя"
						/>
					</div>

					{error && <p className="text-sm text-destructive">{error}</p>}

					<Button type="submit" disabled={isPending}>
						{isPending ? 'Сохранение...' : 'Сохранить'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
