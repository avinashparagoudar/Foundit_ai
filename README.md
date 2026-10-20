# FindIt AI — Frontend Demo

FindIt AI is a responsive Lost & Found web app built with HTML, CSS, and vanilla JavaScript.

## Features
- Submit LOST and FOUND reports
- Search reports by name, details, category, or location
- Filter All, Lost, Found, and Open reports
- Dashboard counts for total, lost, found, and resolved reports
- Heuristic matching based on shared keywords, category, and location
- Mark reports resolved, view contact details, and delete reports
- Responsive layout for desktop and mobile
- Browser `localStorage` persistence

## Requirements
- A modern browser (Chrome, Edge, Firefox, or Safari)
- Optional: Visual Studio Code and the Live Server extension

## Run locally
1. Extract the ZIP.
2. Open the `findit-ai-frontend` folder in VS Code.
3. Open `index.html` in your browser, or right-click it and choose **Open with Live Server**.
4. Submit a sample LOST report and a similar FOUND report.
5. Click **Find matches** to see the matching estimate.

No npm install or build command is required.

## Deploy to GitHub Pages
1. Create a GitHub repository named `findit-ai`.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under build and deployment, select **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder, then save.
6. Wait for GitHub Pages to publish the site; open the URL shown in the Pages settings.

Alternative: Netlify can deploy the folder by using its manual deploy / drag-and-drop workflow. Upload the folder containing `index.html`, `style.css`, and `script.js`.

## Important limitations
- This is a frontend-only learning/demo project. Reports are saved in the current browser's localStorage and are not shared between users, browsers, or devices.
- The matching feature is a simple heuristic, not a trained AI/ML model. A similarity percentage is not proof that two items match.
- Contact emails are stored in browser storage and displayed by the demo. Do not publish real personal contact information in a public demonstration.
- There is no authentication, backend, moderation, or secure shared database. For real multi-user deployment, add a backend API, database, authentication, access controls, rate limiting, and privacy protections.

## Suggested test
1. Add a LOST report: `Blue water bottle`, category `Other`, description `Blue steel bottle with a black lid`, location `College library`.
2. Add a FOUND report with similar details and location.
3. Click **Find matches** on either report.
4. Try search, filters, resolve, and delete.
