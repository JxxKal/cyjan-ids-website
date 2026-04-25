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
