// src/model/tempFileUpload.js
import mongoose from 'mongoose';

const TempFileUploadSchema = new mongoose.Schema({
  psId: { type: mongoose.Schema.Types.ObjectId, ref: 'PS', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  midEval: { type: Boolean, required: true },
  deliverableName: { type: String, required: true }, // Which deliverable this file is for
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedAt: { type: Date, required: true },
  isUsed: { type: Boolean, default: false }, // marked true when form submitted
});

// Index for cleanup queries
TempFileUploadSchema.index({ psId: 1, isUsed: 1 });
TempFileUploadSchema.index({ userId: 1, psId: 1, midEval: 1, deliverableName: 1 });

export default mongoose.model('TempFileUpload', TempFileUploadSchema);
