// src/utils/cleanupOrphanedFiles.js
import TempFileUpload from '../model/tempFileUpload.js';
import PS from '../model/ps.js';
import fs from 'fs';

export async function cleanupOrphanedFiles() {
  try {
    const now = new Date();
    
    // Find all PS and their deadlines
    const allPS = await PS.find({}).select('_id submissionDeadline midEvalSubmissionDeadline midEvalExist');
    
    for (const ps of allPS) {
      // Cleanup orphaned final submission temp files
      if (ps.submissionDeadline < now) {
        const orphanedFinalFiles = await TempFileUpload.find({
          psId: ps._id,
          midEval: false,
          isUsed: false,
        });

        console.log(`Found ${orphanedFinalFiles.length} orphaned final files for PS: ${ps._id}`);

        for (const file of orphanedFinalFiles) {
          // Delete from filesystem
          if (fs.existsSync(file.filePath)) {
            fs.unlinkSync(file.filePath);
          }

          // Delete DB record
          await TempFileUpload.deleteOne({ _id: file._id });
        }
      }

      // Cleanup orphaned mid-eval temp files
      if (ps.midEvalExist && ps.midEvalSubmissionDeadline < now) {
        const orphanedMidFiles = await TempFileUpload.find({
          psId: ps._id,
          midEval: true,
          isUsed: false,
        });

        console.log(`Found ${orphanedMidFiles.length} orphaned mid-eval files for PS: ${ps._id}`);

        for (const file of orphanedMidFiles) {
          // Delete from filesystem
          if (fs.existsSync(file.filePath)) {
            fs.unlinkSync(file.filePath);
          }

          // Delete DB record
          await TempFileUpload.deleteOne({ _id: file._id });
        }
      }
    }

    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}
