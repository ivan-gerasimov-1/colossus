import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { generateUniquePublicId } from './utils';
import { encrypt, validateMasterKey } from './crypto';

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

export const removePlaintextFromMessages = mutation({
	args: {},
	handler: async (ctx) => {
		const messages = await ctx.db.query('messages').collect();
		let migrated = 0;

		for (const message of messages) {
			// Replace document without text field
			await ctx.db.replace(message._id, {
				conversationId: message.conversationId,
				authorId: message.authorId,
				encryptedText: message.encryptedText,
				createdAt: message.createdAt,
			});
			migrated++;
		}

		return { migrated, total: messages.length };
	},
});
