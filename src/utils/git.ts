import { execFileSync } from "node:child_process";

const cache = new Map<string, Date | undefined>();

/**
 * Date of the last commit touching `filePath` (relative to the repo root).
 * Undefined when git is missing, the file is untracked, or the history is not available.
 * CI needs a full clone (`fetch-depth: 0`), otherwise every file gets the last commit's date.
 */
export function getGitLastModified(filePath: string): Date | undefined {
	if (cache.has(filePath)) return cache.get(filePath);
	let date: Date | undefined;
	try {
		const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", filePath], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
		date = out ? new Date(out) : undefined;
	} catch {
		date = undefined;
	}
	cache.set(filePath, date);
	return date;
}
