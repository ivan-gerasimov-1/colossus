import { useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

type Props = {
	conversationId: string;
	myId: string;
};

function formatTime(ts: number) {
	return new Date(ts).toLocaleTimeString('ru', {
		hour: '2-digit',
		minute: '2-digit',
	});
}

export default function MessageList({ conversationId, myId }: Props) {
	const messages = useQuery(api.messages.list, {
		conversationId: conversationId as never,
	});
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	if (messages === undefined) {
		return (
			<div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
				Загрузка...
			</div>
		);
	}

	if (messages.length === 0) {
		return (
			<div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
				Пока нет сообщений. Напиши первым!
			</div>
		);
	}

	return (
		<div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
			{messages.map((msg) => {
				const isMe = msg.authorId === myId;
				const name = msg.author?.name ?? msg.author?.email ?? '?';
				return (
					<div
						key={msg._id}
						className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
					>
						{!isMe && (
							<div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
								{name.charAt(0).toUpperCase()}
							</div>
						)}
						<div
							className={`max-w-xs flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}
						>
							{!isMe && (
								<span className="text-xs text-muted-foreground px-1">
									{name}
								</span>
							)}
							<div
								className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
									isMe
										? 'bg-primary text-primary-foreground rounded-br-sm'
										: 'bg-muted text-foreground rounded-bl-sm'
								}`}
							>
								{msg.text}
							</div>
							<span className="text-xs text-muted-foreground px-1">
								{formatTime(msg.createdAt)}
							</span>
						</div>
					</div>
				);
			})}
			<div ref={bottomRef} />
		</div>
	);
}
