import type { GetStaticPaths } from "astro";
import { getAllPosts, getNotes, getUniqueTags } from "@/data/post";
import type { Lang } from "@/i18n";
import { collectionDateSort } from "@/utils/date";

/** Static paths of the list pages. Each language lists only the content written in it. */

export const postsPaths = (lang: Lang) =>
	(async ({ paginate }) => {
		const MAX_POSTS_PER_PAGE = 10;
		const MAX_TAGS = 7;
		const MAX_PINNED_POSTS = 3;
		const allPosts = await getAllPosts(lang);
		const allPostsByDate = allPosts.sort(collectionDateSort);
		const uniqueTags = getUniqueTags(allPosts).slice(0, MAX_TAGS);
		const pinnedPosts = allPostsByDate
			.values()
			.filter((p) => p.data.pinned)
			.take(MAX_PINNED_POSTS)
			.toArray();
		return paginate(allPostsByDate, {
			pageSize: MAX_POSTS_PER_PAGE,
			props: { uniqueTags, pinnedPosts },
		});
	}) satisfies GetStaticPaths;

export const tagPaths = (lang: Lang) =>
	(async ({ paginate }) => {
		const allPosts = await getAllPosts(lang);
		const sortedPosts = allPosts.sort(collectionDateSort);
		const uniqueTags = getUniqueTags(sortedPosts);

		return uniqueTags.flatMap((tag) => {
			const postsWithTag = sortedPosts.filter((post) => post.data.tags.includes(tag));
			return paginate(postsWithTag, {
				pageSize: 10,
				params: { tag },
			});
		});
	}) satisfies GetStaticPaths;

export const notesPaths = (lang: Lang) =>
	(async ({ paginate }) => {
		const MAX_NOTES_PER_PAGE = 10;
		const notes = await getNotes(lang);
		return paginate(notes.sort(collectionDateSort), { pageSize: MAX_NOTES_PER_PAGE });
	}) satisfies GetStaticPaths;
