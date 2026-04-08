import { convexAuth } from '@convex-dev/auth/server';
import { Password } from '@convex-dev/auth/providers/Password';
import { generateUniquePublicId } from './utils';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [Password],
	callbacks: {
		async createOrUpdateUser(ctx, args) {
			const existingUser = await ctx.db
				.query('users')
				.withIndex('email', (q) => q.eq('email', args.profile.email))
				.first();

			if (existingUser) {
				return existingUser._id;
			}

			const publicId = await generateUniquePublicId(ctx);
			const userId = await ctx.db.insert('users', {
				email: args.profile.email,
				name: args.profile.name,
				image: args.profile.picture,
				publicId,
			});

			return userId;
		},
	},
});
