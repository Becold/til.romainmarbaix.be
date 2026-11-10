import { describe, expect, it } from "vitest";
import { getAdjacentPosts, getRelatedPosts, getSeries, isPublished } from "./postNav";

const p = (id: string, date: string, tags: string[] = [], series?: string) => ({
	id,
	data: { publishDate: new Date(date), tags, series },
});

describe("getRelatedPosts", () => {
	it("related ranks by shared tags then recency", () => {
		const a = p("a", "2026-05-01", ["git", "shell"]);
		const b = p("b", "2026-01-01", ["git", "shell"]);
		const c = p("c", "2026-04-01", ["git"]);
		const d = p("d", "2026-03-01", ["docker"]);
		expect(getRelatedPosts(a, [a, b, c, d]).map((x) => x.id)).toEqual(["b", "c"]);
	});

	it("related is empty without shared tags", () => {
		const a = p("a", "2026-05-01", []);
		const b = p("b", "2026-01-01", ["git"]);
		expect(getRelatedPosts(a, [a, b])).toEqual([]);
	});

	it("related respects limit", () => {
		const a = p("a", "2026-06-01", ["git"]);
		const others = [1, 2, 3, 4, 5].map((n) => p(`o${n}`, `2026-0${n}-01`, ["git"]));
		expect(getRelatedPosts(a, [a, ...others], 3)).toHaveLength(3);
	});
});

describe("getAdjacentPosts", () => {
	it("adjacent at both ends", () => {
		const a = p("a", "2026-01-01");
		const b = p("b", "2026-02-01");
		const c = p("c", "2026-03-01");
		const all = [c, a, b];
		expect(getAdjacentPosts(a, all)).toEqual({ previous: undefined, next: b });
		expect(getAdjacentPosts(b, all)).toEqual({ previous: a, next: c });
		expect(getAdjacentPosts(c, all)).toEqual({ previous: b, next: undefined });
	});
});

describe("getSeries", () => {
	it("series returns sorted posts and index", () => {
		const s1 = p("s1", "2026-01-01", [], "git");
		const s2 = p("s2", "2026-02-01", [], "git");
		const s3 = p("s3", "2026-03-01", [], "git");
		const other = p("x", "2026-02-15");
		const series = getSeries(s2, [s3, other, s1, s2]);
		expect(series?.name).toBe("git");
		expect(series?.posts.map((x) => x.id)).toEqual(["s1", "s2", "s3"]);
		expect(series?.index).toBe(1);
	});

	it("series undefined for single post or no series", () => {
		const alone = p("a", "2026-01-01", [], "solo");
		const none = p("b", "2026-01-02");
		expect(getSeries(alone, [alone, none])).toBeUndefined();
		expect(getSeries(none, [alone, none])).toBeUndefined();
	});
});

describe("isPublished", () => {
	const now = new Date("2026-11-10T12:00:00Z");
	it("is false for drafts", () => {
		expect(isPublished({ draft: true, publishDate: new Date("2026-01-01") }, now)).toBe(false);
	});
	it("is false for a future date", () => {
		expect(isPublished({ draft: false, publishDate: new Date("2026-11-11") }, now)).toBe(false);
	});
	it("is true for today at midnight and for yesterday", () => {
		expect(isPublished({ draft: false, publishDate: new Date("2026-11-10") }, now)).toBe(true);
		expect(isPublished({ draft: false, publishDate: new Date("2026-11-09") }, now)).toBe(true);
	});
});
