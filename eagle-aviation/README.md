# Eagle Aviation — Flight Training at Pleasanton Municipal Airport (KPEZ)

Static one-page site for Eagle Aviation. Plain HTML/CSS with minimal vanilla
JS — no frameworks, no build step, no backend. The whole site is this folder.

## File structure

```
eagle-aviation/
├── index.html   # the entire site (hero, training, airport, about, VMAX, lead form, footer)
├── styles.css   # mobile-first styles, system fonts only, no external assets
├── script.js    # mobile nav, interest-dropdown preselect, form placeholder guard
├── assets/      # drop pleasanton-airport.jpg here (see below)
└── README.md
```

## Deploying to Cloudflare Pages

In the Cloudflare dashboard go to **Workers & Pages → Create → Pages**, connect
this Git repository, leave the **build command empty** (it's a static site),
and set the **build output directory** to `eagle-aviation` — Cloudflare will
serve this folder as the site root. (Alternatively, use **Direct Upload** and
drag this folder in, or `npx wrangler pages deploy eagle-aviation`.) For a
custom domain, add it under the project's **Custom domains** tab; if the
domain's DNS is already on Cloudflare it creates the record for you, otherwise
set a **CNAME record for `www` pointing to `<project>.pages.dev`** and, for
the apex/root domain, either move DNS to Cloudflare (which supports CNAME
flattening at the apex, again pointing at `<project>.pages.dev`) or have the
apex redirect to `www` at your registrar. Netlify works the same way: empty
build command, publish directory `eagle-aviation`, CNAME `www` to
`<site>.netlify.app`.

## Before launch — two placeholders to fill in

1. **Salesforce Web-to-Lead** — in `index.html`, find the comment block
   `SALESFORCE WEB-TO-LEAD: replace action + input names here` and follow the
   numbered steps: swap the form `action`, add the hidden `oid` input, and
   match the field `name`s to the generated Web-to-Lead HTML. A hidden
   `lead_source` field is already stubbed in. Until the action is replaced,
   `script.js` blocks submission and shows a "not connected yet" notice.
2. **Contact info** — in the footer of `index.html`, find the
   `CONTACT INFO` comment and uncomment/fill in the real phone and email.

## Hero photo

When a file exists at `assets/pleasanton-airport.jpg`, the site automatically
uses it as the hero background with a navy overlay (handled by `script.js` +
`styles.css`); without it, the illustrated runway scene is the fallback. Use a
photo you have rights to — one of Clint's own photos of the field is ideal.
Resize to roughly 1600–2000px wide and save as JPEG to keep the page fast.
Avoid images found via web search; they are almost always copyrighted.
