import { useState } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

type Mode = 'signIn' | 'signUp';

export default function AuthPage() {
	const { signIn } = useAuthActions();
	const [mode, setMode] = useState<Mode>('signIn');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setLoading(true);

		const data = new FormData(e.currentTarget);

		try {
			await signIn('password', {
				email: data.get('email') as string,
				password: data.get('password') as string,
				flow: mode,
				...(mode === 'signUp' ? { name: data.get('name') as string } : {}),
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Что-то пошло не так');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
			<div className="w-full max-w-sm bg-card border rounded-lg shadow-sm p-8">
				<h1 className="text-2xl font-semibold tracking-tight mb-1">
					{mode === 'signIn' ? 'Войти' : 'Создать аккаунт'}
				</h1>
				<p className="text-sm text-muted-foreground mb-6">
					{mode === 'signIn' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
					<button
						type="button"
						className="underline underline-offset-4 hover:text-foreground transition-colors"
						onClick={() => {
							setMode(mode === 'signIn' ? 'signUp' : 'signIn');
							setError(null);
						}}
					>
						{mode === 'signIn' ? 'Зарегистрироваться' : 'Войти'}
					</button>
				</p>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					{mode === 'signUp' && (
						<div className="flex flex-col gap-1.5">
							<label className="text-sm font-medium" htmlFor="name">
								Имя
							</label>
							<Input
								id="name"
								name="name"
								required
								autoComplete="name"
								placeholder="Иван Иванов"
							/>
						</div>
					)}

					<div className="flex flex-col gap-1.5">
						<label className="text-sm font-medium" htmlFor="email">
							Email
						</label>
						<Input
							id="email"
							name="email"
							type="email"
							required
							autoComplete="email"
							placeholder="you@example.com"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<label className="text-sm font-medium" htmlFor="password">
							Пароль
						</label>
						<Input
							id="password"
							name="password"
							type="password"
							required
							autoComplete={
								mode === 'signIn' ? 'current-password' : 'new-password'
							}
							placeholder="••••••••"
						/>
					</div>

					{error && (
						<p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
							{error}
						</p>
					)}

					<Button type="submit" disabled={loading} className="mt-1">
						{loading
							? 'Загрузка...'
							: mode === 'signIn'
								? 'Войти'
								: 'Зарегистрироваться'}
					</Button>
				</form>
			</div>
		</div>
	);
}
