import { useConvexAuth } from 'convex/react';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';

export default function App() {
	const { isAuthenticated, isLoading } = useConvexAuth();

	if (isLoading) {
		return (
			<div className="h-screen flex items-center justify-center text-slate-400 text-sm">
				Загрузка...
			</div>
		);
	}

	return isAuthenticated ? <ChatPage /> : <AuthPage />;
}
