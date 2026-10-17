# shashank.dev

Personal portfolio of Shashank Raj, Java backend engineer. Plain HTML, CSS and JavaScript, no build step.

```
index.html          the page
css/style.css       all styles
js/main.js          mobile menu, active nav link, diagram tabs, copy email
assets/             photo, resume PDF, diagrams
```

## Assets

- `assets/profile.png`: cut-out profile photo used in the hero (replace with a same-named PNG to update it).
- `assets/Shashank_Raj_Resume.pdf`: the resume behind "Download CV". Keep the site text in sync with it.
- `assets/paynow-sequence.png`: auth and payment sequence diagram for the Paynow project.

## Deploy on GitHub Pages

This repo deploys from `master`:

1. In the repo: Settings → Pages → Source: "Deploy from a branch" → `master` / `(root)` → Save.
2. The site goes live at `https://shashank4868.github.io/portfolio/` within a minute or two of each push.

## Deploy on Netlify

Drag this folder onto https://app.netlify.com/drop, or connect the GitHub repo with no build command and `.` as the publish directory.
