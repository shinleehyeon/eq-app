#!/usr/bin/env python3
"""
Convert logo.png to Android app icons in WebP format
"""

import os
import sys
from PIL import Image

# Define icon sizes for different densities
icon_sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
}

def convert_logo_to_android_icons():
    # Get paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    logo_path = os.path.join(project_root, 'assets', 'images', 'logo.png')
    android_res_path = os.path.join(project_root, 'android', 'app', 'src', 'main', 'res')
    
    print(f"Starting logo conversion...")
    print(f"Source logo: {logo_path}")
    print(f"Target directory: {android_res_path}")
    
    # Check if logo exists
    if not os.path.exists(logo_path):
        print(f"❌ Error: Logo not found at {logo_path}")
        sys.exit(1)
    
    try:
        # Open the original logo
        logo = Image.open(logo_path)
        
        # Convert to RGBA if not already
        if logo.mode != 'RGBA':
            logo = logo.convert('RGBA')
        
        print(f"Original logo size: {logo.size}")
        
        # Process each density
        for density, size in icon_sizes.items():
            print(f"\nProcessing {density} ({size}x{size})...")
            
            target_dir = os.path.join(android_res_path, density)
            
            # Ensure directory exists
            os.makedirs(target_dir, exist_ok=True)
            
            # Resize the image using high-quality resampling
            resized = logo.resize((size, size), Image.Resampling.LANCZOS)
            
            # Save as ic_launcher_foreground.webp
            foreground_path = os.path.join(target_dir, 'ic_launcher_foreground.webp')
            resized.save(foreground_path, 'WEBP', quality=90)
            print(f"✓ Saved: {foreground_path}")
            
            # Also save as ic_launcher.webp for the main icon
            launcher_path = os.path.join(target_dir, 'ic_launcher.webp')
            resized.save(launcher_path, 'WEBP', quality=90)
            print(f"✓ Saved: {launcher_path}")
            
            # Optionally save ic_launcher_round.webp (same as ic_launcher for now)
            round_path = os.path.join(target_dir, 'ic_launcher_round.webp')
            resized.save(round_path, 'WEBP', quality=90)
            print(f"✓ Saved: {round_path}")
        
        print("\n✅ Logo conversion completed successfully!")
        
    except Exception as e:
        print(f"❌ Error converting logo: {e}")
        sys.exit(1)

if __name__ == "__main__":
    convert_logo_to_android_icons()