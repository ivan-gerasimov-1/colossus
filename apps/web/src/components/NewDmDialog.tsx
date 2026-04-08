import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { X, Search } from 'lucide-react';

type Props = {
	onClose: () => void;
	onSelect: (conversationId: string) => void;
};

export default function NewDmDialog({ onClose, onSelect }: Props) {
	const [query, setQuery] = useState('');
	const users = useQuery(
		api.users.search,
		query.trim().length > 0 ? { query } : 'skip',
	);
	const getOrCreate = useMutation(api.conversations.getOrCreate);
	const [loading, setLoading] = useState(false);

	async function handleSelect(userId: string) {
		setLoading(true);
		try {
			const convId = await getOrCreate({ otherUserId: userId as never });
			onSelect(convId as string);
			onClose();
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
					<h2 className="font-semibold text-sm">Новое сообщение</h2>
					<button
						onClick={onClose}
						className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent transition-colors text-muted-foreground"
					>
						<X size={16} />
					</button>
				</div>

				<div className="px-4 py-3 border-b">
					<div className="flex items-center gap-2 rounded-md border bg-background px-3 h-9 focus-within:ring-[3px]">
						<Search size={14} className="text-muted-foreground shrink-0" />
						<input
							autoFocus
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Поиск по имени или email..."
							className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
						/>
					</div>
				</div>

				<ul className="max-h-64 overflow-y-auto py-1">
					{query.trim().length === 0 && (
						<li className="px-4 py-3 text-sm text-muted-foreground text-center">
							Начни вводить имя или email
						</li>
					)}
					{query.trim().length > 0 && users === undefined && (
						<li className="px-4 py-3 text-sm text-muted-foreground">
							Поиск...
						</li>
					)}
					{query.trim().length > 0 && users?.length === 0 && (
						<li className="px-4 py-3 text-sm text-muted-foreground">
							Никого не найдено
						</li>
					)}
					{users?.map((user) => {
						const name = user.name ?? user.email ?? 'Без имени';
						return (
							<li key={user._id}>
								<button
									disabled={loading}
									onClick={() => handleSelect(user._id)}
									className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors rounded-sm mx-0"
								>
									<span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
										{name.charAt(0).toUpperCase()}
									</span>
									<div className="min-w-0">
										<p className="text-sm font-medium truncate">{name}</p>
										{user.name && (
											<p className="text-xs text-muted-foreground truncate">
												{user.email}
											</p>
										)}
									</div>
								</button>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}
