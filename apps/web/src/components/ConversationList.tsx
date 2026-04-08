import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '../../convex/_generated/api';
import { Plus } from 'lucide-react';
import SettingsDialog from './SettingsDialog';
import UserDropdown from './UserDropdown';

type Props = {
	selectedId: string | null;
	onSelect: (id: string) => void;
	onNewDm: () => void;
	className?: string;
};

export default function ConversationList({
	selectedId,
	onSelect,
	onNewDm,
	className = '',
}: Props) {
	const { data: me } = useQuery(convexQuery(api.users.me));
	const { data: conversations } = useQuery(
		convexQuery(api.conversations.listMine),
	);
	const [showSettings, setShowSettings] = useState(false);

	const displayName = me?.name ?? me?.publicId ?? '...';
	const initial = displayName.charAt(0).toUpperCase();

	return (
		<>
			<aside className={`flex flex-col border-r bg-background ${className}`}>
				<div className="px-3 h-14 border-b flex items-center shrink-0">
					<UserDropdown
						name={displayName}
						publicId={me?.publicId ?? ''}
						initial={initial}
						onOpenSettings={() => setShowSettings(true)}
					/>
					<button
						onClick={onNewDm}
						className="ml-auto inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
						title="Новый чат"
					>
						<Plus size={16} />
					</button>
				</div>

				<ul className="flex-1 overflow-y-auto py-1">
					{conversations === undefined && (
						<li className="px-4 py-3 text-xs text-muted-foreground">
							Загрузка...
						</li>
					)}
					{conversations?.length === 0 && (
						<li className="px-4 py-3 text-xs text-muted-foreground">
							Нет чатов — нажми +
						</li>
					)}
					{conversations?.map((conv) => {
						const name =
							conv.other?.name ?? conv.other?.publicId ?? 'Без имени';
						const isActive = selectedId === conv._id;
						return (
							<li key={conv._id}>
								<button
									onClick={() => onSelect(conv._id)}
									className={`w-full text-left px-3 py-2 mx-1 rounded-md flex items-center gap-3 transition-colors text-sm ${
										isActive
											? 'bg-accent text-accent-foreground font-medium'
											: 'hover:bg-accent/50 text-foreground'
									}`}
									style={{ width: 'calc(100% - 0.5rem)' }}
								>
									<span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
										{name.charAt(0).toUpperCase()}
									</span>
									<span className="truncate">{name}</span>
								</button>
							</li>
						);
					})}
				</ul>
			</aside>

			{showSettings && me && (
				<SettingsDialog
					onClose={() => setShowSettings(false)}
					email={me.email}
					name={me.name}
					publicId={me.publicId}
				/>
			)}
		</>
	);
}
