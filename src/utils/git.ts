import { execFileSync } from "node:child_process";

const cache = new Map<string, Date | undefined>();

/**
 * When `filePath` (relative to the repo root) was last edited, according to git.
 * - Uses the author date (%aI): it survives rebases and squash merges, unlike the committer date.
 * - Undefined when the file has a single commit: creating a post is not an update,
 *   even if it was committed days after its publishDate.
 * - Undefined when git is missing, the file is untracked, or the history is not available.
 * CI needs a full clone (`fetch-depth: 0`), otherwise every file looks like it has one commit.
 */
export function getGitLastModified(filePath: string, cwd: string = process.cwd()): Date | undefined {
	const key = `${cwd}::${filePath}`;
	if (cache.has(key)) return cache.get(key);
	let date: Date | undefined;
	try {
		const dates = execFileSync("git", ["log", "-2", "--format=%aI", "--", filePath], {
			cwd,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		})
			.trim()
			.split("\n")
			.filter(Boolean);
		date = dates.length >= 2 && dates[0] ? new Date(dates[0]) : undefined;
	} catch {
		date = undefined;
	}
	cache.set(key, date);
	return date;
}
