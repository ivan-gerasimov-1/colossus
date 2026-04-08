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

export const findByEmail = query({
	args: { email: v.string() },
	handler: async (ctx, { email }) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) return null;
		const all = await ctx.db.query('users').collect();
		const found = all.find(
			(u) =>
				u._id !== userId &&
				(u.email ?? '').toLowerCase() === email.toLowerCase().trim(),
		);
		return found ?? null;
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
			const email = (u.email ?? '').toLowerCase();
			return name.includes(lower) || email.includes(lower);
		});
	},
});
