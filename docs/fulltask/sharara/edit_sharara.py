from pathlib import Path
from PIL import Image,ImageDraw,ImageFilter
import numpy as np,json,hashlib
OUT=Path(__file__).resolve().parent
original=Image.open(OUT/'BEFORE-sharara-outfit1.png').convert('RGBA')
edited=Image.open(OUT/'chest-edited.png').convert('RGBA').resize((400,450),Image.Resampling.LANCZOS)
box=(600,350,1000,800)
base=original.crop(box)
mask=Image.new('L',(400,450),0)
polygon=[(78,84),(166,85),(170,108),(215,160),(244,186),(244,216),(220,240),(192,226),(144,211),(118,174),(104,141),(91,120)]
ImageDraw.Draw(mask).polygon(polygon,fill=255)
mask=mask.filter(ImageFilter.GaussianBlur(1))
# Clamp the feather at the bottom of the original neck band. Every pixel above
# source y434, including the entire original face and hair, stays unchanged.
values=np.array(mask);values[:84]=0;mask=Image.fromarray(values)
patch=Image.composite(edited,base,mask)
result=original.copy();result.paste(patch,(600,350));result.putalpha(original.getchannel('A'))
a=np.array(original);b=np.array(result)
full_mask=np.zeros(a.shape[:2],dtype=bool);full_mask[350:800,600:1000]=np.array(mask)>0
diff=np.any(a!=b,axis=2)
assert not np.any(diff&~full_mask)
assert np.array_equal(a[:,:,3],b[:,:,3])
assert np.array_equal(a[:434],b[:434])
result.save(OUT/'AFTER-sharara-outfit1.png');result.crop(box).save(OUT/'chest-composite.png')
proof={'originalSize':original.size,'newSize':result.size,'outsideEditChangedPixels':int(np.count_nonzero(diff&~full_mask)),'alphaIdentical':True,'faceAndHairAbove434Identical':True,'changedPixels':int(np.count_nonzero(diff)),'faceCropPreservedHash':hashlib.sha256((OUT/'BEFORE-sharara-face.webp').read_bytes()).hexdigest(),'method':'AI-edited opaque fabric patch only; original character retained everywhere else; no full-character redraw','status':'preview-not-yet-promoted-to-source'}
(OUT/'asset-proof.json').write_text(json.dumps(proof,indent=2)+'\n');print(proof)
