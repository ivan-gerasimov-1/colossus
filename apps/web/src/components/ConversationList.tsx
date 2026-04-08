import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '../../convex/_generated/api';
import { Plus, LogOut, Sun, Moon, Monitor, ChevronUp } from 'lucide-react';
import { useTheme } from '../lib/theme';
import type { Theme } from '../lib/theme';

type Props = {
	selectedId: string | null;
	onSelect: (id: string) => void;
	onNewDm: () => void;
	className?: string;
};

const THEMES: { value: Theme; label: string; icon: React.ReactNode }[] = [
	{ value: 'system', label: 'Системная', icon: <Monitor size={14} /> },
	{ value: 'light', label: 'Светлая', icon: <Sun size={14} /> },
	{ value: 'dark', label: 'Тёмная', icon: <Moon size={14} /> },
];

type UserDropdownProps = {
	name: string;
	email: string | undefined;
	initial: string;
};

function UserDropdown({ name, email, initial }: UserDropdownProps) {
	const { signOut } = useAuthActions();
	const { theme, setTheme } = useTheme();
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, [open]);

	return (
		<div ref={ref} className="relative">
			<button
				onClick={() => setOpen((v) => !v)}
				className="inline-flex items-center gap-1.5 h-7 px-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
			>
				<span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
					{initial}
				</span>
				<span className="text-xs font-medium text-foreground max-w-24 truncate">
					{name}
				</span>
				<ChevronUp
					size={12}
					className={`transition-transform ${open ? '' : 'rotate-180'}`}
				/>
			</button>

			{open && (
				<div className="absolute top-full left-0 mt-1.5 w-56 rounded-lg border bg-card shadow-md z-10 py-1">
					{/* User info */}
					<div className="px-3 py-2.5 border-b">
						<p className="text-xs font-semibold truncate">{name}</p>
						{email && (
							<p className="text-xs text-muted-foreground truncate">{email}</p>
						)}
					</div>

					{/* Theme */}
					<div className="px-3 py-2 border-b">
						<div className="flex gap-1">
							{THEMES.map((t) => (
								<button
									key={t.value}
									onClick={() => setTheme(t.value)}
									className={`flex-1 inline-flex flex-col items-center gap-1 py-1.5 rounded-md text-xs transition-colors ${
										theme === t.value
											? 'bg-accent text-accent-foreground font-medium'
											: 'hover:bg-accent/50 text-muted-foreground'
									}`}
									title={t.label}
								>
									{t.icon}
									<span>{t.label}</span>
								</button>
							))}
						</div>
					</div>

					{/* Sign out */}
					<button
						onClick={() => {
							setOpen(false);
							signOut();
						}}
						className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
					>
						<LogOut size={14} />
						Выйти
					</button>
				</div>
			)}
		</div>
	);
}

export default function ConversationList({
	selectedId,
	onSelect,
	onNewDm,
	className = '',
}: Props) {
	const me = useQuery(api.users.me);
	const conversations = useQuery(api.conversations.listMine);

	const displayName = me?.name ?? me?.email ?? '...';
	const initial = displayName.charAt(0).toUpperCase();

	return (
		<aside className={`flex flex-col border-r bg-background ${className}`}>
			<div className="px-3 h-14 border-b flex items-center shrink-0">
				<UserDropdown name={displayName} email={me?.email} initial={initial} />
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
		</aside>
	);
}
