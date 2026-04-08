import { useEffect, useRef, useState } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { Sun, Moon, Monitor, ChevronUp, Settings, LogOut } from 'lucide-react';
import { useTheme } from '../lib/theme';
import type { Theme } from '../lib/theme';

const THEMES: { value: Theme; label: string; icon: React.ReactNode }[] = [
	{ value: 'system', label: 'Системная', icon: <Monitor size={14} /> },
	{ value: 'light', label: 'Светлая', icon: <Sun size={14} /> },
	{ value: 'dark', label: 'Тёмная', icon: <Moon size={14} /> },
];

type Props = {
	name: string;
	publicId: string;
	initial: string;
	onOpenSettings: () => void;
};

export default function UserDropdown({
	name,
	publicId,
	initial,
	onOpenSettings,
}: Props) {
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
						<p className="text-xs text-muted-foreground truncate">
							@{publicId}
						</p>
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
								</button>
							))}
						</div>
					</div>

					{/* Settings */}
					<button
						onClick={() => {
							setOpen(false);
							onOpenSettings();
						}}
						className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
					>
						<Settings size={14} />
						Настройки
					</button>

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
