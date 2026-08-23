import "dotenv/config";
import { getVisitorCount } from "../services/vercel.js";
import { saveMonthlyAnalytics } from "../services/supabase.js";

async function test() {
  try {
    console.log("Fetching Vercel analytics...");

    const now = new Date();

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const since = thirtyDaysAgo.toISOString();
    const until = now.toISOString();

    const analytics = await getVisitorCount(
      since,
      until
    );

    const visitors = analytics.data.visitors;
    const pageviews = analytics.data.pageviews;

    console.log("\nVercel analytics:");
    console.log(`Since: ${since}`);
    console.log(`Until: ${until}`);
    console.log(`Visitors: ${visitors}`);
    console.log(`Pageviews: ${pageviews}`);

    console.log("\nSaving to Supabase...");
    console.log("Month: 2026-08");

    const result = await saveMonthlyAnalytics(
      "2026-08",
      visitors,
      pageviews
    );

    console.log("\nSuccessfully saved:");
    console.log(result);
  } catch (error) {
    console.error("\nTest failed:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exit(1);
  }
}

test();