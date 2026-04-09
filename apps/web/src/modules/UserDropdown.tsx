import { useAuthActions } from '@convex-dev/auth/react';
import {
	Sun,
	Moon,
	Monitor,
	Settings,
	LogOut,
	Copy,
	Check,
} from 'lucide-react';
import { useTheme } from '../lib/theme';
import type { Theme } from '../lib/theme';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';
import { useState } from 'react';

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
	const [copied, setCopied] = useState(false);

	const handleCopyId = () => {
		navigator.clipboard.writeText(publicId);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-7 px-1.5 gap-1.5">
					<span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
						{initial}
					</span>
					<span className="text-xs font-medium text-foreground max-w-24 truncate">
						{name}
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="start">
				{/* User info */}
				<DropdownMenuLabel>
					<p className="font-semibold truncate">{name}</p>
					<div className="flex items-center gap-2">
						<p className="text-muted-foreground truncate">@{publicId}</p>
						<button
							onClick={handleCopyId}
							className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
							title="Скопировать ID"
						>
							{copied ? <Check size={14} /> : <Copy size={14} />}
						</button>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />

				{/* Theme */}
				<div className="px-2 py-2">
					<div className="flex gap-1">
						{THEMES.map((t) => (
							<DropdownMenuItem
								key={t.value}
								onClick={() => setTheme(t.value)}
								className={`flex-1 flex-col items-center justify-center py-2 gap-1 ${
									theme === t.value ? 'bg-accent text-accent-foreground' : ''
								}`}
								title={t.label}
							>
								{t.icon}
							</DropdownMenuItem>
						))}
					</div>
				</div>
				<DropdownMenuSeparator />

				{/* Settings */}
				<DropdownMenuItem onClick={onOpenSettings}>
					<Settings size={14} className="mr-2" />
					Настройки
				</DropdownMenuItem>

				{/* Sign out */}
				<DropdownMenuItem onClick={() => signOut()}>
					<LogOut size={14} className="mr-2" />
					Выйти
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
