import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  conversations: defineTable({
    type: v.union(v.literal("dm"), v.literal("group")),
    participantIds: v.array(v.id("users")),
    createdAt: v.number(),
  }).index("by_participant", ["participantIds"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    authorId: v.id("users"),
    text: v.string(),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId", "createdAt"]),
});
