/**
 * Navigation helpers over a list of posts. Pure functions (no astro:content import) so Vitest can load them.
 * Callers pass posts of a single language, e.g. from getAllPosts(lang).
 */

export interface NavPost {
	id: string;
	data: { publishDate: Date; tags: string[]; series?: string | undefined };
}

const byDateAsc = (a: NavPost, b: NavPost) => a.data.publishDate.getTime() - b.data.publishDate.getTime();

/** Posts sharing the most tags with `post`, most recent first on ties. Posts without a shared tag are left out. */
export function getRelatedPosts<P extends NavPost>(post: P, all: P[], limit = 3): P[] {
	const tags = new Set(post.data.tags);
	return all
		.filter((other) => other.id !== post.id)
		.map((other) => ({ other, score: other.data.tags.filter((t) => tags.has(t)).length }))
		.filter(({ score }) => score > 0)
		.sort((a, b) => b.score - a.score || byDateAsc(b.other, a.other))
		.slice(0, limit)
		.map(({ other }) => other);
}

/** The post published just before (`previous`) and just after (`next`) `post`. */
export function getAdjacentPosts<P extends NavPost>(post: P, all: P[]): { previous?: P; next?: P } {
	const sorted = [...all].sort(byDateAsc);
	const index = sorted.findIndex((other) => other.id === post.id);
	return { previous: sorted[index - 1], next: sorted[index + 1] };
}

/** The series `post` belongs to, in publication order. Undefined without a series or when it has a single post. */
export function getSeries<P extends NavPost>(
	post: P,
	all: P[],
): { name: string; posts: P[]; index: number } | undefined {
	const name = post.data.series;
	if (!name) return undefined;
	const posts = all.filter((other) => other.data.series === name).sort(byDateAsc);
	if (posts.length < 2) return undefined;
	return { name, posts, index: posts.findIndex((other) => other.id === post.id) };
}

/** Visible in production: not a draft and not scheduled for later. Posts dated in the future appear on the daily rebuild. */
export function isPublished(data: { draft: boolean; publishDate: Date }, now: Date = new Date()): boolean {
	return !data.draft && data.publishDate.getTime() <= now.getTime();
}
