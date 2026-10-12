from pathlib import Path

import cv2
import numpy as np
from PIL import Image

src = Path(
    r"C:\Users\rentk\.cursor\projects\C-Users-rentk-AppData-Local-Temp-bb2136c4-32e8-4e9a-b037-867c6207b028\assets\c__Users_rentk_AppData_Roaming_Cursor_User_workspaceStorage_1791728977464_images_image-abf9f2e3-49c4-4439-a76b-9397d68db455.jpg"
)
out = Path(r"C:\Users\rentk\Desktop\couch kraft\public")

im = Image.open(src)
w, h = im.size
gap = 6
mid_x, mid_y = w // 2, h // 2

crops = {
    "hero-living-scene.jpg": (gap, gap, mid_x - gap, mid_y - gap),
    "hero-dining.jpg": (mid_x + gap, gap, w - gap, mid_y - gap),
    "hero-lounge.jpg": (gap, mid_y + gap, mid_x - gap, h - gap),
    "hero-bedroom.jpg": (mid_x + gap, mid_y + gap, w - gap, h - gap),
}

# Normalised text masks per crop (x0,y0,x1,y1)
masks = {
    "hero-living-scene.jpg": (0.42, 0.08, 0.96, 0.42),
    "hero-dining.jpg": (0.18, 0.10, 0.58, 0.48),
    "hero-lounge.jpg": (0.38, 0.18, 0.92, 0.58),
    "hero-bedroom.jpg": (0.42, 0.10, 0.92, 0.46),
}

for name, box in crops.items():
    panel = im.crop(box).convert("RGB")
    path = out / name
    panel.save(path, quality=95)
    bgr = cv2.cvtColor(np.array(panel), cv2.COLOR_RGB2BGR)
    ph, pw = bgr.shape[:2]
    x0, y0, x1, y1 = masks[name]
    mask = np.zeros((ph, pw), np.uint8)
    cv2.rectangle(
        mask,
        (int(pw * x0), int(ph * y0)),
        (int(pw * x1), int(ph * y1)),
        255,
        -1,
    )
    mask = cv2.GaussianBlur(mask, (21, 21), 0)
    _, mask = cv2.threshold(mask, 12, 255, cv2.THRESH_BINARY)
    clean = cv2.inpaint(bgr, mask, 5, cv2.INPAINT_TELEA)
    cv2.imwrite(str(path), clean, [int(cv2.IMWRITE_JPEG_QUALITY), 94])
    print("saved", path, clean.shape)
