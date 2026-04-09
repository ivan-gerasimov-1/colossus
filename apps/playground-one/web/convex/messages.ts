import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { encrypt, decrypt } from './crypto';
import { toPublicUser } from './users';

export const list = query({
	args: { conversationId: v.id('conversations') },
	handler: async (ctx, { conversationId }) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) return [];

		const conversation = await ctx.db.get(conversationId);
		if (!conversation || !conversation.participantIds.includes(userId)) {
			console.warn(
				`Unauthorized message list attempt: userId=${userId}, conversationId=${conversationId}`,
			);
			return [];
		}

		// TODO: Implement cursor-based pagination with cursor/limit params for scalable history loading
		// Current approach: take last 100 messages in desc order, then reverse for UI
		const msgs = await ctx.db
			.query('messages')
			.withIndex('by_conversation', (q) =>
				q.eq('conversationId', conversationId),
			)
			.order('desc')
			.take(100)
			.then((msgs) => msgs.reverse());

		const masterKey = process.env.ENCRYPTION_MASTER_KEY;
		if (!masterKey) {
			throw new Error('ENCRYPTION_MASTER_KEY not set');
		}

		return Promise.all(
			msgs.map(async (msg) => {
				const author = await ctx.db.get(msg.authorId);

				const text = await decrypt(msg.encryptedText, masterKey);

				return { ...msg, author: author ? toPublicUser(author) : null, text };
			}),
		);
	},
});

export const send = mutation({
	args: { conversationId: v.id('conversations'), text: v.string() },
	handler: async (ctx, { conversationId, text }) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) throw new Error('Not authenticated');

		const conversation = await ctx.db.get(conversationId);
		if (!conversation || !conversation.participantIds.includes(userId)) {
			console.warn(
				`Unauthorized message send attempt: userId=${userId}, conversationId=${conversationId}`,
			);
			return;
		}

		const masterKey = process.env.ENCRYPTION_MASTER_KEY;
		if (!masterKey) {
			throw new Error('ENCRYPTION_MASTER_KEY not set');
		}

		const encryptedText = await encrypt(text, masterKey);

		await ctx.db.insert('messages', {
			conversationId,
			authorId: userId,
			encryptedText,
			createdAt: Date.now(),
		});
	},
});
