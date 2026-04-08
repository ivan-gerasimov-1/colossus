import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { api } from '../../convex/_generated/api';
import { X } from 'lucide-react';

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
	const { mutate: getOrCreate, isPending } = useMutation({
		mutationFn: useConvexMutation(api.conversations.getOrCreate),
	});

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!publicId.trim()) return;
		setSubmitted(true);
	}

	async function handleStartChat() {
		if (!user) return;
		getOrCreate({ otherUserId: user._id as never });
		onSelect(user._id as string);
		onClose();
	}

	function handlePublicIdChange(value: string) {
		setPublicId(value);
		setSubmitted(false);
	}

	const notFound = submitted && user === null;
	const found = submitted && user !== null && user !== undefined;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div className="bg-card border rounded-lg shadow-lg w-full max-w-sm mx-4">
				<div className="flex items-center justify-between px-4 py-3 border-b">
					<h2 className="font-semibold text-sm">Новое сообщение</h2>
					<button
						onClick={onClose}
						className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent transition-colors text-muted-foreground"
					>
						<X size={16} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="px-4 py-4 flex flex-col gap-3">
					<div className="flex flex-col gap-1.5">
						<label className="text-sm font-medium" htmlFor="dm-publicId">
							Публичный ID
						</label>
						<input
							id="dm-publicId"
							autoFocus
							type="text"
							value={publicId}
							onChange={(e) => handlePublicIdChange(e.target.value)}
							placeholder="cosmic-nebula-42"
							className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-[3px] placeholder:text-muted-foreground"
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
						<button
							type="submit"
							disabled={!publicId.trim()}
							className="inline-flex items-center justify-center h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium shadow-xs hover:bg-primary/90 disabled:opacity-50 transition-colors"
						>
							Найти
						</button>
					) : (
						<button
							type="button"
							disabled={isPending}
							onClick={handleStartChat}
							className="inline-flex items-center justify-center h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium shadow-xs hover:bg-primary/90 disabled:opacity-50 transition-colors"
						>
							{isPending ? 'Создание...' : 'Начать диалог'}
						</button>
					)}
				</form>
			</div>
		</div>
	);
}
