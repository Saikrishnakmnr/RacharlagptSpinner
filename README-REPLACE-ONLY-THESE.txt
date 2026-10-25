# Gameverse Darshan and Divine Games quick patch

Replace these five files at the exact paths in your existing GitHub repository:
- index.html
- sw.js
- assets/style.css
- assets/darshan-slideshow.js
- assets/divine-audio.js

DO NOT remove CNAME, game files, Pollinations images, or API key.

Changes: contain full deity portraits (no face cropping); use existing shiva.jpg etc rather than nonexistent -1/-2/-3 images; visitors can temporarily add up to 12 private images for the slideshow; choose audio file; volume adjustment; synthesized melody when no file; improved game audio and bells; new service worker cache.

Images and song are kept only for the current browser session; they are never uploaded to the website. 

Test in a Chrome incognito tab after GitHub Pages has finished deploying. Click Music ON once, set volume ~80%, ensure the computer/phone is not muted. Uploaded MP3 usually works; unsupported audio codecs may fail.

No live mobile browser automation available: actual speaker playback is unverified.
