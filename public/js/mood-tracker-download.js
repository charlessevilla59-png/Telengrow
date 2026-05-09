
/**
 * Download face-api models
 */
async function downloadModels() {
  const btn = document.getElementById('download-models-btn');
  const progressDiv = document.getElementById('download-progress');
  const progressText = document.getElementById('progress-text');
  const progressBar = document.getElementById('progress-bar');
  
  if (!btn) return;
  
  try {
    btn.disabled = true;
    btn.textContent = 'Downloading...';
    progressDiv.classList.remove('hidden');
    
    console.log('📥 Triggering model download...');
    
    const response = await fetch('/api/models/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Models downloaded successfully');
      progressText.textContent = 'Download complete!';
      progressBar.style.width = '100%';
      
      // Hide the download section after success
      setTimeout(() => {
        const section = document.getElementById('model-download-section');
        if (section) section.classList.add('hidden');
        safeAlert('✅ Models downloaded! Please refresh the page.', 'success');
        
        // Reload page to use new models
        setTimeout(() => window.location.reload(), 2000);
      }, 2000);
    } else {
      console.error('❌ Download failed:', data.error);
      safeAlert('❌ Download failed: ' + (data.error || 'Unknown error'), 'error');
      btn.disabled = false;
      btn.textContent = 'Download Models';
      progressDiv.classList.add('hidden');
    }
    
  } catch (error) {
    console.error('❌ Download request failed:', error);
    safeAlert('❌ Download failed: ' + error.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Download Models';
    progressDiv.classList.add('hidden');
  }
}

/**
 * Check if models are available and show download prompt if needed
 */
async function checkModelsStatus() {
  try {
    const response = await fetch('/api/models/status');
    const status = await response.json();
    
    console.log('📊 Model status:', status);
    
    // Show download section if models not ready
    const downloadSection = document.getElementById('model-download-section');
    if (!status.ready && downloadSection) {
      downloadSection.classList.remove('hidden');
      console.warn('⚠️  Models not ready. Download section visible.');
    }
    
  } catch (error) {
    console.error('Failed to check model status:', error);
  }
}

// Check models status on page load
document.addEventListener('DOMContentLoaded', () => {
  // Check models after a short delay to avoid blocking other initialization
  setTimeout(checkModelsStatus, 1000);
});
