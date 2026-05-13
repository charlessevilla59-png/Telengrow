#!/usr/bin/env python3
"""
Image Overlay Script - Make building transparent and overlay images
Creates a new composite image with transparent building
"""

from PIL import Image
import numpy as np
import os

def make_building_transparent(image_path, output_path, tolerance=50):
    """
    Make the building in the image transparent by detecting and removing similar colors
    """
    print(f"📷 Loading image: {image_path}")
    
    # Open the image
    img = Image.open(image_path)
    
    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Convert to numpy array for processing
    data = np.array(img)
    
    # Extract RGB and Alpha channels
    red, green, blue, alpha = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # Detect building colors (purple/lavender and white/light colors)
    # The building has predominantly purple/blue and white colors
    
    # Create a mask for building colors
    # Purple building detection (high red+blue, lower green)
    purple_mask = (red > 100) & (blue > 100) & (green < 150) & (green < red)
    
    # White/light gray detection (high R,G,B - for concrete/walls)
    light_mask = (red > 180) & (green > 180) & (blue > 180)
    
    # Gray/dark gray detection (similar R,G,B values)
    gray_mask = (np.abs(red.astype(int) - green.astype(int)) < tolerance) & \
                (np.abs(green.astype(int) - blue.astype(int)) < tolerance) & \
                (red > 50) & (red < 220)
    
    # Combine masks
    building_mask = purple_mask | light_mask | gray_mask
    
    # Apply transparency to building areas
    alpha[building_mask] = 0  # Make transparent
    
    # Update the data
    data[:,:,3] = alpha
    
    # Create new image
    result = Image.fromarray(data)
    
    # Save the result
    result.save(output_path, 'PNG')
    print(f"✅ Transparent building image saved: {output_path}")
    
    return result

def overlay_images(foreground_path, background_path, output_path):
    """
    Overlay two images - foreground on top of background
    """
    print(f"\n🎨 Overlaying images...")
    print(f"  Foreground: {foreground_path}")
    print(f"  Background: {background_path}")
    
    # Load images
    background = Image.open(background_path).convert('RGB')
    foreground = Image.open(foreground_path).convert('RGBA')
    
    # Resize foreground to match background if needed
    if foreground.size != background.size:
        print(f"  Resizing foreground from {foreground.size} to {background.size}")
        foreground = foreground.resize(background.size, Image.Resampling.LANCZOS)
    
    # Create a new image for the result
    result = background.convert('RGBA')
    
    # Paste foreground on top of background using alpha channel
    result.paste(foreground, (0, 0), foreground)
    
    # Convert back to RGB and save
    result = result.convert('RGB')
    result.save(output_path, 'JPEG', quality=95)
    print(f"✅ Overlayed image saved: {output_path}")
    
    return result

def main():
    # Paths
    base_dir = "public/images"
    source_image = os.path.join(base_dir, "image.jpg")
    download_image = os.path.join(base_dir, "download.jpg")
    
    # Intermediate file (transparent building)
    transparent_building = os.path.join(base_dir, "building-transparent.png")
    
    # Final output
    final_output = os.path.join(base_dir, "overlay-composite.jpg")
    
    # Step 1: Make building transparent
    print("=" * 60)
    print("STEP 1: Creating transparent building")
    print("=" * 60)
    make_building_transparent(source_image, transparent_building, tolerance=40)
    
    # Step 2: Overlay on background (using download.jpg as background)
    print("\n" + "=" * 60)
    print("STEP 2: Creating overlay composite")
    print("=" * 60)
    overlay_images(transparent_building, download_image, final_output)
    
    print("\n" + "=" * 60)
    print("✨ COMPLETE!")
    print("=" * 60)
    print(f"Output files:")
    print(f"  - Transparent building: {transparent_building}")
    print(f"  - Final composite: {final_output}")
    print("\nTo use in your website, update the CSS background-image URL to:")
    print("  url('/images/overlay-composite.jpg')")

if __name__ == "__main__":
    main()
