/** One day of the activity heatmap. */
export interface ActivityDay {
	/** YYYY-MM-DD, UTC */
	date: string;
	count: number;
}

const DAY = 24 * 60 * 60 * 1000;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Columns of 7 days (Monday first) ending with the week of `end`, like GitHub's contribution graph.
 * The last column stops at `end`. Dates outside the window are ignored.
 */
export function buildActivityWeeks(dates: Date[], end: Date, weeks = 53): ActivityDay[][] {
	const counts = new Map<string, number>();
	for (const d of dates) counts.set(isoDay(d), (counts.get(isoDay(d)) ?? 0) + 1);

	const endDay = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
	const sinceMonday = (new Date(endDay).getUTCDay() + 6) % 7;
	const start = endDay - (sinceMonday + (weeks - 1) * 7) * DAY;

	const columns: ActivityDay[][] = [];
	for (let t = start; t <= endDay; t += DAY) {
		const index = Math.floor((t - start) / (7 * DAY));
		const date = isoDay(new Date(t));
		(columns[index] ??= []).push({ date, count: counts.get(date) ?? 0 });
	}
	return columns;
}
