# Build pipeline

Static assets in `/assets/css/` are committed to the repo so the dockerhost
only needs `git pull`. Rebuild locally when HTML markup gains new Tailwind
utility classes or when fonts need updating.

## Tailwind

```bash
cd build
npx --yes tailwindcss@3.4.17 -c tailwind.config.js -i tailwind.input.css -o ../assets/css/tailwind.css --minify
```

## Fonts (Inter + JetBrains Mono, self-hosted)

`/assets/css/fonts.css` and the woff2 files in `/assets/fonts/` are
generated from Google Fonts (latin + latin-ext subsets). Re-run only if
the weight set in HTML changes.

## App screenshot (`/screenshots/app-sentry.png`)

`sentry-mockup.html` is a pixel replica of the CYJAN Sentry dashboard screen,
built from the app's own design tokens (`../cyjan-mobile/packages/shared/src/tokens/`)
and rendered headless. It carries **demo data only** — no customer hostnames,
IPs or alerts. Regenerate after app UI changes:

```bash
cd build
google-chrome --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=3 --window-size=393,852 \
  --screenshot=../screenshots/app-sentry.png --virtual-time-budget=4000 \
  "file://$PWD/sentry-mockup.html"
```

Needs network access on first run: IBM Plex Mono/Sans are pulled from Google
Fonts at render time.
