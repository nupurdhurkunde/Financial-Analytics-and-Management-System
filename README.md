# Financial Analytics & Management System
A browser based personal finance tracker which log income/expenses, set a budget, view detailed reports, and get AI advice. Runs entirely client side with localStorage, no backend needed.<br>
## Features
- Login/signup (local only)<br>
- Dashboard with monthly income, expense, and savings overview<br>
- Income and expense logging by category<br>
- Budget tracker with progress bar<br>
- Detailed report: category breakdowns, transaction table, charts<br>
- Smart Advisor: AI advice via Google Gemini API (free tier)<br>
## Tech Stack
- HTML
- CSS
- vanilla JS
- Chart.js
- Google Gemini API
- localStorage
## Setup
1. Get a free key at aistudio.google.com/api-keys
2. cp config.example.js config.js
3. Add your key:<br>
window.GEMINI_API_KEY = "your-key-here";<br>
window.GEMINI_MODEL   = "gemini-2.5-flash";
4. Open index.html in your browser
## Security Note
The API key is visible in dev tools since this calls Gemini directly from the browser.<br>
config.js is gitignored - never commit it or deploy this publicly with a real key inside.
## Limitations
- Data stored per-browser, current month only
- Login is client-side only, not secure for real multi-user use
