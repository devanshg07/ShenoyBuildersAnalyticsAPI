import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

export async function testSupabase() {
  const { data, error } = await supabase
    .from("monthly_analytics")
    .select("*")
    .limit(1);

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return data;
}

export async function saveMonthlyAnalytics(
  month: string,
  visitors: number,
  pageviews: number
) {
  const { data, error } = await supabase
    .from("monthly_analytics")
    .upsert(
      {
        month,
        visitors,
        pageviews,
      },
      {
        onConflict: "month",
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return data;
}

export async function getMonthlyAnalytics() {
  const { data, error } = await supabase
    .from("monthly_analytics")
    .select("month, visitors, pageviews")
    .order("month", { ascending: true });

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return data;
}