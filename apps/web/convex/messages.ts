import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { encrypt, decrypt } from './crypto';

export const list = query({
	args: { conversationId: v.id('conversations') },
	handler: async (ctx, { conversationId }) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) return [];

		const msgs = await ctx.db
			.query('messages')
			.withIndex('by_conversation', (q) =>
				q.eq('conversationId', conversationId),
			)
			.order('asc')
			.take(100);

		const masterKey = process.env.ENCRYPTION_MASTER_KEY;
		if (!masterKey) {
			throw new Error('ENCRYPTION_MASTER_KEY not set');
		}

		return Promise.all(
			msgs.map(async (msg) => {
				const author = await ctx.db.get(msg.authorId);
				let text = msg.text;

				// Decrypt if encrypted
				if (msg.encryptedText) {
					try {
						text = await decrypt(msg.encryptedText, masterKey);
					} catch (e) {
						console.error('Failed to decrypt message:', e);
						text = '[Encrypted - decryption failed]';
					}
				}

				return { ...msg, author, text };
			}),
		);
	},
});

export const send = mutation({
	args: { conversationId: v.id('conversations'), text: v.string() },
	handler: async (ctx, { conversationId, text }) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) throw new Error('Not authenticated');

		const masterKey = process.env.ENCRYPTION_MASTER_KEY;
		if (!masterKey) {
			throw new Error('ENCRYPTION_MASTER_KEY not set');
		}

		const encryptedText = await encrypt(text, masterKey);

		await ctx.db.insert('messages', {
			conversationId,
			authorId: userId,
			text,
			encryptedText,
			createdAt: Date.now(),
		});
	},
});
