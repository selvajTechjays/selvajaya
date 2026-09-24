# Selva Jaya: portfolio

Personal portfolio for Selva Jaya, Senior AI Engineer. Live at **https://selvajayarose.github.io/selvajaya/**.

Next.js (App Router) + TypeScript, exported as a static site. The hero logo and the career tunnel are
hand-rolled 2D-canvas "3D" (no WebGL, no animation libraries), so they run in any browser.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
npm start          # serve ./out
```

## Update content

Everything you'd edit lives in [`content/site.ts`](content/site.ts): career milestones, project cards, and the email and social links.

## Update the resume

Every **Resume** / **Get CV** button downloads `Selva-Jaya-Resume.pdf` from the root of the `master` branch.
To publish a new CV, upload a PDF with **exactly that name** on GitHub (Add file → Upload files → commit).
No code change or redeploy needed; it's live within a few minutes.

## Deploy

Pushing to `master` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds with
`NEXT_PUBLIC_BASE_PATH=/selvajaya` and publishes `./out` to GitHub Pages.
One-time setup: **Settings → Pages → Source → GitHub Actions**.

## Structure

```
app/            layout (fonts, metadata), page, globals.css (design tokens + styles), icon
components/     Nav, Hero, CareerTunnel, Work, Contact
lib/            engine.ts (canvas, pointer, shared frame loop), particle-signature.ts, career-tunnel.ts
content/        site.ts (all copy and links)
```

Design system: navy `#0a192f`, mint `#64ffda`, slate `#ccd6f6`; Sora (display), Fira Code (mono),
Amillina (the SJ >> logo); 8px spacing grid; one 1200px content column shared by every section.
