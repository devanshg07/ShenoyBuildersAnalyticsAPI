import "dotenv/config";
import { getVisitorCount } from "../services/vercel.js";
import { saveMonthlyAnalytics } from "../services/supabase.js";

async function savePreviousMonth() {
  const now = new Date();

  // First day of the current month
  const firstDayCurrentMonth = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      1
    )
  );

  // First day of previous month
  const firstDayPreviousMonth = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() - 1,
      1
    )
  );

  const since = firstDayPreviousMonth.toISOString();
  const until = firstDayCurrentMonth.toISOString();

  const month = `${firstDayPreviousMonth.getUTCFullYear()}-${String(
    firstDayPreviousMonth.getUTCMonth() + 1
  ).padStart(2, "0")}`;

  console.log(`Fetching analytics for ${month}`);
  console.log(`Since: ${since}`);
  console.log(`Until: ${until}`);

  const analytics = await getVisitorCount(
    since,
    until
  );

  const visitors = analytics.data.visitors;
  const pageviews = analytics.data.pageviews;

  console.log(`Visitors: ${visitors}`);
  console.log(`Pageviews: ${pageviews}`);

  const result = await saveMonthlyAnalytics(
    month,
    visitors,
    pageviews
  );

  console.log("Saved to Supabase:");
  console.log(result);
}

savePreviousMonth().catch((error) => {
  console.error("Monthly analytics job failed:", error);
  process.exit(1);
});