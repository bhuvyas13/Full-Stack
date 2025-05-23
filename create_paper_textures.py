# create_paper_textures.py
"""
This script creates simple paper texture images in static/images
in case you don't have actual paper texture images.
"""

import os
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import random

def create_folder(path):
    """Create folder if it doesn't exist"""
    if not os.path.exists(path):
        os.makedirs(path)
        print(f"Created folder: {path}")

def generate_paper_texture(width, height, filename, color=(255, 255, 245), noise_factor=20, wrinkle_factor=10):
    """Generate a simple paper texture"""
    
    # Create base image
    img = Image.new('RGB', (width, height), color)
    draw = ImageDraw.Draw(img)
    
    # Add some random noise
    for x in range(width):
        for y in range(height):
            if random.random() > 0.95:  # Only add noise to 5% of pixels
                noise = random.randint(-noise_factor, noise_factor)
                r, g, b = color
                r = max(0, min(255, r + noise))
                g = max(0, min(255, g + noise))
                b = max(0, min(255, b + noise))
                draw.point((x, y), fill=(r, g, b))
    
    # Add some wrinkles
    for _ in range(10):
        x1 = random.randint(0, width)
        y1 = random.randint(0, height)
        x2 = random.randint(0, width)
        y2 = random.randint(0, height)
        
        # Draw a very light line
        draw.line((x1, y1, x2, y2), fill=(color[0]-5, color[1]-5, color[2]-5), width=1)
    
    # Apply a slight blur
    img = img.filter(ImageFilter.GaussianBlur(0.5))
    
    # Enhance contrast slightly
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.1)
    
    # Create torn edges
    mask = Image.new('L', (width, height), 255)
    mask_draw = ImageDraw.Draw(mask)
    
    # Top edge
    for x in range(0, width, 5):
        y_offset = random.randint(0, wrinkle_factor)
        mask_draw.rectangle((x, 0, x+5, y_offset), fill=0)
    
    # Right edge
    for y in range(0, height, 5):
        x_offset = random.randint(0, wrinkle_factor)
        mask_draw.rectangle((width-x_offset, y, width, y+5), fill=0)
    
    # Bottom edge
    for x in range(0, width, 5):
        y_offset = random.randint(0, wrinkle_factor)
        mask_draw.rectangle((x, height-y_offset, x+5, height), fill=0)
    
    # Left edge
    for y in range(0, height, 5):
        x_offset = random.randint(0, wrinkle_factor)
        mask_draw.rectangle((0, y, x_offset, y+5), fill=0)
    
    # Apply the mask
    img.putalpha(mask)
    
    # Save the image
    img.save(filename, 'PNG')
    print(f"Generated paper texture: {filename}")

def main():
    # Create folders
    static_folder = 'static'
    images_folder = os.path.join(static_folder, 'images')
    create_folder(static_folder)
    create_folder(images_folder)
    
    # Generate 8 different paper textures
    paper_colors = [
        (255, 252, 240),  # cream
        (245, 245, 245),  # white
        (250, 245, 230),  # beige
        (240, 235, 220),  # light tan
        (255, 250, 240),  # ivory
        (245, 240, 230),  # eggshell
        (250, 247, 237),  # off-white
        (235, 230, 210)   # light brown
    ]
    
    # Add default paper texture
    generate_paper_texture(
        500, 500, 
        os.path.join(images_folder, 'paper-texture.jpg'),
        color=(255, 252, 245)
    )
    
    # Generate each paper texture
    for i, color in enumerate(paper_colors, 1):
        width = random.randint(500, 600)
        height = random.randint(400, 500)
        wrinkle = random.randint(5, 15)
        
        generate_paper_texture(
            width, height, 
            os.path.join(images_folder, f'paper{i}.png'),
            color=color,
            wrinkle_factor=wrinkle
        )
    
    print("All paper textures created successfully!")

if __name__ == "__main__":
    main()