import { convexAuth } from '@convex-dev/auth/server';
import { Password } from '@convex-dev/auth/providers/Password';
import Resend from '@auth/core/providers/resend';
import { generateUniquePublicId } from './utils';
import { GenericMutationCtx } from 'convex/server';
import { DataModel } from './_generated/dataModel';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [
		Password,
		Resend({
			from: process.env.AUTH_RESEND_FROM,
		}),
	],
	callbacks: {
		async createOrUpdateUser(ctx: GenericMutationCtx<DataModel>, args) {
			const existingUser = await ctx.db
				.query('users')
				.withIndex('email', (q) => q.eq('email', args.profile.email))
				.first();

			if (existingUser) {
				throw new Error('Email already registered');
			}

			const publicId = await generateUniquePublicId(ctx);
			const userId = await ctx.db.insert('users', {
				email: args.profile.email,
				publicId,
				emailVerificationTime: args.profile.emailVerified
					? Date.now()
					: undefined,
			});

			return userId;
		},
	},
});
