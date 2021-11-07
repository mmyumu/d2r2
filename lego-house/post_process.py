from PIL import Image

WIDTH = 1024
HEIGHT = 768

def post_process(src, dest, rotate=None, crop=None, crop_ratio=None):
    img  = Image.open(src)
    img = img.resize((WIDTH, HEIGHT), Image.ANTIALIAS)

    if rotate:
        if rotate > 30:
            rotate = 30
        if rotate < -30:
            rotate = -30
        img = img.rotate(rotate)

    if crop:
        crop_left, crop_top, crop_right, crop_bottom = crop

        if not crop_left:
            crop_left = 0

        if not crop_top:
            crop_top = 0

        if not crop_right:
            crop_right = WIDTH

        if not crop_bottom:
            crop_bottom = HEIGHT

        img = img.crop((crop_left, crop_top, crop_right, crop_bottom))

    elif crop_ratio:
        crop_left, crop_top, crop_right, crop_bottom = crop_ratio

        if not crop_left:
            crop_left = 0

        if not crop_top:
            crop_top = 0

        if not crop_right:
            crop_right = 1

        if not crop_bottom:
            crop_bottom = 1

        img = img.crop((WIDTH*crop_left, HEIGHT*crop_top, WIDTH*crop_right, HEIGHT*crop_bottom))


    img.save(dest, "JPEG")

if __name__ == "__main__":
    post_process('./foo.jpg', './foo_out.jpg', rotate=2.20, crop_ratio=(0.05, 0.28, 0.95, 0.78))
    # post_process('./foo.jpg', './foo_out.jpg', rotate=2.20, crop=(50, HEIGHT*TOP_RATIO, WIDTH-50, None))
