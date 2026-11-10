import { describe, expect, it } from "vitest";
import { buildActivityWeeks } from "./activity";

// 2026-11-10 is a Tuesday: the last column has Monday and Tuesday
const end = new Date("2026-11-10T12:00:00Z");

describe("buildActivityWeeks", () => {
	it("covers full weeks up to the end day", () => {
		const weeks = buildActivityWeeks([], end, 53);
		expect(weeks).toHaveLength(53);
		expect(weeks.flat()).toHaveLength(52 * 7 + 2);
		expect(weeks.at(-1)?.at(-1)?.date).toBe("2026-11-10");
	});

	it("starts on a Monday", () => {
		const first = buildActivityWeeks([], end, 53)[0]?.[0]?.date ?? "";
		expect(new Date(`${first}T00:00:00Z`).getUTCDay()).toBe(1);
	});

	it("counts posts per day", () => {
		const dates = [new Date("2026-11-09"), new Date("2026-11-09T18:00:00Z"), new Date("2026-11-10")];
		const cells = buildActivityWeeks(dates, end, 53).flat();
		expect(cells.find((c) => c.date === "2026-11-09")?.count).toBe(2);
		expect(cells.find((c) => c.date === "2026-11-10")?.count).toBe(1);
	});

	it("ignores dates outside the window", () => {
		const cells = buildActivityWeeks([new Date("2020-01-01"), new Date("2027-01-01")], end, 53).flat();
		expect(cells.reduce((sum, c) => sum + c.count, 0)).toBe(0);
	});
});
