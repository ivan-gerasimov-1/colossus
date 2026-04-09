import { convexAuth } from '@convex-dev/auth/server';
import { Password } from '@convex-dev/auth/providers/Password';
import Resend from '@auth/core/providers/resend';
import { generateUniquePublicId } from './utils';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [
		Password,
		Resend({}),
		// 	{
		// 	from:
		// 		process.env.RESEND_FROM_EMAIL || 'noreply@codename-one.gerasimov.dev',
		// }
	],
	callbacks: {
		async createOrUpdateUser(ctx, args) {
			const existingUser = await ctx.db
				.query('users')
				.filter((q) => q.eq(q.field('email'), args.profile.email))
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
