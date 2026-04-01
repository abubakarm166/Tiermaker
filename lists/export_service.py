"""Export TierList to a single PNG image using Pillow."""
import io
from PIL import Image, ImageDraw, ImageFont


# Layout constants
ROW_HEIGHT = 120
LABEL_WIDTH = 80
CELL_SIZE = 100
PADDING = 10
FONT_SIZE = 24


def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip("#")
    return tuple(int(hex_str[i : i + 2], 16) for i in (0, 2, 4))


def export_tier_list_to_png(tier_list):
    """
    tier_list: TierList instance with template (with tier_rows, items) prefetched.
    Returns: bytes (PNG)
    """
    template = tier_list.template
    all_rows = list(template.tier_rows.all().order_by("order"))
    row_order = getattr(tier_list, "row_order", None) or []
    label_overrides = getattr(tier_list, "label_overrides", None) or {}
    custom_rows = getattr(tier_list, "custom_rows", None) or []
    # Build list of (display_label, color, item_ids) in order
    label_to_row = {r.label: r for r in all_rows}
    custom_by_label = {c["label"]: c for c in custom_rows}
    if row_order:
        tier_rows = []
        for key in row_order:
            if key in label_to_row:
                r = label_to_row[key]
                display_label = label_overrides.get(key, r.label)
                color = r.color if (r.color and str(r.color).startswith("#")) else "#808080"
                tier_rows.append((display_label, color, key))
            elif key in custom_by_label:
                c = custom_by_label[key]
                display_label = label_overrides.get(key, c.get("label", key))
                color = c.get("color", "#808080")
                if not color.startswith("#"):
                    color = "#808080"
                tier_rows.append((display_label, color, key))
        for r in all_rows:
            if r.label not in row_order:
                display_label = label_overrides.get(r.label, r.label)
                color = r.color if (r.color and str(r.color).startswith("#")) else "#808080"
                tier_rows.append((display_label, color, r.label))
    else:
        tier_rows = [(label_overrides.get(r.label, r.label), r.color or "#808080", r.label) for r in all_rows]
    items_by_id = {item.id: item for item in template.items.all()}
    assignments = tier_list.tier_assignments or {}

    if not tier_rows:
        # Empty template: minimal image
        img = Image.new("RGB", (400, 80), (240, 240, 240))
        draw = ImageDraw.Draw(img)
        try:
            font = ImageFont.truetype("arial.ttf", 20)
        except OSError:
            font = ImageFont.load_default()
        draw.text((10, 25), tier_list.title or "Tier List", fill=(0, 0, 0), font=font)
        out = io.BytesIO()
        img.save(out, "PNG")
        out.seek(0)
        return out.getvalue()

    # Build rows: each row = label + item images
    row_images = []
    max_width = 400

    for display_label, color, key in tier_rows:
        rgb = hex_to_rgb(color)
        item_ids = assignments.get(key, [])
        item_cells = []
        for item_id in item_ids:
            item = items_by_id.get(item_id)
            if item and item.image:
                try:
                    with item.image.open("rb") as fh:
                        cell = Image.open(fh).copy()
                except Exception:
                    cell = Image.new("RGB", (CELL_SIZE, CELL_SIZE), (200, 200, 200))
                else:
                    cell = cell.convert("RGB")
                    cell.thumbnail((CELL_SIZE, CELL_SIZE), Image.Resampling.LANCZOS)
                    # Pad to square
                    padded = Image.new("RGB", (CELL_SIZE, CELL_SIZE), (255, 255, 255))
                    x = (CELL_SIZE - cell.width) // 2
                    y = (CELL_SIZE - cell.height) // 2
                    padded.paste(cell, (x, y))
                    cell = padded
            else:
                cell = Image.new("RGB", (CELL_SIZE, CELL_SIZE), (220, 220, 220))
            item_cells.append(cell)
        # Label strip
        label_h = ROW_HEIGHT
        label_img = Image.new("RGB", (LABEL_WIDTH, label_h), rgb)
        draw = ImageDraw.Draw(label_img)
        try:
            font = ImageFont.truetype("arial.ttf", min(FONT_SIZE, label_h // 2))
        except OSError:
            font = ImageFont.load_default()
        draw.text((5, label_h // 2 - 10), display_label, fill=(255, 255, 255), font=font)
        # Row: label + cells
        row_w = LABEL_WIDTH + PADDING + len(item_cells) * (CELL_SIZE + PADDING)
        max_width = max(max_width, row_w)
        row_img = Image.new("RGB", (row_w, ROW_HEIGHT), (255, 255, 255))
        row_img.paste(label_img, (0, 0))
        x = LABEL_WIDTH + PADDING
        for cell in item_cells:
            row_img.paste(cell, (x, (ROW_HEIGHT - cell.height) // 2))
            x += CELL_SIZE + PADDING
        row_images.append(row_img)

    # Title bar
    total_w = max_width + PADDING * 2
    title_h = 50
    try:
        font = ImageFont.truetype("arial.ttf", 22)
    except OSError:
        font = ImageFont.load_default()
    full_h = title_h + len(row_images) * ROW_HEIGHT + PADDING * 2
    full = Image.new("RGB", (total_w, full_h), (248, 248, 248))
    draw = ImageDraw.Draw(full)
    draw.rectangle([0, 0, total_w, title_h], fill=(60, 60, 60))
    draw.text((PADDING, 12), tier_list.title or "Tier List", fill=(255, 255, 255), font=font)
    y = title_h + PADDING
    for row_img in row_images:
        full.paste(row_img, (PADDING, y))
        y += ROW_HEIGHT

    out = io.BytesIO()
    full.save(out, "PNG")
    out.seek(0)
    return out.getvalue()
