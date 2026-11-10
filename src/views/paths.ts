import { getCollection } from "astro:content";
import type { GetStaticPaths } from "astro";
import { getAllPosts, getUniqueTags } from "@/data/post";
import { collectionDateSort } from "@/utils/date";

/** Static paths shared by the French (/...) and English (/en/...) versions of each list page. */

export const postsPaths = (async ({ paginate }) => {
	const MAX_POSTS_PER_PAGE = 10;
	const MAX_TAGS = 7;
	const MAX_PINNED_POSTS = 3;
	const allPosts = await getAllPosts();
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

export const tagPaths = (async ({ paginate }) => {
	const allPosts = await getAllPosts();
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

export const notesPaths = (async ({ paginate }) => {
	const MAX_NOTES_PER_PAGE = 10;
	const allNotes = await getCollection("note");
	return paginate(allNotes.sort(collectionDateSort), { pageSize: MAX_NOTES_PER_PAGE });
}) satisfies GetStaticPaths;
