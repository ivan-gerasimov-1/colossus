import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { Doc } from './_generated/dataModel';

export async function requireVerifiedUser(ctx: any) {
	const userId = await getAuthUserId(ctx);
	if (userId === null) {
		throw new Error('Not authenticated');
	}
	const user = await ctx.db.get(userId);
	if (!user) {
		throw new Error('User not found');
	}
	if (user.emailVerificationTime === undefined) {
		throw new Error('Email verification required');
	}
	return userId;
}

export function toPublicUser(user: Doc<'users'>) {
	return {
		_id: user._id,
		publicId: user.publicId,
		name: user.name,
		image: user.image,
	};
}

function toMeUser(user: Doc<'users'>) {
	return {
		_id: user._id,
		publicId: user.publicId,
		name: user.name,
		image: user.image,
		email: user.email,
		phone: user.phone,
	};
}

export const me = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) return null;
		const user = await ctx.db.get(userId);
		if (!user) return null;
		return toMeUser(user);
	},
});

export const list = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) return [];
		const all = await ctx.db.query('users').collect();
		return all.filter((u) => u._id !== userId).map(toPublicUser);
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
		return toPublicUser(found);
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
		return all
			.filter((u) => {
				if (u._id === userId) return false;
				const name = (u.name ?? '').toLowerCase();
				const publicId = (u.publicId ?? '').toLowerCase();
				return name.includes(lower) || publicId.includes(lower);
			})
			.map(toPublicUser);
	},
});

export const updateProfile = mutation({
	args: {
		name: v.optional(v.union(v.null(), v.string())),
		publicId: v.optional(v.string()),
	},
	handler: async (ctx, { name, publicId }) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) throw new Error('Not authenticated');

		if (publicId !== undefined) {
			// Валидация формата publicId: буквы, цифры, дефисы, точки, мин. длина 3
			if (publicId.length < 3) {
				throw new Error('Public ID must be at least 3 characters');
			}
			if (!/^[a-zA-Z0-9.-]+$/.test(publicId)) {
				throw new Error(
					'Public ID can only contain letters, numbers, hyphens, and dots',
				);
			}

			// Проверка уникальности publicId
			const existing = await ctx.db
				.query('users')
				.withIndex('publicId', (q) => q.eq('publicId', publicId))
				.first();
			if (existing && existing._id !== userId) {
				throw new Error('Public ID is already taken');
			}
		}

		// Обновление
		await ctx.db.patch(userId, {
			...(name !== undefined &&
				(name === null ? { name: undefined } : { name })),
			...(publicId !== undefined && { publicId }),
		});

		return null;
	},
});

export const isEmailVerified = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) return false;
		const user = await ctx.db.get(userId);
		return user?.emailVerificationTime !== undefined;
	},
});
