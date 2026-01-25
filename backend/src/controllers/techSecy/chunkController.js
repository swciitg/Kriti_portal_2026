import fs from "fs";
import path from "path";

const CHUNKS_DIR = path.join(process.cwd(), "uploads", "chunks");
const FINAL_DIR = path.join(process.cwd(), "uploads", "final");

if (!fs.existsSync(CHUNKS_DIR)) fs.mkdirSync(CHUNKS_DIR, { recursive: true });
if (!fs.existsSync(FINAL_DIR)) fs.mkdirSync(FINAL_DIR, { recursive: true });

export const uploadChunk = async (req, res) => {
  try {
    const { fileName, chunkIndex, totalChunks } = req.body;
    console.log(
      `User ${req.user._id} uploaded chunk ${chunkIndex}/${totalChunks} of ${fileName}`,
    );
    if (Number(chunkIndex) === Number(totalChunks) - 1) {
        console.log("Chunks in folder:", fs.readdirSync(CHUNKS_DIR));
      const finalFilePath = await mergeChunks(
        req.user._id,
        fileName,
        totalChunks,
      );
      return res.json({
        message: "Upload complete",
        filePath: finalFilePath,
      });
    }
    return res.status(200).json({ message: "Chunk uploaded" });
  } catch (err) {
    console.error("Chunk upload failed:", err);
    return res.status(500).json({ error: "Chunk upload failed" });
  }
};

async function mergeChunks(userId, fileName, totalChunks) {
  const safeFileName = `${userId}_${fileName}`;
  const finalPath = path.join(FINAL_DIR, safeFileName);
  const writeStream = fs.createWriteStream(finalPath);

  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(CHUNKS_DIR, `${safeFileName}.part_${i}`);

    await new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(chunkPath);
      readStream.on("error", reject);
      readStream.on("end", () => {
        fs.unlinkSync(chunkPath);
        resolve();
      });
      readStream.pipe(writeStream, { end: false });
    });
  }
  writeStream.end();
  console.log("Merged file:", finalPath);

  return finalPath;
}