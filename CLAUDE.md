# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A bilingual (English/French) "Today I Learned" blog for til.romainmarbaix.be. It is a static Astro site built on the Astro Cactus theme, heavily modified for i18n. The README is the theme's original one: its paths (`src/content/...`) and its single-language assumptions are outdated. Trust this file and the code over it.

## Commands

npm only. The theme ships pnpm files; they were removed. Node version: `.nvmrc`.

- `npm run dev`: dev server on http://localhost:4321. It runs detached: stop it with `npx astro dev stop`. Restart it after changing the content schema or adding/moving routes, because the running server does not pick those up. On Windows, a running dev server locks native modules, so stop it before `npm ci`.
- `npm run build`: `astro build`, then `postbuild` runs `pagefind --site dist`. Search only works on a build, not in dev.
- `npm run preview`: serve `dist/`.
- `npx astro check`: type check. It currently reports 8 known errors in `astro.config.ts` and `src/plugins/satteri.ts` (satteri plugin typings from the theme). They do not break the build. Any other error is new.
- `npm run lint` (Biome) / `npm run format` (Prettier).
- `npm test`: Vitest unit tests for the pure helpers in `src/utils/*.test.ts` (post navigation, scheduling, activity heatmap, git dates).

Beyond `npm test`, verify a change with `npm run build` and by inspecting the generated HTML in `dist/` (`<html lang>`, `hreflang` links, canonical, JSON-LD).

Deploy: `.github/workflows/deploy.yml` builds, checks internal links (lychee, offline) and deploys `dist/` to GitHub Pages on push to `master`/`main`, and daily at 05:17 UTC (publishes scheduled posts, refreshes the heatmap). It checks out the full history (`fetch-depth: 0`): post update dates come from `git log`. The custom domain is set in the repo Pages settings (`public/CNAME` is ignored by Actions deployments).

## Content

- Markdown/MDX lives in `content/` (not `src/content/`): `content/posts`, `content/tags` (optional tag page overrides). The theme's Notes feature was removed on purpose. The schema is in `src/content.config.ts`.
- Posts in `content/posts/` are committed: CI deploys only tracked posts. "Collection is empty" warnings for `content/tags` are expected.
- Every post has `lang: fr | en` (default `en`). A post is published only under its own language: `/fr/posts/<id>/` or `/en/posts/<id>/`. Build URLs with `postUrl()` from `src/data/post.ts`, never by hand.
- Translations are linked by giving both versions the same `translationKey`. Slugs may differ. The build throws if two entries of the same language share a key.
- Post `title` is max 60 characters.

## i18n architecture (the part that spans many files)

**URLs.** Every page lives under `/fr/` or `/en/`. `src/pages/index.astro` only redirects: saved choice (`localStorage["ui-lang"]`), else browser language, else `defaultLang`. It is `noindex` and filtered out of the sitemap. `defaultLang` is `en`, in `src/i18n.ts`, together with `localizePath`, `stripLangPrefix`, `alternatePaths` and the `Localized` / `MaybeLocalized` types.

**Pages vs views.** UI pages (home, about, posts list, tags, tag page) live in `src/views/*.astro` and take a `lang` prop. `src/pages/fr/...` and `src/pages/en/...` are thin wrappers. Paginated pages share `getStaticPaths` factories from `src/views/paths.ts` (`postsPaths(lang)` etc.), which only return content in that language. To add a UI page: create a view, then add one wrapper under each language folder.

**`Astro.locals` drives rendering.** It is typed in `src/env.d.ts`.
- `uiLang`: set at the top of every view, and by `BlogPost.astro`. When it is set, `<T>` (`src/components/i18n/T.astro`), `FormattedDate` and `LocalLink` render **one** language server side. When it is unset (only `404.astro`), they render every language, and CSS in `global.css` shows the one in `<html data-ui-lang>`.
- `alternates`: URL of each language version, used when it differs from the plain `/fr/ <-> /en/` swap. Posts set it from `translationKey`. Tag pages and pagination pages set it to only themselves when the other language lacks that page. `Base.astro` passes it to `BaseHead.astro`, which emits `hreflang` (only with ≥2 versions; `x-default` = `defaultLang`). `LangToggle` links to `alternates[other]`, or to the other language's home page when there is no translation.
- The view or layout must set `locals` **before** rendering `<Base>`: frontmatter runs top-down, so children read the values.

**UI strings.** Write `<T fr="…" en="…" />` or `<T text={{ fr, en }} />`. Meta `title`/`description` accept `MaybeLocalized`. Internal links that depend on the language use `<LocalLink href="/tags/">` (path without prefix) or `localizePath(path, lang)`. `<html lang>` is always the page content language. The client-side language script (`LangProvider.astro`) only touches `data-ui-lang` and `document.title`.

**Per language.** RSS feeds: `/fr/rss.xml` and `/en/rss.xml`, built by `src/data/rss.ts`. The Pagefind index is split by `<html lang>`. OG images (`/og-image/<id>.png`) stay unprefixed.

## Git

The repo uses a repo-local identity (personal GitHub noreply address), not the global work identity. Keep it that way.

## Post page features

- `src/utils/postNav.ts` (pure, tested): `getRelatedPosts` (shared tags), `getAdjacentPosts` (prev/next), `getSeries` (`series` frontmatter), `isPublished` (no drafts, no future `publishDate` in production; used by `getAllPosts`).
- `src/layouts/BlogPost.astro` wires them: `SeriesBox` under the title; in a `data-pagefind-ignore` footer: "edit on GitHub" link, `PostNav`, `RelatedPosts`, `Comments`.
- Update date: frontmatter `updatedDate`, else `getGitLastModified(post.filePath)` (`src/utils/git.ts`: author date of the last commit, only if the file has more than one commit), shown only when its day is after `publishDate`. Bulk commits touching every post (formatting, renames) still mark them as updated: set `updatedDate` by hand or avoid them.
- ```mermaid blocks become `<pre class="mermaid">` in `src/plugins/mermaid.ts` (registered first, so Expressive Code skips them). `PostEnhancements.astro` lazy-loads `mermaid` and `medium-zoom` (image zoom) only when the page needs them. It keeps each diagram source in `data-source` and re-renders on `<html data-theme>` changes (MutationObserver), so diagrams follow the light/dark toggle and the OS setting.
- Home: `ActivityHeatmap.astro` (`src/utils/activity.ts`). `/{lang}/random/` redirects to a random post (noindex, not in sitemap). `/llms.txt` lists all posts.

## Services to configure (`src/site.config.ts`)

Empty values disable them; nothing renders.
- `giscus.repoId` / `giscus.categoryId`: enable Discussions on the repo (`gh api -X PATCH repos/Becold/til.romainmarbaix.be -F has_discussions=true`), install https://github.com/apps/giscus on it, then read the IDs with `gh api graphql -f query='{ repository(owner:"Becold", name:"til.romainmarbaix.be") { id discussionCategories(first:20) { nodes { id name } } } }'`.
- `cloudflareAnalyticsToken`: from Cloudflare dashboard → Web Analytics → add site `til.romainmarbaix.be` (the DNS record stays "DNS only", so use the JS snippet token).
