import puppeteer from "puppeteer-extra";
import { Page } from "puppeteer";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { saveToCSV } from "../utils/csvWriter";

puppeteer.use(StealthPlugin());

const AIRBNB_URL =
  "https://www.airbnb.com/s/Kumasi--Ashanti-Region--Ghana/homes";
const MAX_REVIEWS = 100;

type Listing = {
  name: string;
  title: string;
  url: string;
  rating: string;
};

type ListingDetails = {
  hotel: string;
  overallRating: string;
  cleanliness: string;
  accuracy: string;
  communication: string;
  location: string;
  checkin: string;
  value: string;
  reviews: Review[];
};

type Review = {
  rating: string;
  date: string;
  stayDuration: string;
  content: string;
  reviewer: string;
};

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
];

export const scrapeAirbnbService = async (): Promise<ListingDetails[]> => {
  const browser = await puppeteer.launch({
    headless: Math.random() > 0.5 ? ("new" as any) : false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  const listingDetails: ListingDetails[] = [];
  const allListings: Listing[] = []; // Declare allListings here

  try {
    const randomUserAgent =
      userAgents[Math.floor(Math.random() * userAgents.length)];
    await page.setUserAgent(randomUserAgent);

    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://www.airbnb.com",
    });

    let currentPage = 1;
    let currentUrl = AIRBNB_URL;

    while (true) {
      await page.goto(currentUrl, { waitUntil: "networkidle2" });
      await randomDelay();

      console.log(
        `Navigating to Airbnb URL (Page ${currentPage}):`,
        currentUrl
      );

      const pageListings = await scrapeListings(page);
      allListings.push(...pageListings);
      console.log(
        `Number of hotels found on page ${currentPage}:`,
        pageListings.length
      );

      // Try to find the next button, but don't throw an error if it's not found
      const nextButton = await page.$('a[aria-label="Next"]');

      if (!nextButton) {
        console.log("No more pages to scrape. Reached the last page.");
        break;
      }

      const nextPageUrl = await nextButton.evaluate((el) => el.href);

      if (!nextPageUrl) {
        console.log("Unable to find next page URL. Stopping pagination.");
        break;
      }

      currentUrl = nextPageUrl;
      currentPage++;
      await randomDelay(); // Add random delay before navigating to the next page
    }

    console.log(`Total number of listings found: ${allListings.length}`);

    // Now scrape details for each listing
    for (let i = 0; i < allListings.length; i++) {
      const listing = allListings[i];
      if (listing.name && listing.title) {
        console.log(
          `Scraping hotel ${i + 1}/${allListings.length}: ${listing.name}`
        );
        try {
          const details = await scrapeListingDetails(page, listing);
          listingDetails.push(details);
          await randomDelay();
        } catch (error) {
          console.error(
            `Error scraping hotel ${i + 1}: ${listing.name}`,
            error
          );
          // Save progress before moving to the next listing
          await saveProgress(listingDetails, i + 1, allListings.length);
        }
      }
    }

    // Prepare data for CSV
    const csvData = prepareCsvData(listingDetails);

    // Define headers
    const headers = [
      "Hotel",
      "Overall Rating",
      "Cleanliness",
      "Accuracy",
      "Communication",
      "Location",
      "Check-in",
      "Value",
      "Review Rating",
      "Review Date",
      "Stay Duration",
      "Review Content",
      "Reviewer",
    ];

    // Save to CSV
    await saveToCSV(csvData, headers, "airbnb_listings.csv");

    console.log("Scraping completed successfully");

    return listingDetails;
  } catch (error) {
    console.error("Error in scrapeAirbnbService:", error);
    // Save progress before throwing the error
    await saveProgress(
      listingDetails,
      listingDetails.length,
      allListings.length
    );
    throw error;
  } finally {
    await browser.close();
  }
};

// New function to save progress
async function saveProgress(
  listingDetails: ListingDetails[],
  current: number,
  total: number
) {
  const csvData = prepareCsvData(listingDetails);
  const headers = [
    "Hotel",
    "Overall Rating",
    "Cleanliness",
    "Accuracy",
    "Communication",
    "Location",
    "Check-in",
    "Value",
    "Review Rating",
    "Review Date",
    "Stay Duration",
    "Review Content",
    "Reviewer",
  ];
  const filename = `airbnb_listings_progress_${current}_of_${
    total || "unknown"
  }.csv`;
  await saveToCSV(csvData, headers, filename);
  console.log(
    `Progress saved: ${current}/${total || "unknown"} listings scraped.`
  );
}

// Function to prepare CSV data (moved out of the main function for reusability)
function prepareCsvData(listingDetails: ListingDetails[]) {
  return listingDetails.flatMap((listing) => {
    const baseRow = {
      Hotel: listing.hotel,
      "Overall Rating": listing.overallRating,
      Cleanliness: listing.cleanliness,
      Accuracy: listing.accuracy,
      Communication: listing.communication,
      Location: listing.location,
      "Check-in": listing.checkin,
      Value: listing.value,
    };

    return listing.reviews.map((review, index) => ({
      ...baseRow,
      "Review Rating": review.rating,
      "Review Date": review.date,
      "Stay Duration": review.stayDuration,
      "Review Content": review.content,
      Reviewer: review.reviewer,
      ...(index > 0
        ? {
            Hotel: "",
            "Overall Rating": "",
            Cleanliness: "",
            Accuracy: "",
            Communication: "",
            Location: "",
            "Check-in": "",
            Value: "",
          }
        : {}),
    }));
  });
}

async function scrapeListingDetails(
  page: Page,
  listing: Listing
): Promise<ListingDetails> {
  await page.goto(listing.url, { waitUntil: "networkidle0" });
  await handleCaptcha(page);

  // Extract overall ratings
  const overallRatings = await page.evaluate(() => {
    const ratingCategories = Array.from(document.querySelectorAll(".l925rvg"));
    const ratings: { [key: string]: string } = {};

    ratingCategories.forEach((category) => {
      const name =
        category
          .querySelector(".l1nqfsv9")
          ?.textContent?.trim()
          .toLowerCase() || "N/A";
      const rating =
        category.querySelector("div:last-child")?.textContent || "N/A";
      if (name && rating) {
        ratings[name] = rating;
      }
    });

    return {
      cleanliness: ratings.cleanliness || "N/A",
      accuracy: ratings.accuracy || "N/A",
      communication: ratings.communication || "N/A",
      location: ratings.location || "N/A",
      checkin: ratings["check-in"] || "N/A",
      value: ratings.value || "N/A",
    };
  });

  // Extract reviews
  const reviews = await scrapeReviews(page, listing);

  return {
    hotel: listing.name,
    overallRating: listing.rating || "N/A",
    ...overallRatings,
    reviews,
  };
}

async function scrapeReviews(page: Page, listing: Listing): Promise<Review[]> {
  const reviewsUrl = new URL(listing.url);
  reviewsUrl.pathname += "/reviews";
  await page.goto(reviewsUrl.toString(), { waitUntil: "networkidle0" });
  await handleCaptcha(page);

  try {
    // Wait for the reviews to load with a shorter timeout
    await page.waitForSelector(".r1are2x1", { timeout: 5000 });

    // Extract reviews using Puppeteer's evaluate function
    const reviews = await page.evaluate(() => {
      const reviewElements = document.querySelectorAll(".r1are2x1");
      return Array.from(reviewElements).map((element) => {
        const ratingElement = element.querySelector(".c5dn5hn span");
        const rating = ratingElement
          ? ratingElement.textContent!.match(/Rating, (\d+) stars?/)?.[1] || "0"
          : "0";

        const dateAndDurationElement = element.querySelector(".s78n3tv");
        let date = "";
        let stayDuration = "";
        if (dateAndDurationElement) {
          const textContent = dateAndDurationElement.textContent!.trim();
          const parts = textContent.split("·").map((part) => part.trim());
          date = parts[1] || "";
          stayDuration = parts[2] || "";
        }

        const reviewContent =
          element.querySelector(".r1bctolv span")?.textContent!.trim() || "";

        const reviewerName =
          element.querySelector(".hpipapi")?.textContent!.trim() || "";

        return {
          rating,
          date,
          stayDuration,
          content: reviewContent,
          reviewer: reviewerName,
        };
      });
    });

    return reviews;
  } catch (error) {
    console.log(`No reviews found for listing: ${listing.name}`);
    // Return a single "N/A" review if no reviews are found
    return [
      {
        rating: "N/A",
        date: "N/A",
        stayDuration: "N/A",
        content: "N/A",
        reviewer: "N/A",
      },
    ];
  }
}

async function scrapeListings(page: Page): Promise<Listing[]> {
  const listings = await page.evaluate(() => {
    const items = Array.from(
      document.querySelectorAll(
        "#site-content .l196t2l1 .fifuzsw .c1yo0219 .cy5jw6o a.l1ovpqvx"
      )
    );

    return items.map((item) => {
      const titleElement = item
        .closest(".cy5jw6o")
        ?.querySelector('div[id^="title_"]');
      const nameElement = item.closest(".cy5jw6o")?.querySelector(".t6mzqp7");
      const ratingElement = item
        .closest(".cy5jw6o")
        ?.querySelector(".r4a59j5 span[aria-hidden='true']");
      return {
        name: nameElement?.textContent?.trim() ?? "Unknown",
        title: titleElement?.textContent?.trim() ?? "Unknown",
        url: (item as HTMLAnchorElement).href,
        rating: ratingElement?.textContent?.split(" ")[0] ?? "N/A",
      };
    });
  });
  return listings;
}

function randomDelay(): Promise<void> {
  const delay = Math.floor(Math.random() * (8000 - 3000 + 1) + 3000); // Random delay between 3-8 seconds
  return new Promise((resolve) => setTimeout(resolve, delay));
}

async function handleCaptcha(page: Page): Promise<boolean> {
  const captchaSelector = 'div[class*="captcha"]'; // Adjust this selector based on Airbnb's CAPTCHA implementation
  const isCaptchaPresent = (await page.$(captchaSelector)) !== null;

  if (isCaptchaPresent) {
    console.log("CAPTCHA detected. Waiting for manual solving...");
    await page.waitForNavigation({ timeout: 120000 }); // Wait for 2 minutes or until navigation
    return true;
  }

  return false;
}
