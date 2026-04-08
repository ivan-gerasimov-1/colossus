import { mutation } from './_generated/server';
import { generateUniquePublicId } from './utils';

export const migratePublicIds = mutation({
	args: {},
	handler: async (ctx) => {
		const users = await ctx.db.query('users').collect();
		let migrated = 0;

		for (const user of users) {
			if (!user.publicId) {
				const publicId = await generateUniquePublicId(ctx);
				await ctx.db.patch(user._id, { publicId });
				migrated++;
			}
		}

		return { migrated, total: users.length };
	},
});
