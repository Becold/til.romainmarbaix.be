import type { AstroExpressiveCodeOptions } from "astro-expressive-code";
import type { Localized } from "@/i18n";
import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
	// ! Please remember to replace the following site property with your own domain, used in astro.config.ts
	url: "https://til.romainmarbaix.be/",
	/*
		- Used to construct the meta title property found in src/components/BaseHead.astro L:11
		- The webmanifest name found in astro.config.ts L:42
		- The link value found in src/components/layout/Header.astro L:35
		- In the footer found in src/components/layout/Footer.astro L:12
	*/
	title: "TIL — Romain Marbaix",
	// Used as both a meta property (src/components/BaseHead.astro L:31 + L:49) & the generated satori png (src/pages/og-image/[slug].png.ts)
	author: "Romain Marbaix",
	// Used as the default description meta property and webmanifest description
	description: "Today I Learned: the dev tips I don't want to forget.",
	// HTML lang property, found in src/layouts/Base.astro L:18 & astro.config.ts L:48
	lang: "en-GB",
	// Meta property, found in src/components/BaseHead.astro L:42
  ogLocale: "en_GB",
	// Source repository, used for "edit on GitHub" links
	repoUrl: "https://github.com/Becold/til.romainmarbaix.be",
	repoBranch: "master",
	// Giscus comments (https://giscus.app): fill repoId and categoryId to enable them
	giscus: {
		repo: "Becold/til.romainmarbaix.be",
		repoId: "",
		category: "Comments",
		categoryId: "",
	},
	// Cloudflare Web Analytics site token: fill it to enable analytics (production only)
	cloudflareAnalyticsToken: "",
  // Determines whether to show the logo in the templates header
	showLogo: true,
	// Date.prototype.toLocaleDateString() parameters, found in src/utils/date.ts.
	date: {
		options: {
			day: "numeric",
			month: "short",
			year: "numeric",
		},
	},
};

// Used to generate links in both the Header & Footer.
export const menuLinks: { path: string; title: Localized }[] = [
	{
		path: "/",
		title: { fr: "Accueil", en: "Home" },
	},
	{
		path: "/posts/",
		title: { fr: "Articles", en: "Posts" },
	},
	{
		path: "/about/",
		title: { fr: "À propos", en: "About" },
	},
];

// https://expressive-code.com/reference/configuration/
export const expressiveCodeOptions: AstroExpressiveCodeOptions = {
	styleOverrides: {
		borderRadius: "4px",
		codeFontFamily:
			'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
		codeFontSize: "0.875rem",
		codeLineHeight: "1.7142857rem",
		codePaddingInline: "1rem",
		frames: {
			frameBoxShadowCssValue: "none",
		},
		uiLineHeight: "inherit",
	},
	themeCssSelector(theme, { styleVariants }) {
		// If one dark and one light theme are available
		// generate theme CSS selectors compatible with cactus-theme dark mode switch
		if (styleVariants.length >= 2) {
			const baseTheme = styleVariants[0]?.theme;
			const altTheme = styleVariants.find((v) => v.theme.type !== baseTheme?.type)?.theme;
			if (theme === baseTheme || theme === altTheme) return `[data-theme='${theme.type}']`;
		}
		// return default selector
		return `[data-theme="${theme.name}"]`;
	},
	// One dark, one light theme => https://expressive-code.com/guides/themes/#available-themes
	themes: ["dracula", "github-light"],
	useThemedScrollbars: false,
};
