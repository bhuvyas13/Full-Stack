# create_puzzle_pieces.py
"""
This script creates puzzle-shaped piece images with transparent backgrounds
"""

import os
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import numpy as np
import math

def create_folder(path):
    """Create folder if it doesn't exist"""
    if not os.path.exists(path):
        os.makedirs(path)
        print(f"Created folder: {path}")

def create_puzzle_piece(size, piece_type, filename, color=(255, 255, 255, 255)):
    """
    Create a puzzle piece image
    
    Parameters:
    - size: width and height of the piece
    - piece_type: string indicating which edges have tabs/blanks: 'tttt', 'btbt', etc.
                  t = tab (protrusion), b = blank (indentation), n = none (flat)
                  order is [top, right, bottom, left]
    """
    # Create a transparent image
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Size of tab/blank (as a fraction of piece size)
    tab_size = size / 6
    
    # Base coordinates (square)
    outline = [
        (tab_size, tab_size),  # Top-left
        (size - tab_size, tab_size),  # Top-right
        (size - tab_size, size - tab_size),  # Bottom-right
        (tab_size, size - tab_size),  # Bottom-left
    ]
    
    # Adjust for tabs/blanks
    # Top edge
    top_points = []
    if piece_type[0] == 't':  # Tab on top
        top_points = [
            (size/2 - tab_size, tab_size),
            (size/2, 0),
            (size/2 + tab_size, tab_size)
        ]
    elif piece_type[0] == 'b':  # Blank on top
        top_points = [
            (size/2 - tab_size, tab_size),
            (size/2, 2*tab_size),
            (size/2 + tab_size, tab_size)
        ]
    
    # Right edge
    right_points = []
    if piece_type[1] == 't':  # Tab on right
        right_points = [
            (size - tab_size, size/2 - tab_size),
            (size, size/2),
            (size - tab_size, size/2 + tab_size)
        ]
    elif piece_type[1] == 'b':  # Blank on right
        right_points = [
            (size - tab_size, size/2 - tab_size),
            (size - 2*tab_size, size/2),
            (size - tab_size, size/2 + tab_size)
        ]
    
    # Bottom edge
    bottom_points = []
    if piece_type[2] == 't':  # Tab on bottom
        bottom_points = [
            (size/2 + tab_size, size - tab_size),
            (size/2, size),
            (size/2 - tab_size, size - tab_size)
        ]
    elif piece_type[2] == 'b':  # Blank on bottom
        bottom_points = [
            (size/2 + tab_size, size - tab_size),
            (size/2, size - 2*tab_size),
            (size/2 - tab_size, size - tab_size)
        ]
    
    # Left edge
    left_points = []
    if piece_type[3] == 't':  # Tab on left
        left_points = [
            (tab_size, size/2 + tab_size),
            (0, size/2),
            (tab_size, size/2 - tab_size)
        ]
    elif piece_type[3] == 'b':  # Blank on left
        left_points = [
            (tab_size, size/2 + tab_size),
            (2*tab_size, size/2),
            (tab_size, size/2 - tab_size)
        ]
    
    # Combine all points to form the outline
    all_points = []
    
    # Top edge
    if top_points:
        all_points.extend([outline[0], top_points[0], top_points[1], top_points[2], outline[1]])
    else:
        all_points.extend([outline[0], outline[1]])
    
    # Right edge
    if right_points:
        all_points.extend([right_points[0], right_points[1], right_points[2]])
    
    # Bottom edge
    if bottom_points:
        all_points.extend([outline[2], bottom_points[0], bottom_points[1], bottom_points[2], outline[3]])
    else:
        all_points.extend([outline[2], outline[3]])
    
    # Left edge
    if left_points:
        all_points.extend([left_points[0], left_points[1], left_points[2]])
    
    # Draw the puzzle piece
    draw.polygon(all_points, fill=color)
    
    # Apply a slight blur for smoother edges
    img = img.filter(ImageFilter.GaussianBlur(1))
    
    # Save the image
    img.save(filename, 'PNG')
    print(f"Created puzzle piece: {filename}")
    return img

def main():
    # Create directories
    static_folder = 'static'
    images_folder = os.path.join(static_folder, 'images')
    puzzle_folder = os.path.join(images_folder, 'puzzle')
    
    create_folder(static_folder)
    create_folder(images_folder)
    create_folder(puzzle_folder)
    
    # Piece configurations - defines which pieces connect to each other
    # The pattern is: [top, right, bottom, left]
    # t = tab (protrusion), b = blank (indentation), n = none (flat)
    piece_configs = [
        'nbnt',  # Piece 1 (top-left)
        'nbtn',  # Piece 2 (top-right)
        'tbnn',  # Piece 3 (bottom-left)
        'tnbn',  # Piece 4 (bottom-right)
        'ntbn',  # Piece 5 (left-middle)
        'nntb',  # Piece 6 (right-middle)
        'bnnb',  # Piece 7 (top-middle)
        'bnbn'   # Piece 8 (bottom-middle)
    ]
    
    # Create each puzzle piece
    for i, config in enumerate(piece_configs, 1):
        create_puzzle_piece(
            400,  # Size
            config,  # Configuration
            os.path.join(puzzle_folder, f'piece{i}.png'),  # Filename
            color=(255, 255, 255, 255)  # White with full opacity
        )
    
    print("All puzzle pieces created successfully!")

if __name__ == "__main__":
    main()