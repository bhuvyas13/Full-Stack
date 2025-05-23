# create_clean_puzzle.py
"""
This script creates clean puzzle pieces with properly interlocking tabs and blanks
"""

import os
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import math

def create_folder(path):
    """Create folder if it doesn't exist"""
    if not os.path.exists(path):
        os.makedirs(path)
        print(f"Created folder: {path}")

def create_classic_puzzle_piece(size, piece_type, filename, color=(255, 255, 255, 255)):
    """
    Create a classic puzzle piece with interlocking tabs/blanks
    
    Parameters:
    - size: width and height of the piece
    - piece_type: string indicating which edges have tabs/blanks: 'tttt', 'btbt', etc.
                  t = tab (protrusion), b = blank (indentation), n = none (flat)
                  order is [top, right, bottom, left]
    - filename: output filename
    - color: RGBA color tuple for the piece
    """
    # Create a transparent image
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Size of tab/blank (as a fraction of piece size)
    tab_size = size / 6
    
    # Square base coordinates (inset from edges to accommodate tabs/blanks)
    square_inset = tab_size
    square = [
        (square_inset, square_inset),  # Top-left
        (size - square_inset, square_inset),  # Top-right
        (size - square_inset, size - square_inset),  # Bottom-right
        (square_inset, size - square_inset),  # Bottom-left
    ]
    
    # Build the points for the puzzle piece shape
    points = []
    
    # Top edge
    if piece_type[0] == 't':  # Tab on top
        points.extend([
            square[0],
            (size/2 - tab_size, square_inset),
            (size/2, 0),
            (size/2 + tab_size, square_inset),
            square[1]
        ])
    elif piece_type[0] == 'b':  # Blank on top
        points.extend([
            square[0],
            (size/2 - tab_size, square_inset),
            (size/2, 2*tab_size),
            (size/2 + tab_size, square_inset),
            square[1]
        ])
    else:  # Flat edge
        points.extend([square[0], square[1]])
    
    # Right edge
    if piece_type[1] == 't':  # Tab on right
        points.extend([
            (size - square_inset, size/2 - tab_size),
            (size, size/2),
            (size - square_inset, size/2 + tab_size)
        ])
    elif piece_type[1] == 'b':  # Blank on right
        points.extend([
            (size - square_inset, size/2 - tab_size),
            (size - 2*tab_size, size/2),
            (size - square_inset, size/2 + tab_size)
        ])
    
    # Bottom edge
    if piece_type[2] == 't':  # Tab on bottom
        points.extend([
            square[2],
            (size/2 + tab_size, size - square_inset),
            (size/2, size),
            (size/2 - tab_size, size - square_inset),
            square[3]
        ])
    elif piece_type[2] == 'b':  # Blank on bottom
        points.extend([
            square[2],
            (size/2 + tab_size, size - square_inset),
            (size/2, size - 2*tab_size),
            (size/2 - tab_size, size - square_inset),
            square[3]
        ])
    else:  # Flat edge
        points.extend([square[2], square[3]])
    
    # Left edge
    if piece_type[3] == 't':  # Tab on left
        points.extend([
            (square_inset, size/2 + tab_size),
            (0, size/2),
            (square_inset, size/2 - tab_size)
        ])
    elif piece_type[3] == 'b':  # Blank on left
        points.extend([
            (square_inset, size/2 + tab_size),
            (2*tab_size, size/2),
            (square_inset, size/2 - tab_size)
        ])
    
    # Draw the puzzle piece shape
    draw.polygon(points, fill=color)
    
    # Apply slight blur to smooth edges
    img = img.filter(ImageFilter.GaussianBlur(0.5))
    
    # Save the image
    img.save(filename, 'PNG')
    print(f"Created puzzle piece: {filename}")
    return img

def main():
    # Create folders
    static_folder = 'static'
    images_folder = os.path.join(static_folder, 'images')
    puzzle_folder = os.path.join(images_folder, 'clean-puzzle')
    
    create_folder(static_folder)
    create_folder(images_folder)
    create_folder(puzzle_folder)
    
    # Define proper interlocking puzzle pieces for a 2x4 grid
    # Format: [top, right, bottom, left]
    # t = tab, b = blank, n = none (flat edge)
    piece_configs = [
        'ntnb',  # Top-left (row 1, col 1)
        'ntbt',  # Top-center-left (row 1, col 2)
        'ntbt',  # Top-center-right (row 1, col 3)
        'nntb',  # Top-right (row 1, col 4)
        'tbnb',  # Bottom-left (row 2, col 1)
        'tbbt',  # Bottom-center-left (row 2, col 2)
        'tbbt',  # Bottom-center-right (row 2, col 3)
        'tntb'   # Bottom-right (row 2, col 4)
    ]
    
    # Create each piece
    for i, config in enumerate(piece_configs, 1):
        create_classic_puzzle_piece(
            400,  # Size in pixels
            config,
            os.path.join(puzzle_folder, f'piece{i}.png'),
            color=(255, 255, 255, 255)  # White
        )
    
    print("All puzzle pieces created successfully!")

if __name__ == "__main__":
    main()