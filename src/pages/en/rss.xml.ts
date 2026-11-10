import type { APIContext } from "astro";
import { postsFeed } from "@/data/rss";

export const GET = (context: APIContext) => postsFeed("en", String(context.site));
