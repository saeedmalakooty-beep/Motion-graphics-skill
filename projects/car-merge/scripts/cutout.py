# Usage: python3 -I scripts/cutout.py <front-view photo> <out.png>  -> background removed, trimmed
import sys
from PIL import Image
from rembg import remove, new_session
out = remove(Image.open(sys.argv[1]).convert('RGB'), session=new_session('isnet-general-use'))
out.crop(out.getbbox()).save(sys.argv[2]); print('saved', sys.argv[2], out.getbbox())
