import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useConvexMutation } from '@convex-dev/react-query';
import { api } from '../../convex/_generated/api';
import { SendHorizonal } from 'lucide-react';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';

type Props = {
	conversationId: string;
};

export default function MessageInput({ conversationId }: Props) {
	const { mutate: send, isPending } = useMutation({
		mutationFn: useConvexMutation(api.messages.send),
	});
	const [text, setText] = useState('');

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = text.trim();
		if (!trimmed || isPending) return;

		send({ conversationId: conversationId as never, text: trimmed });
		setText('');
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
				<Textarea
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={handleKeyDown}
					rows={1}
					placeholder="Напиши сообщение..."
					className="flex-1 resize-none max-h-32 border-0 shadow-none bg-transparent focus-visible:ring-0"
				/>
				<Button
					type="submit"
					variant="ghost"
					size="icon"
					disabled={!text.trim() || isPending}
					className="mb-0.5"
				>
					<SendHorizonal size={16} />
				</Button>
			</div>
		</form>
	);
}
