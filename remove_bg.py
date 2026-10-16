import sys
import os
from PIL import Image

input_path = r"C:\Users\asus\.gemini\antigravity-ide\brain\5c2b1cfd-588f-4fff-870c-54ae7cae3682\.user_uploaded\media_1791836022871.jpg"
output_path = r"C:\Users\asus\.gemini\antigravity-ide\scratch\spartan-impax-portfolio\public\assets\ai-robot.png"

try:
    from rembg import remove
    print("Using rembg for state-of-the-art background removal...")
    with open(input_path, 'rb') as i:
        with open(output_path, 'wb') as o:
            input_bytes = i.read()
            output_bytes = remove(input_bytes)
            o.write(output_bytes)
    print("Successfully created transparent ai-robot.png using rembg!")
except Exception as e:
    print("rembg exception:", e)
    print("Falling back to Pillow-based transparency extraction...")
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    newData = []
    # The generated image or original:
    # If the background has dark blues or checkerboards, remove outer dark/desk pixels
    for item in datas:
        # Check if pixel belongs to the dark background (low brightness or desk colors)
        r, g, b, a = item
        if (r < 60 and g < 75 and b < 100) or (r > 200 and g > 200 and b > 200 and r == g == b): # checkerboard or dark room
            newData.append((r, g, b, 0))
        else:
            newData.append(item)
    img.putdata(newData)
    img.save(output_path, "PNG")
    print("Saved fallback ai-robot.png!")
