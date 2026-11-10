/** Interface languages. Content (posts, notes) is written in one of these. */
export const languages = ["fr", "en"] as const;
export type Lang = (typeof languages)[number];

/** A UI string in every language. Rendered by <T> with both versions in the HTML. */
export type Localized = Record<Lang, string>;

export const defaultLang: Lang = "en";

/** Locale used to format dates for each UI language. */
export const dateLocales: Record<Lang, string> = {
	fr: "fr-BE",
	en: "en-GB",
};

/** Open Graph locale for each language. */
export const ogLocales: Record<Lang, string> = {
	fr: "fr_BE",
	en: "en_GB",
};

/** A string that is either the same in every language, or localized. */
export type MaybeLocalized = string | Localized;

/** Resolve a possibly localized string for one language. */
export function localize(value: MaybeLocalized, lang: Lang): string {
	return typeof value === "string" ? value : value[lang];
}

/** URL prefix of each language. Every page lives under /fr/ or /en/; "/" only redirects. */
const prefixes: Record<Lang, string> = { fr: "/fr", en: "/en" };

/** Turn a site path without prefix (e.g. "/tags/git/") into its path for a language. */
export function localizePath(path: string, lang: Lang): string {
	return `${prefixes[lang]}${path}`;
}

/** Remove the language prefix from a path ("/en/tags/" -> "/tags/"). */
export function stripLangPrefix(path: string): string {
	return path.replace(/^\/(fr|en)(?=\/|$)/, "") || "/";
}

/** Path of the same page in every language. */
export function alternatePaths(path: string): Record<Lang, string> {
	const base = stripLangPrefix(path);
	return { fr: localizePath(base, "fr"), en: localizePath(base, "en") };
}

/**
 * How UI strings render, set per page through Astro.locals.uiLang:
 * - set (list pages under /fr/ and /en/): one language only, server side, good for SEO;
 * - unset (posts, notes, 404: one URL for both UI languages): every language in the HTML,
 *   CSS shows the reader's choice.
 */
