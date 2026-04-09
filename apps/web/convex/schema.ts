import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';

export default defineSchema({
	...authTables,
	users: defineTable({
		name: v.optional(v.string()),
		image: v.optional(v.string()),
		email: v.optional(v.string()),
		phone: v.optional(v.string()),
		phoneVerificationTime: v.optional(v.number()),
		isAnonymous: v.optional(v.boolean()),
		publicId: v.string(),
	})
		.index('email', ['email'])
		.index('phone', ['phone'])
		.index('publicId', ['publicId']),

	conversations: defineTable({
		type: v.union(v.literal('dm'), v.literal('group')),
		participantIds: v.array(v.id('users')),
		createdAt: v.number(),
	}).index('by_participant', ['participantIds']),

	messages: defineTable({
		conversationId: v.id('conversations'),
		authorId: v.id('users'),
		encryptedText: v.string(),
		createdAt: v.number(),
	}).index('by_conversation', ['conversationId', 'createdAt']),
});
