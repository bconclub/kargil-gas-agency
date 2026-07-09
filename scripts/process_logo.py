from PIL import Image
import os

SRC = r"C:\Users\user\Desktop\Kargil\Logo.png"
OUT_DIR = r"C:\Users\user\Builds\Kargil\public"
os.makedirs(OUT_DIR, exist_ok=True)

im = Image.open(SRC).convert("RGB")
w, h = im.size
px = im.load()

# background = most common corner colour
corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
bg = max(set(corners), key=corners.count)
print("size", im.size, "bg", bg, "corners", corners)

# knock out the background -> transparent, with a tolerance
rgba = im.convert("RGBA")
data = rgba.getdata()
tol = 24
def near(c, d):
    return all(abs(c[i] - d[i]) <= tol for i in range(3))
newdata = [(t[0], t[1], t[2], 0) if near((t[0], t[1], t[2]), bg) else (t[0], t[1], t[2], 255) for t in data]
rgba.putdata(newdata)

# trim to content bounding box
bbox = rgba.getbbox()
print("bbox", bbox)
trimmed = rgba.crop(bbox) if bbox else rgba
trimmed.save(os.path.join(OUT_DIR, "logo-full.png"))
print("saved logo-full.png", trimmed.size)

# crop the flame mark: leftmost square-ish region (height-based)
fw = int(trimmed.size[1] * 1.05)
flame = trimmed.crop((0, 0, min(fw, trimmed.size[0]), trimmed.size[1]))
fb = flame.getbbox()
if fb:
    flame = flame.crop(fb)
flame.save(os.path.join(OUT_DIR, "logo-flame.png"))
print("saved logo-flame.png", flame.size)

# favicon: square flame on transparent, 64x64
side = max(flame.size)
canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
canvas.paste(flame, ((side - flame.size[0]) // 2, (side - flame.size[1]) // 2), flame)
canvas.resize((64, 64), Image.LANCZOS).save(os.path.join(OUT_DIR, "favicon-flame.png"))
print("saved favicon-flame.png")
