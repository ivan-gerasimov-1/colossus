import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { toPublicUser } from './users';

export const listMine = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) return [];

		const all = await ctx.db.query('conversations').collect();
		const mine = all.filter((c) => c.participantIds.includes(userId));

		return Promise.all(
			mine.map(async (conv) => {
				const otherId = conv.participantIds.find((id) => id !== userId);
				const other = otherId !== undefined ? await ctx.db.get(otherId) : null;
				return { ...conv, other: other ? toPublicUser(other) : null };
			}),
		);
	},
});

export const getOrCreate = mutation({
	args: { otherUserId: v.id('users') },
	handler: async (ctx, { otherUserId }) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) throw new Error('Not authenticated');

		if (otherUserId === userId) {
			throw new Error('Cannot create conversation with yourself');
		}

		const all = await ctx.db.query('conversations').collect();
		const existing = all.find(
			(c) =>
				c.type === 'dm' &&
				c.participantIds.includes(userId) &&
				c.participantIds.includes(otherUserId),
		);
		if (existing) return existing._id;

		return ctx.db.insert('conversations', {
			type: 'dm',
			participantIds: [userId, otherUserId],
			createdAt: Date.now(),
		});
	},
});
