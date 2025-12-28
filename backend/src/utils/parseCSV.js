import fs from "fs";
import path from "path";

export function parseCSV(fileName) {
  const filePath = path.join(__dirname, "../../uploads/csv", fileName);
  const csvData = fs.readFileSync(filePath, "utf-8");

  const lines = csvData.trim().split("\n");
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const [hostelCode, date, time] = lines[i]
      .split(",")
      .map(v => v.trim());

    result.push({
      hostelCode,
      date,
      time
    });
  }

  return result;
}
