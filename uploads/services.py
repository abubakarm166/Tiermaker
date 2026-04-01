"""Image processing with Pillow."""
import io
from PIL import Image
from django.conf import settings


ALLOWED_EXTENSIONS = getattr(
    settings, "ALLOWED_IMAGE_EXTENSIONS", (".jpg", ".jpeg", ".png", ".webp")
)
MAX_SIZE = getattr(settings, "IMAGE_MAX_SIZE", (1200, 1200))
QUALITY = getattr(settings, "IMAGE_QUALITY", 85)


def optimize_image(file_handle, max_size=MAX_SIZE, quality=QUALITY):
    """Resize and optimize image. Returns bytes (PNG or JPEG)."""
    img = Image.open(file_handle)
    img = img.convert("RGB") if img.mode not in ("RGB", "RGBA") else img
    img.thumbnail(max_size, Image.Resampling.LANCZOS)
    out = io.BytesIO()
    if img.mode == "RGBA":
        img.save(out, "PNG", optimize=True)
        out.seek(0)
        return out.getvalue(), "image/png"
    img.save(out, "JPEG", quality=quality, optimize=True)
    out.seek(0)
    return out.getvalue(), "image/jpeg"
