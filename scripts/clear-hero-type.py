import cv2
import numpy as np
from pathlib import Path

src = Path(
    r"C:\Users\rentk\.cursor\projects\C-Users-rentk-AppData-Local-Temp-bb2136c4-32e8-4e9a-b037-867c6207b028\assets\c__Users_rentk_AppData_Roaming_Cursor_User_workspaceStorage_1791728977464_images_image-60c53a16-f9b5-46af-9eb6-48930b88a673.png"
)
dst = Path(r"C:\Users\rentk\Desktop\couch kraft\public\hero-sculpture.png")

image = cv2.imread(str(src))
h, w = image.shape[:2]
mask = np.zeros((h, w), np.uint8)

# Tight cover over the photograph's baked-in heading and CTA only.
cv2.rectangle(mask, (int(w * 0.58), int(h * 0.06)), (int(w * 0.97), int(h * 0.29)), 255, -1)
mask = cv2.GaussianBlur(mask, (31, 31), 0)
_, mask = cv2.threshold(mask, 16, 255, cv2.THRESH_BINARY)

clean = cv2.inpaint(image, mask, 7, cv2.INPAINT_TELEA)
cv2.imwrite(str(dst), clean)
print("wrote", dst, clean.shape)
