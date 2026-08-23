const BASE_URL =
  "https://api.vercel.com/v1/query/web-analytics";

export async function getVisitorCount(
  since?: string,
  until?: string
) {
  const params = new URLSearchParams({
    projectId: process.env.VERCEL_PROJECT_ID!,
  });

  if (process.env.VERCEL_TEAM_ID) {
    params.set("teamId", process.env.VERCEL_TEAM_ID);
  }

  if (since) {
    params.set("since", since);
  }

  if (until) {
    params.set("until", until);
  }

  const response = await fetch(
    `${BASE_URL}/visits/count?${params}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Vercel API error ${response.status}: ${error}`
    );
  }

  return response.json();
}