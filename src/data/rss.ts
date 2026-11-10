import rss from "@astrojs/rss";
import { getAllPosts, postUrl } from "@/data/post";
import type { Lang } from "@/i18n";
import { siteConfig } from "@/site.config";

const descriptions: Record<Lang, string> = {
	fr: "Today I Learned : les astuces de dev que je ne veux pas oublier.",
	en: siteConfig.description,
};

/** RSS feed of the posts written in one language. */
export async function postsFeed(lang: Lang, site: string) {
	const posts = await getAllPosts(lang);
	return rss({
		title: siteConfig.title,
		description: descriptions[lang],
		site,
		customData: `<language>${lang}</language>`,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.publishDate,
			link: postUrl(post),
		})),
	});
}
