import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODELS_DIR = path.join(__dirname, '..', 'public', 'models');

// Try multiple sources - correct repository is justadudewhohacks/face-api.js
const MODEL_URLS = {
  'face_landmark_68_model-shard1': [
    'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1',
    'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/face_landmark_68_model-shard1',
  ],
  'face_expression_model-shard1': [
    'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1',
    'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/face_expression_model-shard1',
  ],
  'tiny_face_detector_model-shard1': [
    'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1',
    'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/tiny_face_detector_model-shard1',
  ],
  'face_landmark_68_model-weights_manifest.json': [
    'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json',
  ],
  'face_expression_model-weights_manifest.json': [
    'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json',
  ],
  'tiny_face_detector_model-weights_manifest.json': [
    'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json',
  ],
};
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';

const MODEL_FILES = [
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1',
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
];

/**
 * Download file trying multiple URLs with retry logic
 */
async function downloadFileWithMultipleUrls(urlsToTry, filePath, maxRetries = 3) {
  let lastError = null;
  
  for (let urlIndex = 0; urlIndex < urlsToTry.length; urlIndex++) {
    const url = urlsToTry[urlIndex];
    try {
      await downloadFileWithRetry(url, filePath, maxRetries);
      return; // Success
    } catch (error) {
      lastError = error;
      console.log(`      → URL ${urlIndex + 1} failed: ${error.message}`);
      // Continue to next URL
    }
  }
  
  // All URLs failed
  throw lastError || new Error('All download URLs failed');
}

/**
 * Download file with retry logic and proper error handling
 */
async function downloadFileWithRetry(url, filePath, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = createWriteStream(filePath);

        const request = protocol.get(url, { timeout: 30000 }, (response) => {
          // Handle redirects
          if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            file.destroy();
            fs.unlinkSync(filePath);
            downloadFileWithRetry(response.headers.location, filePath, maxRetries - attempt)
              .then(resolve)
              .catch(reject);
            return;
          }

          if (response.statusCode !== 200) {
            file.destroy();
            reject(new Error(`HTTP ${response.statusCode}`));
            return;
          }

          response.pipe(file);
          file.on('finish', () => file.close(resolve()));
          file.on('error', (err) => {
            fs.unlink(filePath, () => {});
            reject(err);
          });
        });

        request.on('error', reject);
        request.on('timeout', () => {
          request.destroy();
          fs.unlink(filePath, () => {});
          reject(new Error('Timeout'));
        });
      });
    } catch (error) {
      console.warn(`   Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
      
      // Clean up failed file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

/**
 * Download all face-api models from GitHub
 */
export async function downloadFaceApiModels(onProgress = null) {
  try {
    // Create models directory
    if (!fs.existsSync(MODELS_DIR)) {
      fs.mkdirSync(MODELS_DIR, { recursive: true });
      console.log('✅ Created models directory');
    }

    // Check which files need downloading
    const filesToDownload = MODEL_FILES.filter(
      file => !fs.existsSync(path.join(MODELS_DIR, file))
    );

    if (filesToDownload.length === 0) {
      console.log('✅ All models already downloaded');
      if (onProgress) onProgress({ completed: true, total: MODEL_FILES.length, downloaded: MODEL_FILES.length });
      return true;
    }

    console.log(`\n📥 Downloading ${filesToDownload.length} face-api models...`);
    
    let downloadedCount = 0;
    
    for (const fileName of filesToDownload) {
      // Determine URLs to try
      let urlsToTry = MODEL_URLS[fileName] || [GITHUB_RAW_BASE + fileName];
      const filePath = path.join(MODELS_DIR, fileName);
      
      console.log(`   ⏳ [${downloadedCount + 1}/${filesToDownload.length}] Downloading ${fileName}...`);
      
      try {
        await downloadFileWithMultipleUrls(urlsToTry, filePath);
        
        // Verify file exists and has content
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
          throw new Error('Downloaded file is empty');
        }
        
        downloadedCount++;
        console.log(`   ✅ Downloaded ${fileName} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
        
        if (onProgress) {
          onProgress({
            completed: false,
            total: filesToDownload.length,
            downloaded: downloadedCount,
            currentFile: fileName
          });
        }
      } catch (error) {
        console.error(`   ❌ Failed to download ${fileName}: ${error.message}`);
        // Delete incomplete file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        throw error;
      }
    }

    console.log(`\n✅ Successfully downloaded all ${downloadedCount} model files!`);
    if (onProgress) onProgress({ completed: true, total: filesToDownload.length, downloaded: downloadedCount });
    
    return true;

  } catch (error) {
    console.error('\n❌ Model download failed:', error.message);
    if (onProgress) onProgress({ error: error.message, completed: false });
    return false;
  }
}

/**
 * Get detailed model file info
 */
export function getModelFileInfo() {
  const files = MODEL_FILES.map(fileName => {
    const filePath = path.join(MODELS_DIR, fileName);
    const exists = fs.existsSync(filePath);
    let size = 0;
    
    if (exists) {
      try {
        size = fs.statSync(filePath).size;
      } catch (e) {
        // Ignore
      }
    }
    
    return {
      name: fileName,
      exists,
      size,
      sizeKB: (size / 1024).toFixed(2),
      sizeMB: (size / 1024 / 1024).toFixed(2),
    };
  });

  const downloaded = files.filter(f => f.exists).length;
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return {
    directory: MODELS_DIR,
    ready: downloaded === MODEL_FILES.length,
    downloaded,
    total: MODEL_FILES.length,
    totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
    files,
  };
}
