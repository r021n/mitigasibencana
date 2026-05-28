import { sqliteTable, text, primaryKey, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  status: text("status", { enum: ["student", "teacher", "admin"] }).default("student").notNull(),
});

export const videos = sqliteTable("videos", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  youtubeLink: text("youtube_link").notNull(),
  category: text("category", { 
    enum: [
      "tanah longsor", 
      "angin puting beliung", 
      "gempa bumi", 
      "banjir", 
      "tsunami", 
      "letusan gunung berapi"
    ] 
  }).notNull(),
  status: text("status", { enum: ["draft", "publish"] }).default("draft").notNull(),
  
  // Analysis fields merged from youtubeAnalyses
  analysisStatus: text("analysis_status", { enum: ["pending", "processing", "completed", "failed"] }),
  progress: integer("progress").default(0).notNull(),
  progressMessage: text("progress_message").default("Belum dianalisis").notNull(),
  summary: text("summary"),
  improvementSuggestions: text("improvement_suggestions"),
  errorMessage: text("error_message"),
  analysisCreatedAt: integer("analysis_created_at"),
  analysisUpdatedAt: integer("analysis_updated_at"),
});

export const userVideos = sqliteTable("user_videos", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  videoId: text("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.videoId] }),
}));

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  videoId: text("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  guestName: text("guest_name"),
  content: text("content").notNull(),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
});

export const commentReplies = sqliteTable("comment_replies", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  commentId: text("comment_id").notNull().references(() => comments.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  guestName: text("guest_name"),
  content: text("content").notNull(),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
});

export const youtubeAnalysisChats = sqliteTable("youtube_analysis_chats", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  videoId: text("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "model"] }).notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
});

export const videosRelations = relations(videos, ({ many }) => ({
  chats: many(youtubeAnalysisChats),
}));

export const youtubeAnalysisChatsRelations = relations(youtubeAnalysisChats, ({ one }) => ({
  video: one(videos, {
    fields: [youtubeAnalysisChats.videoId],
    references: [videos.id],
  }),
}));

