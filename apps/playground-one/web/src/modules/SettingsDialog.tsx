import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useConvexMutation, useConvexQuery } from '@convex-dev/react-query';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '../../convex/_generated/api';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Upload, CheckCircle2, AlertCircle, Mail } from 'lucide-react';

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
	const { signIn } = useAuthActions();
	const [nameValue, setNameValue] = useState(name ?? '');
	const [publicIdValue, setPublicIdValue] = useState(publicId);
	const [publicIdError, setPublicIdError] = useState<string | null>(null);
	const [cooldownRemaining, setCooldownRemaining] = useState(0);

	const hasPublicIdChanges = publicIdValue !== publicId;
	const hasNameChanges = nameValue !== (name ?? '');

	const { mutate: updatePublicId, isPending: isSavingPublicId } = useMutation({
		mutationFn: useConvexMutation(api.users.updateProfile),
	});

	const { mutate: updateName, isPending: isSavingName } = useMutation({
		mutationFn: useConvexMutation(api.users.updateProfile),
	});

	const isEmailVerified = useConvexQuery(api.users.isEmailVerified, {});

	// Cooldown logic
	useEffect(() => {
		const lastSent = localStorage.getItem('lastEmailVerificationSent');
		if (lastSent) {
			const elapsed = Date.now() - parseInt(lastSent, 10);
			const remaining = Math.max(0, 60 - Math.floor(elapsed / 1000));
			setCooldownRemaining(remaining);
		}
	}, []);

	useEffect(() => {
		if (cooldownRemaining > 0) {
			const timer = setTimeout(() => {
				setCooldownRemaining((prev) => Math.max(0, prev - 1));
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [cooldownRemaining]);

	const handleSendVerification = async () => {
		if (!email) return;

		const formData = new FormData();
		formData.append('email', email);
		formData.append('redirectTo', `${window.location.origin}/settings`);

		try {
			await signIn('resend', formData);
			localStorage.setItem('lastEmailVerificationSent', Date.now().toString());
			setCooldownRemaining(60);
		} catch (error) {
			console.error('Failed to send verification email:', error);
		}
	};

	function handleSavePublicId() {
		setPublicIdError(null);

		// Клиентская валидация
		if (publicIdValue.length < 3) {
			setPublicIdError('Минимум 3 символа');
			return;
		}
		if (!/^[a-zA-Z0-9.-]+$/.test(publicIdValue)) {
			setPublicIdError('Разрешены только буквы, цифры, дефисы и точки');
			return;
		}

		updatePublicId({ publicId: publicIdValue });
	}

	function handleSaveName() {
		updateName({ name: nameValue || undefined });
	}

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>Настройки</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-3">
					{/* Email - readonly with verification status */}
					<div className="flex flex-col gap-1.5">
						<label className="text-sm font-medium" htmlFor="settings-email">
							Почта
						</label>
						<div className="relative">
							<Input
								id="settings-email"
								type="email"
								value={email ?? ''}
								readOnly
								disabled
								className="bg-muted/50 text-muted-foreground cursor-not-allowed pr-10"
							/>
							{isEmailVerified !== undefined && (
								<div className="absolute right-2 top-1/2 -translate-y-1/2">
									{isEmailVerified ? (
										<CheckCircle2 className="h-5 w-5 text-green-500" />
									) : (
										<AlertCircle className="h-5 w-5 text-yellow-500" />
									)}
								</div>
							)}
						</div>
						{!isEmailVerified && email && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleSendVerification}
								disabled={cooldownRemaining > 0}
								className="w-fit"
							>
								<Mail className="h-4 w-4 mr-2" />
								{cooldownRemaining > 0
									? `Отправить повторно (${cooldownRemaining}s)`
									: 'Подтвердить email'}
							</Button>
						)}
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
						<div className="relative">
							<Input
								id="settings-publicId"
								value={publicIdValue}
								onChange={(e) => setPublicIdValue(e.target.value)}
								placeholder="cosmic.nebula.42"
								className="pr-10"
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								disabled={isSavingPublicId || !hasPublicIdChanges}
								onClick={handleSavePublicId}
								className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
							>
								<Upload size={14} />
							</Button>
						</div>
						{publicIdError && (
							<p className="text-sm text-destructive">{publicIdError}</p>
						)}
						<p className="text-xs text-muted-foreground">
							Минимум 3 символа, только буквы, цифры, дефисы и точки
						</p>
					</div>

					{/* Name - editable */}
					<div className="flex flex-col gap-1.5">
						<label className="text-sm font-medium" htmlFor="settings-name">
							Имя
						</label>
						<div className="relative">
							<Input
								id="settings-name"
								value={nameValue}
								onChange={(e) => setNameValue(e.target.value)}
								placeholder="Ваше имя"
								className="pr-10"
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								disabled={isSavingName || !hasNameChanges}
								onClick={handleSaveName}
								className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
							>
								<Upload size={14} />
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
