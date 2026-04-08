import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
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
	onSelect: (conversationId: string) => void;
};

export default function NewDmDialog({ onClose, onSelect }: Props) {
	const [publicId, setPublicId] = useState('');
	const [submitted, setSubmitted] = useState(false);

	const { data: user } = useQuery(
		convexQuery(
			api.users.findByPublicId,
			submitted && publicId.trim().length > 0
				? { publicId: publicId.trim() }
				: 'skip',
		),
	);
	const { mutateAsync: getOrCreate, isPending } = useMutation({
		mutationFn: useConvexMutation(api.conversations.getOrCreate),
	});

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!publicId.trim()) return;
		setSubmitted(true);
	}

	async function handleStartChat() {
		if (!user) return;
		const conversationId = await getOrCreate({
			otherUserId: user._id as never,
		});
		onSelect(conversationId as string);
		onClose();
	}

	function handlePublicIdChange(value: string) {
		setPublicId(value);
		setSubmitted(false);
	}

	const notFound = submitted && user === null;
	const found = submitted && user !== null && user !== undefined;

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>Новое сообщение</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="flex flex-col gap-3">
					<div className="flex flex-col gap-1.5">
						<label className="text-sm font-medium" htmlFor="dm-publicId">
							Публичный ID
						</label>
						<Input
							id="dm-publicId"
							autoFocus
							value={publicId}
							onChange={(e) => handlePublicIdChange(e.target.value)}
							placeholder="cosmic-nebula-42"
						/>
					</div>

					{notFound && (
						<p className="text-sm text-destructive">Пользователь не найден</p>
					)}

					{found && (
						<div className="flex items-center gap-3 rounded-md border bg-muted/50 px-3 py-2.5">
							<span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
								{(user.name ?? user.publicId ?? '?').charAt(0).toUpperCase()}
							</span>
							<div className="min-w-0">
								<p className="text-sm font-medium truncate">
									{user.name ?? user.publicId}
								</p>
								{user.name && (
									<p className="text-xs text-muted-foreground truncate">
										@{user.publicId}
									</p>
								)}
							</div>
						</div>
					)}

					{!found ? (
						<Button type="submit" disabled={!publicId.trim()}>
							Найти
						</Button>
					) : (
						<Button
							type="button"
							disabled={isPending}
							onClick={handleStartChat}
						>
							{isPending ? 'Создание...' : 'Начать диалог'}
						</Button>
					)}
				</form>
			</DialogContent>
		</Dialog>
	);
}
