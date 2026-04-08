import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import ConversationList from '../components/ConversationList';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import NewDmDialog from '../components/NewDmDialog';
import { MessageSquareDashed, ArrowLeft } from 'lucide-react';

type MobileView = 'list' | 'chat';

export default function ChatPage() {
	const me = useQuery(api.users.me);
	const conversations = useQuery(api.conversations.listMine);
	const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
	const [showNewDm, setShowNewDm] = useState(false);
	const [mobileView, setMobileView] = useState<MobileView>('list');

	function handleSelectConversation(id: string) {
		setSelectedConvId(id);
		setMobileView('chat');
	}

	const selectedConv = conversations?.find((c) => c._id === selectedConvId);
	const otherName =
		selectedConv?.other?.name ?? selectedConv?.other?.email ?? 'Чат';

	return (
		<div className="h-screen flex overflow-hidden bg-background">
			{/* Sidebar — always visible on md+, conditionally on mobile */}
			<ConversationList
				selectedId={selectedConvId}
				onSelect={handleSelectConversation}
				onNewDm={() => setShowNewDm(true)}
				className={`
          w-full md:w-72 md:flex shrink-0
          ${mobileView === 'list' ? 'flex' : 'hidden'}
        `}
			/>

			{/* Chat area */}
			<main
				className={`
          flex-1 flex flex-col overflow-hidden
          ${mobileView === 'chat' ? 'flex' : 'hidden md:flex'}
        `}
			>
				{/* Header — visible on mobile only when chat is open */}
				{selectedConvId && (
					<header className="h-14 px-4 border-b flex items-center gap-3 shrink-0 md:border-b">
						<button
							onClick={() => setMobileView('list')}
							className="md:hidden inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent transition-colors text-muted-foreground"
						>
							<ArrowLeft size={16} />
						</button>
						<span className="font-semibold text-sm truncate">{otherName}</span>
					</header>
				)}

				{selectedConvId && me ? (
					<>
						<MessageList conversationId={selectedConvId} myId={me._id} />
						<MessageInput conversationId={selectedConvId} />
					</>
				) : (
					<div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
						<MessageSquareDashed size={40} strokeWidth={1.5} />
						<p className="text-sm">Выбери чат или начни новый</p>
					</div>
				)}
			</main>

			{showNewDm && (
				<NewDmDialog
					onClose={() => setShowNewDm(false)}
					onSelect={handleSelectConversation}
				/>
			)}
		</div>
	);
}
