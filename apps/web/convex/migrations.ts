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

export const migrateMessageEncryption = mutation({
	args: { masterKey: v.string() },
	handler: async (ctx, { masterKey }) => {
		if (!validateMasterKey(masterKey)) {
			throw new Error('Invalid master key format');
		}

		const messages = await ctx.db.query('messages').collect();
		let migrated = 0;
		let skipped = 0;

		for (const message of messages) {
			// Skip if already encrypted
			if (message.encryptedText) {
				skipped++;
				continue;
			}

			// Encrypt the message text
			const encryptedText = await encrypt(message.text, masterKey);

			// Update with encrypted text
			await ctx.db.patch(message._id, { encryptedText });

			migrated++;
		}

		return { migrated, skipped, total: messages.length };
	},
});
