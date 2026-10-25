# Divine AI image generation — optional

The four Divine Games automatically use generated images from `assets/divine-ai/` if available, falling back to the bundled SVG illustrations if not. No API key is exposed to visitors.

Pollinations currently requires authentication for generation. **Not an unlimited free/no-key API.** Account balance, model availability, and limits can change. The generator requests eight images per run; review costs and outputs before using it.

1. Sign in at https://enter.pollinations.ai and obtain a secret API key. Never paste it into any HTML/JS file.
2. In your GitHub repository open Settings > Secrets and variables > Actions > New repository secret. Name it `POLLINATIONS_KEY` and paste the key.
3. Open Actions > Generate Divine AI Portraits > Run workflow.
4. After the workflow succeeds, inspect the eight committed JPGs under `assets/divine-ai/`. They will appear automatically in the four devotional games after Pages deploys. Reject or regenerate inaccurate or inappropriate religious imagery.
5. Repeat manually when you want fresh images. This does not generate a new image for every visitor, and it does not generate quiz questions.

If your GitHub plan or repository policies disable Actions, you can run `POLLINATIONS_KEY=... python scripts/generate_divine_images.py` locally and upload the generated JPGs, without committing the key.
