import { useConvexAuth } from 'convex/react';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import ThemeProvider from './lib/ThemeProvider';

function Inner() {
	const { isAuthenticated, isLoading } = useConvexAuth();

	if (isLoading) {
		return (
			<div className="h-screen flex items-center justify-center text-muted-foreground text-sm">
				Загрузка...
			</div>
		);
	}

	return isAuthenticated ? <ChatPage /> : <AuthPage />;
}

export default function App() {
	return (
		<ThemeProvider>
			<Inner />
		</ThemeProvider>
	);
}
