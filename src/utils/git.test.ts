import { describe, expect, it } from "vitest";
import { getGitLastModified } from "./git";

describe("getGitLastModified", () => {
	it("returns the last commit date of a tracked file", () => {
		const date = getGitLastModified("package.json");
		expect(date).toBeInstanceOf(Date);
		expect(Number.isNaN(date?.getTime())).toBe(false);
	});

	it("returns undefined for a file git does not know", () => {
		expect(getGitLastModified("does/not/exist.md")).toBeUndefined();
	});
});
