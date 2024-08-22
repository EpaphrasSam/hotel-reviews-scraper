# Hotel Reviews Scraper

## 🌟 Highlights

- Scrapes hotel reviews from multiple platforms including Airbnb, Booking.com, Expedia, and TripAdvisor
- Utilizes Puppeteer for direct web scraping and Apify actors for platforms with complex structures
- Exports data in CSV format for easy analysis
- Built with TypeScript and Express.js for a robust and maintainable codebase

## ℹ️ Overview

This Hotel Reviews Scraper is a powerful web scraping tool designed to extract hotel reviews from popular booking platforms. It provides valuable insights into customer experiences across multiple sites, allowing for comprehensive analysis of hotel performance and guest satisfaction.

### 😊 Why use this scraper?

- **Multi-Platform Support**: Get a holistic view of hotel reviews by scraping from Airbnb, Booking.com, Expedia, and TripAdvisor.
- **Efficient Data Extraction**: Utilizes modern web scraping techniques to gather reviews quickly and reliably.
- **Structured Data Output**: All scraped data is neatly organized and exported to CSV, making it easy to analyze or import into other tools.
- **Customizable**: Easily configure search parameters and set maximum review limits to suit your needs.

### ✍️ Author

This project was created to streamline the process of gathering hotel reviews for analysis. As someone passionate about data-driven decision making in the hospitality industry, I saw the need for a tool that could aggregate reviews from multiple sources efficiently.

## 🚀 Usage

To start scraping reviews:

1. Clone the repository
2. Install dependencies with `npm install`
3. Run the scraper with `npm start`

The scraper will output a CSV file with the collected reviews.

## ⬇️ Installation

bash
git clone https://github.com/yourusername/hotel-reviews-scraper.git
cd hotel-reviews-scraper
npm install

Ensure you have Node.js (version 14 or higher) installed on your system.

## 🛠️ Configuration

1. Create a `.env` file in the root directory of the project.
2. Add the following environment variables:
   PORT=3500
   APIFY_API_KEY=your_apify_api_key
   BROWSER_WS_ENDPOINT=your_browser_ws_endpoint
   DATABASE_URL=your_database_url

Replace the placeholder values with your actual credentials.

## 📊 Features

- **Airbnb Scraping**: Utilizes Puppeteer for direct web scraping of Airbnb listings and reviews.
- **Booking.com, Expedia, and TripAdvisor Scraping**: Leverages Apify actors for efficient data extraction from these platforms.
- **CSV Export**: Saves scraped data in a structured CSV format for easy analysis.
- **Customizable Search Parameters**: Allows setting of location, maximum review count, and other search criteria.
- **Error Handling**: Implements comprehensive error handling for reliable scraping operations.
- **Database Integration**: Uses Prisma ORM for potential data persistence (setup required).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/hotel-reviews-scraper/issues) if you want to contribute.

## 📝 License

This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.

## 🙏 Acknowledgements

- [Puppeteer](https://pptr.dev/) for Airbnb scraping
- [Apify](https://apify.com/) for Booking.com, Expedia, and TripAdvisor scraping
- [Express.js](https://expressjs.com/) for the web server framework
- [Prisma](https://www.prisma.io/) for database ORM

## 📞 Contact

Isaac Epaphras Nana Sam - isinesam@gmailcom

Project Link: [https://github.com/EpaphrasSam/hotel-reviews-scraper](https://github.com/EpaphrasSam/hotel-reviews-scraper)
