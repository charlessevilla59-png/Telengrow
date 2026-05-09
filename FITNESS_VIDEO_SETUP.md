# Fitness Video Feature - Complete Setup Guide

## Overview
Added full video support to Tellngrow fitness materials, allowing counselors to upload and share workout, meditation, and wellness videos with students.

## Features Implemented

### 1. Database Model Updates
- **Modified**: `models/ReadingMaterialModel.js`
- **Changes**:
  - Added `videoUrl` field (STRING): Stores YouTube embed URLs or video links
  - Added `videoDuration` field (INTEGER): Stores duration in seconds
  - Added 'video' as fileType option in ENUM

### 2. Pre-populated Videos
- **Script**: `create_fitness_videos.js` 
- **Status**: ✅ Successfully executed - 8 videos in database
- **Videos Created**:
  1. 10-Minute Morning Yoga for Stress Relief (600s)
  2. Quick 5-Minute Breathing & Stretching (300s)
  3. 15-Minute Home Workout - No Equipment (900s)
  4. Walking Meditation for Mental Health (1200s)
  5. Dance Cardio for Mood Boost (1080s)
  6. Pilates Core Strength for Better Posture (1200s)
  7. Evening Relaxation Stretches Before Sleep (720s)
  8. HIIT Workout - 20 Minutes Max Intensity (1200s)

### 3. Video Display (User Side)
- **Modified**: `views/reading/article.xian`
- **Changes**:
  - Added video player section using YouTube embed iframe
  - Responsive 16:9 aspect ratio player
  - Video duration display with automatic conversion from seconds to minutes
  - Display only shows when `fileType === 'video'`
  - Styled with blue info box showing duration

### 4. Materials List
- **Modified**: `views/reading/materials.xian`
- **Changes**:
  - Added video icon (🎥) to video materials in list
  - Changed "Read" button to "Watch" for video materials
  - Icon differentiates videos from articles (📝) and documents

### 5. Counselor Upload Interface
- **Modified**: `views/counselor/new-material.xian`
- **Changes**:
  - Added "🎥 Video (YouTube or Video URL)" option to fileType dropdown
  - Added Video URL input field
  - Added Video Duration input field (in seconds)
  - Added JavaScript to display duration in minutes:seconds format
  - Proper form validation for video materials
  - Toggle logic to show video fields only when video type is selected

### 6. Backend Routes
- **Modified**: `routes/index.js` - POST `/counselor/materials/create`
- **Changes**:
  - Handle `videoUrl` and `videoDuration` from request body
  - Validate video materials (require URL and duration)
  - Auto-calculate reading time from video duration (seconds ÷ 60)
  - Proper logging of video material creation
  - Support for all existing file types (article, pdf, document, video)

## How to Use

### For Counselors - Uploading Videos

1. Navigate to `/counselor/materials/new`
2. Select "🎥 Video (YouTube or Video URL)" as Material Type
3. Fill in:
   - **Title**: e.g., "10-Minute Meditation for Stress Relief"
   - **Category**: Select from available categories (New "Fitness" category recommended)
   - **Short Description**: Brief summary of the video
   - **Video URL**: YouTube embed URL (e.g., `https://www.youtube.com/embed/VIDEO_ID`)
   - **Video Duration**: Duration in seconds (e.g., 600 for 10 minutes)
4. Toggle "Publish Immediately" if desired
5. Click "Create Material"

### For Students - Watching Videos

1. Go to Reading Materials section
2. Look for videos with 🎥 icon (shows "Watch →" instead of "Read →")
3. Click to open the video player
4. Video plays in responsive iframe with full YouTube controls
5. Duration displays as: "⏱️ Video Duration: 10 minutes"

## Data Structure

### ReadingMaterial Table - Video Fields
```
- videoUrl (STRING): YouTube embed URL
  Example: "https://www.youtube.com/embed/bnuF_-iPusU"

- videoDuration (INTEGER): Duration in seconds
  Example: 600 (equals 10 minutes)

- fileType (ENUM): 'article' | 'pdf' | 'document' | 'video'
```

## YouTube Embed URL Format
Standard YouTube embed format:
```
https://www.youtube.com/embed/{VIDEO_ID}
```

Example converting watch URL to embed:
- Watch URL: `https://www.youtube.com/watch?v=bnuF_-iPusU`
- Embed URL: `https://www.youtube.com/embed/bnuF_-iPusU`

## Video Categories Recommended
- Fitness
- Wellness
- Mindfulness
- Mental Health
- Self-Care

## Browser Compatibility
- All modern browsers support YouTube embed player
- Responsive design works on desktop, tablet, mobile
- Autoplay requires user interaction (policy requirement)

## Files Modified
1. ✅ `models/ReadingMaterialModel.js` - Added video fields
2. ✅ `views/reading/article.xian` - Added video player
3. ✅ `views/reading/materials.xian` - Added video badges
4. ✅ `views/counselor/new-material.xian` - Added video upload form
5. ✅ `routes/index.js` - Updated create material route
6. ✅ `create_fitness_videos.js` - Created and executed ✓

## Verification
Run: `node verify_videos.js` to check database for stored videos
Expected output: 8 fitness videos with YouTube URLs and durations

## Next Steps (Optional Enhancements)
1. Add video categories filter in materials page
2. Track video watch history and time watched
3. Add video rating/feedback system
4. Support for other video platforms (Vimeo, hosted videos)
5. Video file upload to server instead of URL-only
6. Create video thumbnails preview
