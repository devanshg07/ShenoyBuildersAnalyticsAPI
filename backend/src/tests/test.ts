import "dotenv/config";
import { getVisitorCount } from "../services/vercel.js";
import { saveMonthlyAnalytics } from "../services/supabase.js";

async function test() {
  try {
    console.log("Fetching Vercel analytics...");

    const analytics = await getVisitorCount();

    console.log("Vercel analytics:");
    console.log(`Visitors: ${analytics.data.visitors}`);
    console.log(`Pageviews: ${analytics.data.pageviews}`);

    console.log("\nSaving to Supabase...");

    const result = await saveMonthlyAnalytics(
      "2026-08",
      analytics.data.visitors,
      analytics.data.pageviews
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