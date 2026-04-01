from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parent.parent
OG_OUTPUT = ROOT / "og-gold-share.png"
BG_OUTPUT = ROOT / "background-atmosphere.webp"
ASSETS_DIR = ROOT / "assets" / "activos"


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    font_candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]

    for candidate in font_candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue

    return ImageFont.load_default()


def draw_centered_text(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], text: str, font, fill):
    left, top, right, bottom = box
    text_box = draw.multiline_textbbox((0, 0), text, font=font, spacing=10)
    text_width = text_box[2] - text_box[0]
    text_height = text_box[3] - text_box[1]
    x = left + (right - left - text_width) / 2
    y = top + (bottom - top - text_height) / 2
    draw.multiline_text((x, y), text, font=font, fill=fill, spacing=10)


def create_og_image() -> None:
    width, height = 1200, 630
    image = Image.new("RGB", (width, height), "#08070a")
    draw = ImageDraw.Draw(image)

    base_gradient = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    gradient_draw = ImageDraw.Draw(base_gradient)
    for index in range(height):
        blend = index / max(height - 1, 1)
        red = int(8 + (38 * blend))
        green = int(7 + (25 * blend))
        blue = int(10 + (18 * blend))
        gradient_draw.line((0, index, width, index), fill=(red, green, blue, 255))
    image = Image.alpha_composite(image.convert("RGBA"), base_gradient)

    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((-120, 300, 460, 880), fill=(190, 130, 20, 120))
    glow_draw.ellipse((660, -120, 1260, 460), fill=(230, 175, 40, 115))
    glow_draw.ellipse((780, 180, 1220, 620), fill=(255, 226, 120, 80))
    glow = glow.filter(ImageFilter.GaussianBlur(72))
    image = Image.alpha_composite(image, glow)

    plate = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    plate_draw = ImageDraw.Draw(plate)
    plate_box = (92, 72, width - 92, height - 72)
    plate_draw.rounded_rectangle(plate_box, radius=42, fill=(26, 18, 10, 220), outline=(245, 202, 108, 255), width=3)
    plate_draw.rounded_rectangle((112, 92, width - 112, height - 92), radius=34, outline=(125, 94, 35, 180), width=1)
    image = Image.alpha_composite(image, plate)
    draw = ImageDraw.Draw(image)

    logo_box = (145, 135, 345, 335)
    draw.rounded_rectangle(logo_box, radius=48, fill="#1d1408", outline="#f3c768", width=4)
    inner_box = (163, 153, 327, 317)
    draw.rounded_rectangle(inner_box, radius=36, fill="#2a1b0b", outline="#7c5a1d", width=2)

    logo_font = load_font(124, bold=True)
    logo_text_box = draw.textbbox((0, 0), "M", font=logo_font)
    logo_x = (logo_box[0] + logo_box[2] - (logo_text_box[2] - logo_text_box[0])) / 2
    logo_y = (logo_box[1] + logo_box[3] - (logo_text_box[3] - logo_text_box[1])) / 2 - 6
    draw.text((logo_x, logo_y), "M", font=logo_font, fill="#fff3d6")
    draw.ellipse((290, 150, 322, 182), fill="#f5d889")

    eyebrow_font = load_font(28, bold=True)
    title_font = load_font(62, bold=True)
    subtitle_font = load_font(29, bold=False)
    stats_font = load_font(22, bold=True)
    stat_value_font = load_font(40, bold=True)

    draw.text((388, 145), "RESPALDO REAL EN CRISIS ARGENTINA", font=eyebrow_font, fill="#e8c77c")
    draw.multiline_text((388, 188), "12 anos de\ntrayectoria real", font=title_font, fill="#fff7e7", spacing=4)
    draw.multiline_text((388, 340), "Activos tangibles, canon defendido y multiples ingresos\npensados para crecer cuando otros se frenan.", font=subtitle_font, fill="#e7dcc3", spacing=8)

    stats = [
        ("Clientes activos", "+550"),
        ("Unidades activas", "3"),
        ("Retorno proyectado", "4% mensual"),
    ]
    stat_left = 138
    stat_top = 452
    stat_width = 296
    stat_gap = 18

    for index, (label, value) in enumerate(stats):
        left = stat_left + index * (stat_width + stat_gap)
        card_box = (left, stat_top, left + stat_width, stat_top + 116)
        draw.rounded_rectangle(card_box, radius=28, fill="#181109", outline="#6d5020", width=2)
        draw.text((left + 26, stat_top + 24), label.upper(), font=stats_font, fill="#cdaa61")
        draw.text((left + 26, stat_top + 58), value, font=stat_value_font, fill="#fff2d2")

    image = image.convert("RGB")
    image.save(OG_OUTPUT, format="PNG", optimize=True)


def create_background_image() -> None:
    width, height = 1600, 1100
    image = Image.new("RGB", (width, height), "#08080b")
    draw = ImageDraw.Draw(image)

    for index in range(height):
        blend = index / max(height - 1, 1)
        red = int(8 + (10 * blend))
        green = int(8 + (12 * blend))
        blue = int(11 + (18 * blend))
        draw.line((0, index, width, index), fill=(red, green, blue))

    haze = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    haze_draw = ImageDraw.Draw(haze)
    haze_draw.ellipse((-160, -60, 760, 640), fill=(25, 214, 177, 58))
    haze_draw.ellipse((820, -160, 1540, 540), fill=(247, 205, 115, 48))
    haze_draw.ellipse((540, 260, 1180, 950), fill=(0, 212, 255, 42))
    haze_draw.ellipse((1060, 460, 1680, 1100), fill=(138, 43, 226, 36))
    haze = haze.filter(ImageFilter.GaussianBlur(90))
    image = Image.alpha_composite(image.convert("RGBA"), haze)

    moon = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    moon_draw = ImageDraw.Draw(moon)
    moon_draw.ellipse((1020, 120, 1340, 440), fill=(239, 219, 160, 120))
    moon_draw.ellipse((1060, 160, 1300, 400), fill=(255, 239, 202, 170))
    moon = moon.filter(ImageFilter.GaussianBlur(20))
    image = Image.alpha_composite(image, moon)

    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    for y in range(0, height, 10):
        overlay_draw.line((0, y, width, y), fill=(255, 255, 255, 8))
    overlay = overlay.filter(ImageFilter.GaussianBlur(0.5))
    image = Image.alpha_composite(image, overlay)
    image = image.convert("RGB")
    image.save(BG_OUTPUT, format="WEBP", quality=74, method=6)


def create_asset_placeholder(output_path: Path, title: str, subtitle: str) -> None:
    width, height = 1400, 933
    image = Image.new("RGB", (width, height), "#0b0d14")
    draw = ImageDraw.Draw(image)

    for index in range(height):
        blend = index / max(height - 1, 1)
        red = int(11 + (19 * blend))
        green = int(13 + (13 * blend))
        blue = int(20 + (10 * blend))
        draw.line((0, index, width, index), fill=(red, green, blue))

    frame = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    frame_draw = ImageDraw.Draw(frame)
    frame_draw.rounded_rectangle((42, 42, width - 42, height - 42), radius=36, outline=(215, 177, 95, 255), width=4)
    frame_draw.rounded_rectangle((72, 72, width - 72, height - 72), radius=28, outline=(97, 74, 34, 185), width=2)
    frame_draw.ellipse((width - 370, 90, width - 120, 340), fill=(245, 211, 130, 35))
    frame = frame.filter(ImageFilter.GaussianBlur(4))
    image = Image.alpha_composite(image.convert("RGBA"), frame)

    draw = ImageDraw.Draw(image)
    eyebrow_font = load_font(34, bold=True)
    title_font = load_font(74, bold=True)
    subtitle_font = load_font(34, bold=False)

    draw.text((102, 118), "ACTIVO REAL AUDITABLE", font=eyebrow_font, fill="#e6c172")
    draw.multiline_text((102, 220), title, font=title_font, fill="#fff2d0", spacing=4)
    draw.multiline_text((102, 470), subtitle, font=subtitle_font, fill="#e8dcc2", spacing=10)

    image = image.convert("RGB")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, format="JPEG", quality=88, optimize=True, progressive=True)


def create_photo_placeholders() -> None:
    create_asset_placeholder(
        ASSETS_DIR / "maquinaria-ultima-generacion.jpg",
        "Maquinaria de\nultima generacion",
        "Reemplaza este archivo por tu foto real\nmanteniendo el mismo nombre.",
    )
    create_asset_placeholder(
        ASSETS_DIR / "stock-carniceria-y-tiendas.jpg",
        "Stock de carniceria\nboutique y tiendas",
        "Reemplaza este archivo por tu foto real\nmanteniendo el mismo nombre.",
    )
    create_asset_placeholder(
        ASSETS_DIR / "infraestructura-sedes.jpg",
        "Infraestructura\nde las sedes",
        "Reemplaza este archivo por tu foto real\nmanteniendo el mismo nombre.",
    )


def main() -> None:
    create_og_image()
    create_background_image()
    create_photo_placeholders()


if __name__ == "__main__":
    main()