declare module "@pagefind/default-ui" {
	declare class PagefindUI {
		constructor(arg: unknown);
	}
}

declare namespace App {
	interface Locals {
		/** UI language of a monolingual page (see src/i18n.ts). Unset on posts, notes and 404. */
		uiLang?: import("./i18n").Lang;
	}
}
