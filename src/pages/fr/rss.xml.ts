import type { APIContext } from "astro";
import { postsFeed } from "@/data/rss";

export const GET = (context: APIContext) => postsFeed("fr", String(context.site));
