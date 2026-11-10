import type { Lang, Localized, MaybeLocalized } from "@/i18n";

export interface SiteConfig {
	author: string;
	date: {
		options: Intl.DateTimeFormatOptions;
	};
	description: string;
	lang: string;
	ogLocale: string;
	/** GitHub repository of the site, for "edit on GitHub" links */
	repoUrl: string;
	repoBranch: string;
	/** Giscus comments; empty IDs disable them */
	giscus: { repo: string; repoId: string; category: string; categoryId: string };
	/** Cloudflare Web Analytics site token; empty disables it */
	cloudflareAnalyticsToken: string;
  showLogo: boolean;
	title: string;
	url: string;
}

export interface PaginationLink {
	srLabel?: string;
	text?: Localized;
	url: string;
}

export interface SiteMeta {
	articleDate?: string | undefined;
	articleModifiedDate?: string | undefined;
	articleTags?: string[] | undefined;
	description?: MaybeLocalized;
	/** Language of the page content. Sets <html lang>, og:locale and the server-rendered UI language. Defaults to the site language. */
	lang?: Lang | undefined;
	/** Exclude the page from search engines (e.g. 404). */
	noindex?: boolean;
	ogImage?: string | undefined;
	title: MaybeLocalized;
}

/** Webmentions */
export interface WebmentionsFeed {
	children: WebmentionsChildren[];
	name: string;
	type: string;
}

export interface WebmentionsCache {
	children: WebmentionsChildren[];
	lastFetched: null | string;
}

export interface WebmentionsChildren {
	author: Author | null;
	content?: Content | null;
	"mention-of": string;
	name?: null | string;
	photo?: null | string[];
	published?: null | string;
	rels?: Rels | null;
	summary?: Summary | null;
	syndication?: null | string[];
	type: string;
	url: string;
	"wm-id": number;
	"wm-private": boolean;
	"wm-property": string;
	"wm-protocol": string;
	"wm-received": string;
	"wm-source": string;
	"wm-target": string;
}

export interface Author {
	name: string;
	photo: string;
	type: string;
	url: string;
}

export interface Content {
	"content-type": string;
	html: string;
	text: string;
	value: string;
}

export interface Rels {
	canonical: string;
}

export interface Summary {
	"content-type": string;
	value: string;
}

export type AdmonitionType = "tip" | "note" | "important" | "caution" | "warning";
