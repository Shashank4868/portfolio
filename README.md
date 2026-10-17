# shashank.dev

Personal portfolio of Shashank Raj, Java backend engineer. Plain HTML, CSS and JavaScript, no build step.

```
index.html          the page
css/style.css       all styles
js/main.js          mobile menu, active nav link, skill bars, project carousel, copy email
assets/             resume PDF (add profile.png here)
```

## Add your photo

1. Save a photo as `assets/profile.png` (a cut-out on a transparent or plain background looks best).
2. In `index.html`, replace the `<div class="hero__photo hero__photo--placeholder">…</div>` block with:

```html
<img class="hero__photo" src="assets/profile.png" alt="Shashank Raj">
```

## Deploy on GitHub Pages

1. Create a repo named `shashank4868.github.io` (or any name).
2. Push these files to the `main` branch (`preview.html` and `build_preview.py` are not needed).
3. In the repo: Settings → Pages → Source: "Deploy from a branch" → `main` / root → Save.
4. The site goes live at `https://shashank4868.github.io` in a minute or two.

## Deploy on Netlify

Drag this folder onto https://app.netlify.com/drop, or connect the GitHub repo with no build command and `.` as the publish directory.
