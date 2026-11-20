# Variant Generator (proof of concept)

Turns **5 original base SVG drawings** into **50 catalog-ready assets** with thumbnails, sharded manifests, and a visual contact sheet. No third-party dependencies — plain Node.js.

## Run

```bash
node tools/generate-variants/generate.mjs
node tools/generate-variants/generate.mjs --check
```

Or from this folder:

```bash
npm run generate
npm run check
```

## Outputs

```
public/assets/
  objects/        # lightbulb variants (SVG)
  people/         # person variants
  charts/         # chart variants
  technology/     # laptop variants
  nature/         # cloud variants
  <category>/thumbs/*-140.svg
  manifest/
    objects.json
    people.json
    charts.json
    technology.json
    nature.json
    all.json
  contact-sheet.html   # open this in a browser to see all 50
```

Each manifest entry follows the schema in `ASSET_PIPELINE.md`:

```json
{
  "id": "objects-lightbulb-outline-blue",
  "path": "/assets/objects/objects-lightbulb-outline-blue.svg",
  "thumbnail": "/assets/objects/thumbs/objects-lightbulb-outline-blue-140.svg",
  "category": "objects",
  "tags": ["idea", "lightbulb", "outline", "blue"],
  "style": ["outline"],
  "license": "CC0-1.0",
  "source": "original-generator",
  "attribution": "",
  "approvedBy": null,
  "status": "pending-review",
  "version": 1,
  "aspect": "1:1",
  "animatedStroke": true
}
```

`status: "pending-review"` is intentional: generated variants still need a human quality gate before being used in production.

## Variant matrix

10 variants per base:

| Variant | Stroke | Palette | Effect |
|---|---|---|---|
| `outline-ink` | 3 | ink | clean |
| `outline-blue` | 3 | blue | accent stroke |
| `outline-green` | 3 | green | accent stroke |
| `thin-ink` | 2 | ink | light |
| `thin-blue` | 2 | blue | light accent |
| `bold-ink` | 5 | ink | strong |
| `bold-orange` | 5 | orange | strong accent |
| `rough-ink` | 3 | ink | SVG turbulence wobble |
| `rough-blue` | 3 | blue | turbulence + accent |
| `fill-accent` | 3 | blue | fill + accent |

## Adding a base drawing

1. Add an SVG to `bases/` with `viewBox="0 0 512 512"` and `width="512" height="512"`.
2. Use these tokens in the SVG:
   - `{{INK}}` — main stroke colour
   - `{{ACCENT_STROKE}}` — accent stroke/fill for highlight details
   - `{{ACCENT_FILL}}` — fill for accent shapes (`none` or a colour)
   - `{{SW}}` — stroke width
   - `{{DEFS}}` — inserted filter definitions
   - `{{FILTER_ATTR}}` — inserted `filter="url(#rough)"` for rough variants
3. Add an entry to the `BASES` array in `generate.mjs`.

The generator refuses to run if a base is missing a required token, and `--check` verifies that all generated files exist and contain no leftover `{{...}}` placeholders.

## Licensing

All base drawings and generated variants in this folder are original work dedicated to **CC0-1.0**. They are not derived from any third-party product's assets.
