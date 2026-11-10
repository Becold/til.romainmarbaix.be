declare module "@pagefind/default-ui" {
	declare class PagefindUI {
		constructor(arg: unknown);
	}
}

declare namespace App {
	interface Locals {
		/** UI language of the page (see src/i18n.ts). Unset only on the 404 page. */
		uiLang?: import("./i18n").Lang;
		/**
		 * URL of each language version of the page, when it differs from the /fr/ <-> /en/ rule
		 * (posts, notes, tags, pagination). A missing language means no translation:
		 * no hreflang for it, and the FR/EN switch goes to that language's home page.
		 */
		alternates?: Partial<Record<import("./i18n").Lang, string>>;
	}
}
