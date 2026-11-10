import { type CollectionEntry, getCollection } from "astro:content";
import type { Lang } from "@/i18n";

/** URL of each language version of a page. */
export type Translations = Partial<Record<Lang, string>>;

/** URL of a post, under the language it is written in: /fr/posts/... or /en/posts/... */
export function postUrl(post: CollectionEntry<"post">): string {
	return `/${post.data.lang}/posts/${post.id}/`;
}

/** URL of a note, under the language it is written in. */
export function noteUrl(note: CollectionEntry<"note">): string {
	return `/${note.data.lang}/notes/${note.id}/`;
}

/** filter out draft posts based on the environment; with `lang`, only posts written in that language */
export async function getAllPosts(lang?: Lang): Promise<CollectionEntry<"post">[]> {
	return await getCollection("post", ({ data }) => {
		if (lang && data.lang !== lang) return false;
		return import.meta.env.PROD ? !data.draft : true;
	});
}

/** notes written in a language */
export async function getNotes(lang: Lang): Promise<CollectionEntry<"note">[]> {
	return await getCollection("note", ({ data }) => data.lang === lang);
}

/** Get tag metadata by tag name */
export async function getTagMeta(tag: string): Promise<CollectionEntry<"tag"> | undefined> {
	const tagEntries = await getCollection("tag", (entry) => {
		return entry.id === tag;
	});
	return tagEntries[0];
}

/** groups posts by year (based on option siteConfig.sortPostsByUpdatedDate), using the year as the key
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 */
export function groupPostsByYear(posts: CollectionEntry<"post">[]) {
	return Object.groupBy(posts, (post) => post.data.publishDate.getFullYear().toString());
}

/** returns all tags created from posts (inc duplicate tags)
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 *  */
export function getAllTags(posts: CollectionEntry<"post">[]) {
	return posts.flatMap((post) => [...post.data.tags]);
}

/** returns all unique tags created from posts
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 *  */
export function getUniqueTags(posts: CollectionEntry<"post">[]) {
	return [...new Set(getAllTags(posts))];
}

/** returns a count of each unique tag - [[tagName, count], ...]
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 *  */
export function getUniqueTagsWithCount(posts: CollectionEntry<"post">[]): [string, number][] {
	return [
		...getAllTags(posts).reduce(
			(acc, t) => acc.set(t, (acc.get(t) ?? 0) + 1),
			new Map<string, number>(),
		),
	].sort((a, b) => b[1] - a[1]);
}

type Translatable = CollectionEntry<"post"> | CollectionEntry<"note">;

/**
 * URLs of every language version of an entry, itself included, found through `translationKey`.
 * Fails the build when two entries of the same language share a key.
 */
function findTranslations<E extends Translatable>(
	entry: E,
	all: E[],
	url: (e: E) => string,
): Translations {
	const translations: Translations = { [entry.data.lang]: url(entry) };
	const key = entry.data.translationKey;
	if (!key) return translations;

	for (const other of all) {
		if (other.data.translationKey !== key || other.id === entry.id) continue;
		if (other.data.lang === entry.data.lang) {
			throw new Error(
				`translationKey "${key}" is used by two ${entry.collection}s in "${entry.data.lang}": ${entry.id}, ${other.id}`,
			);
		}
		translations[other.data.lang] = url(other);
	}
	return translations;
}

export async function getPostTranslations(post: CollectionEntry<"post">): Promise<Translations> {
	return findTranslations(post, await getAllPosts(), postUrl);
}

export async function getNoteTranslations(note: CollectionEntry<"note">): Promise<Translations> {
	return findTranslations(note, await getCollection("note"), noteUrl);
}
