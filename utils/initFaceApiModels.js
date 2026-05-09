import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODELS_DIR = path.join(__dirname, '..', 'public', 'models');

// Model files to download
const MODEL_FILES = [
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-weights.bin',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-weights.bin',
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-weights.bin',
];

// CDN sources to try (in order of preference)
const CDN_SOURCES = [
  {
    name: 'unpkg.com',
    base: 'https://unpkg.com/face-api.js@0.22.2/dist/models/',
  },
  {
    name: 'github raw',
    base: 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/',
  },
  {
    name: 'jsdelivr unpkg',
    base: 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/models/',
  },
];

/**
 * Download a single file from URL with retry logic
 */
function downloadFile(url, filePath, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const request = protocol.get(url, { timeout }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirects
        downloadFile(response.headers.location, filePath, timeout)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
        return;
      }

      const file = fs.createWriteStream(filePath);
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });

      file.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete incomplete file
        reject(err);
      });
    });

    request.on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete incomplete file
      reject(err);
    });

    request.on('timeout', () => {
      request.destroy();
      fs.unlink(filePath, () => {}); // Delete incomplete file
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Get model download status
 */
export function getModelStatus() {
  try {
    const files = MODEL_FILES.map(file => ({
      name: file,
      exists: fs.existsSync(path.join(MODELS_DIR, file)),
      path: path.join(MODELS_DIR, file),
    }));
    
    const total = files.length;
    const downloaded = files.filter(f => f.exists).length;
    
    return {
      ready: downloaded === total,
      downloaded,
      total,
      progress: `${downloaded}/${total}`,
      files,
      directory: MODELS_DIR,
    };
  } catch (error) {
    return {
      ready: false,
      error: error.message,
      directory: MODELS_DIR,
    };
  }
}

/**
 * Initialize face-api models by downloading if needed
 */
export async function initializeFaceApiModels() {
  try {
    // Create models directory if it doesn't exist
    if (!fs.existsSync(MODELS_DIR)) {
      fs.mkdirSync(MODELS_DIR, { recursive: true });
      console.log('✅ Created models directory:', MODELS_DIR);
    }

    // Check which files are missing
    const missingFiles = MODEL_FILES.filter(
      (file) => !fs.existsSync(path.join(MODELS_DIR, file))
    );

    if (missingFiles.length === 0) {
      console.log('✅ Face-API models already cached locally');
      console.log(`📁 Models path: file:///${MODELS_DIR.replace(/\\/g, '/')}`);
      return true;
    }

    console.log(`📥 Starting face-api model download...`);
    console.log(`   ${missingFiles.length}/${MODEL_FILES.length} files need downloading`);
    console.log(`   Downloads may take 1-5 minutes depending on connection`);
    console.log(`   Saving to: ${MODELS_DIR}\n`);

    // Try each CDN source
    for (const source of CDN_SOURCES) {
      console.log(`\n🔄 Trying ${source.name}...`);
      let successCount = 0;

      try {
        // Try downloading all files from this source
        for (const file of missingFiles) {
          const url = source.base + file;
          const filePath = path.join(MODELS_DIR, file);

          // Skip if already exists from previous source
          if (fs.existsSync(filePath)) {
            console.log(`   ✅ ${file} (already exists)`);
            successCount++;
            continue;
          }

          try {
            console.log(`   ⏳ ${file}...`);
            await downloadFile(url, filePath);
            console.log(`   ✅ ${file}`);
            successCount++;
          } catch (error) {
            console.error(`   ❌ ${file}: ${error.message}`);
            // Continue to next file, don't stop the whole source
          }
        }

        // If all files downloaded from this source, we're done
        if (successCount === missingFiles.length) {
          console.log(`\n✅ All models downloaded successfully from ${source.name}!`);
          console.log(`   Models location: ${MODELS_DIR}`);
          return true;
        }

        // Partial success - continue to next source for remaining files
        if (successCount > 0) {
          console.log(`   Partial success (${successCount}/${missingFiles.length}) - Trying next source...`);
        }
      } catch (error) {
        console.error(`   ❌ ${source.name} failed: ${error.message}`);
        // Continue to next source
      }
    }

    // Check if any files were downloaded
    const finalMissing = MODEL_FILES.filter(
      (file) => !fs.existsSync(path.join(MODELS_DIR, file))
    );

    if (finalMissing.length === 0) {
      console.log('\n✅ All face-api models available!');
      return true;
    }

    // Some files still missing
    console.error(`\n⚠️  Face-API Model Download Incomplete`);
    console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.error(`Missing ${finalMissing.length}/${MODEL_FILES.length} files:`);
    finalMissing.forEach(f => console.error(`  - ${f}`));
    console.error(`\nWill attempt to use CDN fallback...`);
    return false;

  } catch (error) {
    console.error('❌ Model initialization error:', error.message);
    return false;
  }
}

