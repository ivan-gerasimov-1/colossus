import { useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '../../convex/_generated/api';
import { Plus, LogOut, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../lib/theme';
import type { Theme } from '../lib/theme';

type Props = {
	selectedId: string | null;
	onSelect: (id: string) => void;
	onNewDm: () => void;
	className?: string;
};

const THEME_CYCLE: Theme[] = ['system', 'light', 'dark'];

function ThemeIcon({ theme }: { theme: Theme }) {
	if (theme === 'light') return <Sun size={14} />;
	if (theme === 'dark') return <Moon size={14} />;
	return <Monitor size={14} />;
}

export default function ConversationList({
	selectedId,
	onSelect,
	onNewDm,
	className = '',
}: Props) {
	const { signOut } = useAuthActions();
	const { theme, setTheme } = useTheme();
	const me = useQuery(api.users.me);
	const conversations = useQuery(api.conversations.listMine);

	function cycleTheme() {
		const idx = THEME_CYCLE.indexOf(theme);
		setTheme(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]);
	}

	return (
		<aside className={`flex flex-col border-r bg-background ${className}`}>
			<div className="px-4 h-14 border-b flex items-center shrink-0">
				<span className="font-semibold text-sm">Сообщения</span>
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
					const name = conv.other?.name ?? conv.other?.email ?? 'Без имени';
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

			<div className="px-4 py-3 border-t flex items-center gap-2 shrink-0">
				<span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
					{(me?.name ?? me?.email ?? '?').charAt(0).toUpperCase()}
				</span>
				<div className="flex-1 min-w-0">
					<p className="text-xs font-medium truncate">
						{me?.name ?? me?.email ?? '...'}
					</p>
					<p className="text-xs text-muted-foreground truncate">{me?.email}</p>
				</div>
				<button
					onClick={cycleTheme}
					className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
					title={`Тема: ${theme}`}
				>
					<ThemeIcon theme={theme} />
				</button>
				<button
					onClick={() => signOut()}
					className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
					title="Выйти"
				>
					<LogOut size={14} />
				</button>
			</div>
		</aside>
	);
}
