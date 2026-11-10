import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getGitLastModified } from "./git";

/** Throwaway repo; commits get explicit author and committer dates. */
function makeRepo() {
	const dir = mkdtempSync(join(tmpdir(), "til-git-"));
	const git = (args: string[], env: Record<string, string> = {}) =>
		execFileSync("git", args, { cwd: dir, env: { ...process.env, ...env }, stdio: "ignore" });
	git(["init", "-q"]);
	git(["config", "user.name", "Test"]);
	git(["config", "user.email", "test@example.com"]);
	const commit = (file: string, content: string, author: string, committer: string) => {
		writeFileSync(join(dir, file), content);
		git(["add", file]);
		git(["commit", "-q", "-m", `edit ${file}`], {
			GIT_AUTHOR_DATE: author,
			GIT_COMMITTER_DATE: committer,
		});
	};
	return { dir, commit };
}

describe("getGitLastModified", () => {
	it("returns the author date of the last edit after the first commit", () => {
		const { dir, commit } = makeRepo();
		commit("post.md", "v1", "2026-01-01T10:00:00Z", "2026-01-01T10:00:00Z");
		commit("post.md", "v2", "2026-02-01T10:00:00Z", "2026-03-01T10:00:00Z");
		expect(getGitLastModified("post.md", dir)?.toISOString()).toBe("2026-02-01T10:00:00.000Z");
	});

	it("is undefined when the file was only committed once, even on a later day", () => {
		const { dir, commit } = makeRepo();
		commit("post.md", "v1", "2026-01-05T10:00:00Z", "2026-01-09T10:00:00Z");
		expect(getGitLastModified("post.md", dir)).toBeUndefined();
	});

	it("returns undefined for a file git does not know", () => {
		const { dir, commit } = makeRepo();
		commit("other.md", "x", "2026-01-01T10:00:00Z", "2026-01-01T10:00:00Z");
		expect(getGitLastModified("does/not/exist.md", dir)).toBeUndefined();
	});

	it("returns undefined outside a git repository", () => {
		const dir = mkdtempSync(join(tmpdir(), "til-nogit-"));
		expect(getGitLastModified("post.md", dir)).toBeUndefined();
	});
});
