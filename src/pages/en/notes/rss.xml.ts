import type { APIContext } from "astro";
import { notesFeed } from "@/data/rss";

export const GET = (context: APIContext) => notesFeed("en", String(context.site));
