import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { SendHorizonal } from 'lucide-react';

type Props = {
	conversationId: string;
};

export default function MessageInput({ conversationId }: Props) {
	const send = useMutation(api.messages.send);
	const [text, setText] = useState('');
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = text.trim();
		if (!trimmed || loading) return;

		setLoading(true);
		try {
			await send({ conversationId: conversationId as never, text: trimmed });
			setText('');
		} finally {
			setLoading(false);
		}
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e as unknown as React.FormEvent);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="px-4 py-3 border-t shrink-0">
			<div className="flex items-end gap-2 rounded-md border bg-background px-3 py-2 focus-within:ring-[3px]">
				<textarea
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={handleKeyDown}
					rows={1}
					placeholder="Напиши сообщение..."
					className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground resize-none outline-none leading-5 max-h-32 min-h-[20px]"
				/>
				<button
					type="submit"
					disabled={!text.trim() || loading}
					className="text-foreground disabled:text-muted-foreground hover:text-foreground/70 transition-colors mb-0.5"
				>
					<SendHorizonal size={16} />
				</button>
			</div>
		</form>
	);
}
