import { query } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';

export const me = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) return null;
		return ctx.db.get(userId);
	},
});

export const list = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) return [];
		const all = await ctx.db.query('users').collect();
		return all.filter((u) => u._id !== userId);
	},
});

export const findByPublicId = query({
	args: { publicId: v.string() },
	handler: async (ctx, { publicId }) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) return null;
		const found = await ctx.db
			.query('users')
			.withIndex('publicId', (q) => q.eq('publicId', publicId))
			.first();
		if (!found || found._id === userId) return null;
		return found;
	},
});

export const search = query({
	args: { query: v.string() },
	handler: async (ctx, { query: q }) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) return [];
		if (q.trim().length === 0) return [];
		const lower = q.toLowerCase();
		const all = await ctx.db.query('users').collect();
		return all.filter((u) => {
			if (u._id === userId) return false;
			const name = (u.name ?? '').toLowerCase();
			const publicId = (u.publicId ?? '').toLowerCase();
			return name.includes(lower) || publicId.includes(lower);
		});
	},
});
