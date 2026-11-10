# TIL Blog Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 14 small features to the bilingual TIL blog: related posts, prev/next, series, random post, activity heatmap, git-based last-updated date, "edit on GitHub" link, Mermaid diagrams, image zoom, Giscus comments, Cloudflare Web Analytics, scheduled publishing, CI link check, `llms.txt`.

**Architecture:** Pure post-list helpers in `src/utils/` (unit tested with Vitest), rendered by small Astro components plugged into `src/layouts/BlogPost.astro` or `src/views/Home.astro`. Build-time data only, no client framework. External services (Giscus, Cloudflare) are configured in `src/site.config.ts` and render nothing while their IDs are empty.

**Tech Stack:** Astro 7, Astro Cactus theme, satteri markdown processor, Tailwind 4, Vitest (new), `mermaid` and `medium-zoom` (new, client side, lazy loaded), GitHub Actions, lychee.

**Spec:** the user's request in chat: "fais tout ça", the 14 features listed as "Goal". Read the repo's `CLAUDE.md` first: it explains the i18n rendering rules every task must follow.

## Global Constraints

- Every UI string goes through `<T fr="…" en="…" />`. Every internal URL goes through `postUrl(post)` or `localizePath(path, lang)`. No hard-coded `/fr/` or `/en/`.
- Post pages render in one language (`Astro.locals.uiLang` = post language). Lists only contain posts of that language: always start from `getAllPosts(lang)`.
- No UI framework, no hydration. Small `<script>` tags only. Client libraries are loaded with a dynamic `import()` only when the page needs them.
- `npm run build` must pass after each task. `npx astro check` must show no errors besides the 8 known ones in `astro.config.ts` and `src/plugins/satteri.ts`.
- One commit per task. Message in English, imperative, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Repo: `https://github.com/Becold/til.romainmarbaix.be`, default branch `master`.
- There is only one real post (`content/posts/2026-11-10-plusieurs-identites-git.md`, `lang: fr`, tag `git`). To check list features visually, add temporary posts under `content/posts/zz-tmp-*.md`, and delete them before committing.

## Review Focus

1. A post with no tags, or no post sharing a tag: no "related" section at all (no empty heading).
2. First and last post of a language: prev/next shows only the side that exists.
3. A post in the future (`publishDate` > build time) is invisible in production everywhere: lists, tags, RSS, `llms.txt`, random, heatmap, sitemap, and its own page is not built. It stays visible in `npm run dev`.
4. Git date when the file is untracked or git is missing (fresh tarball, CI shallow clone): no crash, no "updated" label.
5. A ` ```mermaid ` block must not be syntax-highlighted by Expressive Code, and pages without Mermaid must not load the library.

---

### Task 1: Vitest + post navigation helpers (related, prev/next, series)

**Files:**
- Modify: `package.json` (devDependency `vitest`, script `"test": "vitest run"`)
- Create: `vitest.config.ts` (`include: ["src/**/*.test.ts"]`, alias `@` -> `./src`)
- Create: `src/utils/postNav.ts`
- Create: `src/utils/postNav.test.ts`
- Modify: `src/content.config.ts` (post schema: `series: z.string().optional()`)

**Interfaces:**
- Produces, in `src/utils/postNav.ts`, generic over `type NavPost = { id: string; data: { publishDate: Date; tags: string[]; series?: string | undefined } }`:
  - `getRelatedPosts<P extends NavPost>(post: P, all: P[], limit = 3): P[]`: excludes `post`, score = number of shared tags, drops score 0, sorts by score desc then `publishDate` desc.
  - `getAdjacentPosts<P extends NavPost>(post: P, all: P[]): { previous?: P; next?: P }`: `all` sorted by `publishDate` asc; `previous` = older, `next` = newer.
  - `getSeries<P extends NavPost>(post: P, all: P[]): { name: string; posts: P[]; index: number } | undefined`: `undefined` when `post.data.series` is empty or the series has a single post; `posts` sorted by `publishDate` asc; `index` 0-based.

- [ ] **Step 1: Write failing tests** in `src/utils/postNav.test.ts`, with a `p(id, date, tags, series?)` factory:
  - `related ranks by shared tags then recency`: a(tags git,shell), b(git,shell, older), c(git, newer), d(docker) → `getRelatedPosts(a, all)` ids = `["b", "c"]`.
  - `related is empty without shared tags`: post with tags `[]` → `[]`.
  - `related respects limit`: 5 matching posts, `limit = 3` → length 3.
  - `adjacent at both ends`: 3 posts → first has only `next`, last has only `previous`, middle has both.
  - `series returns sorted posts and index`: 3 posts series `"git"` (dates out of order) + 1 other → names `"git"`, ids sorted by date, correct index.
  - `series undefined for single post or no series`.
- [ ] **Step 2:** `npm test` → FAIL (module not found).
- [ ] **Step 3: Implement** the three functions in `src/utils/postNav.ts`. No `astro:content` import, so Vitest can load it.
- [ ] **Step 4:** `npm test` → PASS (6 tests).
- [ ] **Step 5: Commit** `Add Vitest and post navigation helpers`.

### Task 2: Related posts, prev/next and series on post pages

**Files:**
- Create: `src/components/blog/RelatedPosts.astro` (props `posts: CollectionEntry<"post">[]`)
- Create: `src/components/blog/PostNav.astro` (props `previous?`, `next?`)
- Create: `src/components/blog/SeriesBox.astro` (props `series: ReturnType<typeof getSeries>`, `current: CollectionEntry<"post">`)
- Modify: `src/layouts/BlogPost.astro`

**Interfaces:**
- Consumes: Task 1 functions; `getAllPosts(lang)`, `postUrl()` from `src/data/post.ts`.

- [ ] **Step 1:** In `BlogPost.astro`, load `const siblings = await getAllPosts(lang)` and compute the three values.
- [ ] **Step 2:** `SeriesBox` above the content (below `TranslationLink`): heading `<T fr={`Série : ${name}`} en={`Series: ${name}`} />`, then an ordered list of links. The current post is plain text with `aria-current="page"`. Show "Partie {index+1}/{n}" / "Part {index+1}/{n}".
- [ ] **Step 3:** After the `prose` div, inside `<article>` but **outside** `data-pagefind-body` content (wrap it in `data-pagefind-ignore`): `PostNav` (`← {older title}` on the left, `{newer title} →` on the right, labels `<T fr="Article précédent" en="Previous post" />` / `<T fr="Article suivant" en="Next post" />`), then `RelatedPosts` (heading `<T fr="Articles liés" en="Related posts" />`, uses `PostPreview`). Each component renders nothing when it has no data.
- [ ] **Step 4: Verify:** add 3 temp posts (`lang: fr`, tags `git`, one with `series: test` on two of them); `npm run build`; grep `dist/fr/posts/*/index.html` for "Articles liés", "Article précédent", "Série". Then check the real post alone: no empty sections. Delete the temp posts.
- [ ] **Step 5: Commit** `Show related posts, previous/next and series on post pages`.

### Task 3: Scheduled publishing + daily rebuild

**Files:**
- Modify: `src/data/post.ts` (`getAllPosts`)
- Modify: `src/pages/og-image/[...slug].png.ts` only if it does not use `getAllPosts`
- Modify: `.github/workflows/deploy.yml` (`schedule: - cron: "17 5 * * *"`)

**Interfaces:**
- Produces: `isPublished(data: { draft: boolean; publishDate: Date }, now = new Date()): boolean` exported from `src/utils/postNav.ts` (pure, tested): `!draft && publishDate <= now`.

- [ ] **Step 1: Failing tests** in `postNav.test.ts`: `isPublished` false for draft, false for tomorrow, true for today 00:00 and yesterday.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implement. `getAllPosts` uses `import.meta.env.PROD ? isPublished(data) : true`. Confirm with grep that every post list goes through `getAllPosts` (`getCollection("post"` must appear only in `src/data/post.ts`).
- [ ] **Step 4:** `npm test` → PASS; temp post dated next year → `npm run build` → no `dist/**/zz-tmp*`, absent from `dist/fr/rss.xml` and `dist/sitemap-0.xml`. Delete the temp post.
- [ ] **Step 5:** Add the daily `schedule` trigger to `deploy.yml`, so future posts appear on their day. Commit `Hide future posts in production and rebuild daily`.

### Task 4: Git-based last-updated date + "edit on GitHub"

**Files:**
- Create: `src/utils/git.ts`
- Modify: `src/site.config.ts` (`repoUrl: "https://github.com/Becold/til.romainmarbaix.be"`, `repoBranch: "master"`, typed in `src/types.ts`)
- Modify: `src/layouts/BlogPost.astro`, `src/components/blog/Masthead.astro`
- Modify: `.github/workflows/deploy.yml` (checkout `fetch-depth: 0`)

**Interfaces:**
- Produces: `getGitLastModified(filePath: string): Date | undefined`: runs `git log -1 --format=%cI -- <filePath>` with `execFileSync`, memoized per path; returns `undefined` on any error or empty output.
- Rule: shown updated date = `post.data.updatedDate ?? gitDate`, only when its calendar day is after `publishDate`. Pass it as `articleModifiedDate` too (JSON-LD and meta).

- [ ] **Step 1:** Implement `getGitLastModified`; use `post.filePath` (set by the glob loader).
- [ ] **Step 2:** `Masthead` gets an `updatedDate?: Date` prop instead of reading `data.updatedDate`.
- [ ] **Step 3:** Footer of the post (inside the `data-pagefind-ignore` block from Task 2): link `<T fr="Modifier sur GitHub" en="Edit on GitHub" />` to `${repoUrl}/blob/${repoBranch}/${post.filePath}` (forward slashes).
- [ ] **Step 4: Verify:** `npm run build` → the real post has an edit link to `.../blob/master/content/posts/2026-11-10-plusieurs-identites-git.md`; no "Mis à jour" label (same day). Error path: Vitest test `getGitLastModified("does/not/exist.md")` → `undefined` (do not touch `.git`).
- [ ] **Step 5: Commit** `Derive post update date from git and link to the source on GitHub`.

### Task 5: Mermaid diagrams + image zoom

**Files:**
- Create: `src/plugins/mermaid.ts`: `satteriMermaidPlugin(): MdastPluginDefinition`. It turns `code` nodes with `lang === "mermaid"` into an `html` node `<pre class="mermaid">{escaped source}</pre>`. Follow the shape of `satteriUnwrapImagesPlugin` in `src/plugins/satteri.ts`.
- Modify: `astro.config.ts` (register it **first** in `mdastPlugins`, so Expressive Code never sees the block)
- Create: `src/components/blog/PostEnhancements.astro`: one `<script>` that does `if (document.querySelector("pre.mermaid")) { const m = (await import("mermaid")).default; m.initialize({ startOnLoad: false, theme: dark ? "dark" : "default" }); await m.run(); }`, and lazy-loads `medium-zoom` on `.prose img` with `background: var(--color-global-bg)`.
- Modify: `src/layouts/BlogPost.astro` (include the component)
- Modify: `package.json` (`mermaid`, `medium-zoom`)

- [ ] **Step 1:** Temp post with a ` ```mermaid ` `graph TD; A-->B` block and one image (`public/social-card.png` works as `/social-card.png`).
- [ ] **Step 2:** Implement the plugin and the component.
- [ ] **Step 3: Verify:** `npm run build`; the temp post HTML contains `<pre class="mermaid">` and no `expressive-code` frame around it; the real post's JS chunk list does not include mermaid (only a dynamic import chunk). In Chrome on `npm run dev`: the diagram renders as SVG in both themes, and clicking the image zooms it. Delete the temp post.
- [ ] **Step 4: Commit** `Render Mermaid diagrams and zoom images in posts`.

### Task 6: Random post page

**Files:**
- Create: `src/views/RandomPost.astro` (props `lang`), plus `src/pages/fr/random.astro` and `src/pages/en/random.astro` wrappers
- Modify: `astro.config.ts` sitemap `filter` (also exclude `/random/`)
- Modify: `src/views/PostsList.astro` (link `<T fr="Un article au hasard" en="Random post" />` next to the RSS icon)

- [ ] **Step 1:** View sets `Astro.locals.uiLang = lang`, `meta.noindex = true`, embeds `JSON.stringify(posts.map(postUrl))` in an inline script that does `location.replace(urls[Math.floor(Math.random() * urls.length)])`. Fallback text with a link to the posts list (no JS, or no posts).
- [ ] **Step 2: Verify:** build; `dist/fr/random/index.html` contains the real post URL and `noindex`; `dist/en/random/index.html` has an empty list and shows the fallback; neither appears in the sitemap.
- [ ] **Step 3: Commit** `Add a random post page per language`.

### Task 7: Activity heatmap on the home page

**Files:**
- Create: `src/utils/activity.ts` + tests in `src/utils/activity.test.ts`
- Create: `src/components/ActivityHeatmap.astro`
- Modify: `src/views/Home.astro` (between the intro and "Derniers articles")

**Interfaces:**
- Produces: `buildActivityWeeks(dates: Date[], end: Date, weeks = 53): { date: string; count: number }[][]`: columns of 7 days (Monday first), the last column contains `end`, dates as `YYYY-MM-DD` in UTC, days after `end` omitted from the last column.

- [ ] **Step 1: Failing tests:** total cells = `(weeks-1)*7 + daysSinceMonday(end)+1`; two posts on one day → count 2 on that cell; a date older than the window is ignored; first cell is a Monday.
- [ ] **Step 2:** `npm test` → FAIL. **Step 3:** implement. **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Component: CSS grid of small squares (`grid-auto-flow: column`, 7 rows). Colour levels 0/1/2/3+ use the accent colour with opacities. Each square has `title="{date} : {n} article(s)"` via `<T>`. Heading `<T fr="Activité" en="Activity" />` and a total `<T fr={`${n} articles cette année`} en={`${n} posts this year`} />`. Use `getAllPosts(lang)` and build time as `end`. The daily rebuild (Task 3) keeps it fresh. Horizontal scroll inside the component on narrow screens, never the page.
- [ ] **Step 6: Verify** in Chrome (`/fr/` and `/en/`, light and dark, 375 px width). **Commit** `Add an activity heatmap to the home page`.

### Task 8: Giscus comments + Cloudflare Web Analytics

**Files:**
- Modify: `src/site.config.ts`: `giscus: { repo: "Becold/til.romainmarbaix.be", repoId: "", category: "Comments", categoryId: "" }` and `cloudflareAnalyticsToken: ""` (types in `src/types.ts`)
- Create: `src/components/blog/Comments.astro`
- Create: `src/components/Analytics.astro`
- Modify: `src/layouts/BlogPost.astro` (Comments after related posts), `src/layouts/Base.astro` (Analytics at the end of `<body>`, production only)

- [ ] **Step 1:** `Comments.astro` renders nothing if `repoId` or `categoryId` is empty. Otherwise the giscus `<script src="https://giscus.app/client.js">` with `data-mapping="pathname"`, `data-lang={lang}`, `data-loading="lazy"`, `data-theme` from `<html data-theme>`. A small script posts `{ giscus: { setConfig: { theme } } }` to the iframe on the theme toggle's `theme-change` event.
- [ ] **Step 2:** `Analytics.astro` renders the Cloudflare beacon only when the token is set and `import.meta.env.PROD`: `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={JSON.stringify({ token })}></script>`.
- [ ] **Step 3: Fill the IDs** (needs the user):
  - Enable Discussions: `gh api -X PATCH repos/Becold/til.romainmarbaix.be -F has_discussions=true`.
  - The user installs the giscus GitHub App on the repo (https://github.com/apps/giscus) and creates or chooses a category.
  - Get the IDs: `gh api graphql -f query='{ repository(owner:"Becold", name:"til.romainmarbaix.be") { id discussionCategories(first:20) { nodes { id name } } } }'`.
  - The user creates a Web Analytics site in Cloudflare and gives the token.
  - Until then, the code ships with empty values and renders nothing.
- [ ] **Step 4: Verify:** with empty values, `dist` has no `giscus` and no `cloudflareinsights`. With temporary dummy values, both scripts appear in the right places (post pages only for giscus). Restore the real or empty values.
- [ ] **Step 5: Commit** `Add Giscus comments and Cloudflare Web Analytics (configurable)`.

### Task 9: `llms.txt` + CI link check

**Files:**
- Create: `src/pages/llms.txt.ts` (GET, `text/plain; charset=utf-8`)
- Modify: `.github/workflows/deploy.yml` (step after Build: `lycheeverse/lychee-action@v2` with `args: --offline --no-progress --root-dir ${{ github.workspace }}/dist 'dist/**/*.html'`, `fail: true`)
- Modify: `CLAUDE.md` (features overview: helpers, config keys to fill, `npm test`), and the `astro-i18n-blog` skill's `references/architecture.md`, "Optional features" section, one line each

- [ ] **Step 1:** `llms.txt` format: `# {siteConfig.title}`, `> {description}`, then `## English` and `## Français` sections, each line `- [title](absolute url): description`, newest first, from `getAllPosts(lang)`.
- [ ] **Step 2: Verify:** `npm run build`; `dist/llms.txt` lists the real post under Français with an absolute `https://til.romainmarbaix.be/fr/posts/...` URL. Run lychee locally only if installed; otherwise rely on the CI run.
- [ ] **Step 3: Commit** `Add llms.txt and check internal links in CI`, push, and watch the run: `gh run watch -R Becold/til.romainmarbaix.be --exit-status`. Fix broken links if lychee reports any.

---

## Done when

- `npm test`, `npm run build` and the GitHub Actions run all pass after the final push.
- https://til.romainmarbaix.be/fr/ shows the heatmap; the real post shows the edit link. The other features can be seen with temp posts in dev.
- The user is told what still needs them: giscus app install + category, Cloudflare token.
