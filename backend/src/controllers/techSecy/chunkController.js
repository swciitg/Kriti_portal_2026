import fs from "fs";
import path from "path";
import TempFileUpload from "../../model/tempFileUpload.js";

const CHUNKS_DIR = path.join(process.cwd(), "uploads", "chunks");
const FINAL_DIR = path.join(process.cwd(), "uploads", "temp");

if (!fs.existsSync(CHUNKS_DIR)) fs.mkdirSync(CHUNKS_DIR, { recursive: true });
if (!fs.existsSync(FINAL_DIR)) fs.mkdirSync(FINAL_DIR, { recursive: true });

export const uploadChunk = async (req, res) => {
  try {
    const { fileName, chunkIndex, totalChunks, psId, deliverableName, midEval } = req.body;
    if (!psId || !deliverableName || midEval === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'psId, deliverableName, and midEval are required' 
      });
    }
    const isMid = midEval === true || midEval === 'true';
    // console.log(req.body)
    // console.log(
    //   `User ${req.user._id} uploaded chunk ${chunkIndex}/${totalChunks} of ${fileName}`,
    // );
    if (Number(chunkIndex) === Number(totalChunks) - 1) {

      // taken from the /upload-temp 
      const oldFile = await TempFileUpload.findOne({
          userId:req.user._id,
          psId,
          midEval: isMid,
          deliverableName,
          isUsed: false,
      });

      if (oldFile) {
        // Delete old physical file
        if (fs.existsSync(oldFile.filePath)) {
          fs.unlinkSync(oldFile.filePath);
        }
        // Delete old DB record
        await TempFileUpload.deleteOne({ _id: oldFile._id });
      }

      const {finalFileName , filePath} = await mergeChunks(
        req.user._id,
        fileName,
        totalChunks,
      );

      const tempFileRecord = await TempFileUpload.create({
        psId,
        userId : req.user._id,
        midEval: isMid,
        deliverableName,
        filename: finalFileName,
        originalName: fileName,
        filePath: filePath,
        uploadedAt: new Date(),
        isUsed: false,
      });

      const fileUrl = `/uploads/temp/${finalFileName}`;

      return res.json({
        message: "Upload complete",
        filePath: filePath,
        fileUrl,
        filename: finalFileName,
        originalName: fileName,  
      });
    }
    return res.status(200).json({ message: "Chunk uploaded" });
  } catch (err) {
    // console.error("Chunk upload failed:", err);
    return res.status(500).json({ error: "Chunk upload failed" });
  }
};

async function mergeChunks(userId, fileName, totalChunks) {
  const safeFileName = `${userId}_${fileName}`;

  // this is the filename according to the /upload-temp route
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const ext = path.extname(fileName);
  const finalFileName = `${userId}_${timestamp}_${random}${ext}`;

  const finalPath = path.join(FINAL_DIR, finalFileName);


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
  // console.log("Merged file:", finalPath);
  return {finalFileName , filePath : finalPath};
}