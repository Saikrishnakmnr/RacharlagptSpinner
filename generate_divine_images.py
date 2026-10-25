"""Generate devotional portraits using Pollinations; requires POLLINATIONS_KEY in environment.
Run from repository root. Never commit the secret key.
"""
import os, pathlib, urllib.parse, urllib.request, json, time
KEY=os.environ.get('POLLINATIONS_KEY')
if not KEY: raise SystemExit('POLLINATIONS_KEY GitHub secret is required. No key was embedded in website.')
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'assets'/'divine-ai'; OUT.mkdir(parents=True,exist_ok=True)
DEITIES={
'shiva':'Lord Shiva, crescent moon, trishula, Mount Kailash, blue throat',
'vishnu':'Lord Vishnu, four arms, conch and discus, majestic golden crown',
'lakshmi':'Goddess Lakshmi, lotus throne, golden ornaments, pink lotuses',
'ganesha':'Lord Ganesha, elephant head, modak, golden crown, mouse companion',
'hanuman':'Lord Hanuman, golden mace, devotion, saffron cloth',
'surya':'Surya Bhagavan, golden sun chariot with seven white horses',
'saraswati':'Goddess Saraswati, white sari, veena, white lotus, swan',
'durga':'Goddess Durga, lion mount, red sari, trident, compassionate expression'
}
for i,(slug,subject) in enumerate(DEITIES.items()):
 prompt=(f'Reverential traditional Hindu devotional illustration of {subject}. '
         'Luxurious dimensional 3D-rendered art style, ornate Indian temple sanctuary, '
         'cinematic warm golden volumetric rays, luminous gemstones, soft floating flower petals, '
         'accurate respectful iconography, vibrant sapphire and magenta and gold, '
         'sharp facial details, symmetrical centered portrait, no lettering, no watermark, vertical composition')
 url='https://gen.pollinations.ai/image/'+urllib.parse.quote(prompt,safe='')+'?'+urllib.parse.urlencode({'model':'black-forest-labs/flux.1-schnell','width':768,'height':1024,'seed':int(time.time())%100000+i})
 req=urllib.request.Request(url,headers={'Authorization':'Bearer '+KEY,'User-Agent':'RacharlaGPT-Divine-Asset-Generator/1.0'})
 print('Generating',slug,flush=True)
 try:
  with urllib.request.urlopen(req,timeout=180) as response:
   content_type=response.headers.get('Content-Type','')
   data=response.read(8_000_001)
  if not content_type.startswith('image/') or len(data)>8_000_000 or len(data)<3000:
   raise ValueError('API returned unexpected content or image size')
  (OUT/(slug+'.jpg')).write_bytes(data)
 except Exception as exc:
  print('Failed',slug,':',exc,flush=True)
  raise SystemExit('Generation stopped. Existing images were not deleted.') from exc
 print('Saved',slug,flush=True)
print('Images ready. Review religious iconography and visual quality before publishing.')
