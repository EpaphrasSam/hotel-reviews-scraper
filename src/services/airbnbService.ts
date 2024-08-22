import * as puppeteer from "puppeteer";
import * as fs from "fs";
import * as path from "path";
import { saveToCSV } from "../utils/csvWriter";

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

export const scrapeAirbnbService = async (): Promise<ListingDetails[]> => {
  const browser = await puppeteer.launch({ headless: "new" as any });
  // const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const listingDetails: ListingDetails[] = [];

  try {
    await page.goto(AIRBNB_URL, { waitUntil: "networkidle2" });
    await randomDelay();

    console.log("Navigating to Airbnb URL:", AIRBNB_URL);

    const listings = await scrapeListings(page);
    console.log("Number of hotels found:", listings.length);

    for (const listing of listings) {
      if (listing.name && listing.title) {
        console.log("Scraping hotel:", listing.name);
        const details = await scrapeListingDetails(page, listing as Listing);
        listingDetails.push(details);
        await randomDelay();
      }
    }

    // Prepare data for CSV
    const csvData = listingDetails.flatMap((listing) => {
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
    throw error;
  } finally {
    await browser.close();
  }
};

async function scrapeListingDetails(
  page: puppeteer.Page,
  listing: Listing
): Promise<ListingDetails> {
  // Navigate to the listing page
  await page.goto(listing.url, { waitUntil: "networkidle0" });

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

async function scrapeReviews(
  page: puppeteer.Page,
  listing: Listing
): Promise<Review[]> {
  // Construct the reviews URL
  const reviewsUrl = new URL(listing.url);
  reviewsUrl.pathname += "/reviews";

  // Navigate to the reviews page
  await page.goto(reviewsUrl.toString(), { waitUntil: "networkidle0" });

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

async function scrapeListings(page: puppeteer.Page) {
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
        name: nameElement ? nameElement.textContent?.trim() : "Unknown",
        title: titleElement ? titleElement.textContent?.trim() : "Unknown",
        url: (item as HTMLAnchorElement).href,
        rating: ratingElement
          ? ratingElement.textContent?.split(" ")[0]
          : "N/A",
      };
    });
  });
  return listings;
}

function randomDelay(): Promise<void> {
  const delay = Math.floor(Math.random() * (5000 - 2000 + 1) + 2000); // Random delay between 2-5 seconds
  return new Promise((resolve) => setTimeout(resolve, delay));
}
