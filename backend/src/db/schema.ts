import { sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";

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
});

export const userVideos = sqliteTable("user_videos", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  videoId: text("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.videoId] }),
}));

