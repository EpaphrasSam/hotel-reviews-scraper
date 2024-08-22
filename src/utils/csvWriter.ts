import * as fs from "fs";
import * as path from "path";

export const saveToCSV = async (
  data: any[],
  headers: string[],
  filename: string
) => {
  const headerRow = headers.join(",") + "\n";
  let csvContent = headerRow;

  data.forEach((item) => {
    const row =
      headers.map((header) => escapeCSV(item[header] || "")).join(",") + "\n";
    csvContent += row;
  });

  // Write to file with UTF-8 BOM
  const filePath = path.resolve(filename);
  const BOM = "\uFEFF";
  fs.writeFileSync(filePath, BOM + csvContent, { encoding: "utf8" });
};

// Helper function to escape special characters and wrap in quotes
function escapeCSV(str: string): string {
  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("'") ||
    str.includes("\n")
  ) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}
