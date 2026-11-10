import type { APIContext } from "astro";
import { getAllPosts, postUrl } from "@/data/post";
import type { Lang } from "@/i18n";
import { siteConfig } from "@/site.config";
import { collectionDateSort } from "@/utils/date";

/** https://llmstxt.org: plain-text index of the posts, for AI assistants. */
const sections: [Lang, string][] = [
	["en", "English"],
	["fr", "Français"],
];

export async function GET(context: APIContext) {
	const site = String(context.site);
	const lines = [`# ${siteConfig.title}`, "", `> ${siteConfig.description}`, ""];
	for (const [lang, heading] of sections) {
		const posts = (await getAllPosts(lang)).sort(collectionDateSort);
		if (posts.length === 0) continue;
		lines.push(`## ${heading}`, "");
		for (const post of posts) {
			lines.push(`- [${post.data.title}](${new URL(postUrl(post), site)}): ${post.data.description}`);
		}
		lines.push("");
	}
	return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
