import { ApifyClient } from "apify-client";

// Initialize the ApifyClient with your API token
const client = new ApifyClient({
  token: process.env.APIFY_API_KEY,
});

export const runApifyActor = async (
  actorId: string,
  runInput: Record<string, any>
) => {
  try {
    console.log(`Starting scraping using Apify actor: ${actorId}`);
    const run = await client.actor(actorId).call(runInput);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`Scraped ${items.length} items using Apify actor: ${actorId}`);
    return items;
  } catch (error) {
    console.error(`Error in Apify actor run (${actorId}):`, error);
    throw error;
  }
};
