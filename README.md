# 🎬 Movie Web (React + Vite)

A movie discovery web app built with **React** and **Vite**, featuring real-time search, trending movie displays, and a detailed movie modal.

## 🔗 Live Demo
👉 [Movie Web](https://movie-web-react-js.netlify.app/)

## ✨ Features
- 🔍 **Real-time Search** – Search for movies instantly as you type.
- 📊 **Trending & Popular Movies** – See a list of the most popular movies right now.
- 🖼️ **Responsive UI** – Works smoothly on mobile, tablet, and desktop.
- 🎞️ **Movie Details Modal** – Click any movie card to open full details in a modal.
- 🧭 **Homepage Access** – Open the movie's official homepage from inside the modal when available.
- 🎨 **Polished Modal UX** – Custom modal scrollbar, body scroll lock, and mobile-friendly spacing.

## 🛡️ Security & Stability
- 🔐 **TMDB Proxy Server** – The TMDB API key is no longer called directly from the browser; requests go through a local `server.js` proxy.
- 🚦 **API Rate Limiting** – The proxy limits repeated requests to reduce abuse.
- ✅ **Safe External Links** – Homepage URLs are allowlisted to `http` and `https` only.
- 🧼 **Normalized Trending Writes** – Search terms written to Supabase are trimmed, normalized, and length-limited.
- 🙈 **Secret Hygiene** – `.env` stays ignored by Git so local credentials are not committed.

## 🧰 Tech Stack
- **Frontend:** React (with Vite)
- **Styling:** Tailwind
- **Backend:** Node.js + Express proxy for TMDB
- **API:** Movie Database API TMDB
- **Analytics/Data:** Supabase (PostgreSQL)

## 📦 Getting Started

### Prerequisites
- **Node.js** v18+  
- **npm** v9+ (or **yarn/pnpm**)

### Installation
```bash
# Clone the repository
git clone https://github.com/qadirx5283742/movie-app.git
cd movie-app

# Install dependencies
npm install

# Start development server
npm run dev

```

## Build for Production
```bash
npm run build
npm run preview
```

## ⚙️ Environment Variables
Create a `.env` file in the project root with your API details:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_TABLE=movie_search_metrics
VITE_TMDB_API_KEY=your_tmdb_bearer_token
```

## 🗂️ Project Structure
```bash
src/
 ├── assets/          # static assets
 ├── components/      # reusable components and modal UI
 ├── supabase.js      # Supabase search/trending helpers
 ├── App.jsx          # main app shell and movie fetching
 ├── index.css        # global theme and custom utilities
 └── main.jsx         # React entry point

server.js             # local Express proxy for TMDB
```

## 🚀 Deployment

This app can be deployed on Netlify as a static site with serverless functions:

Build command: `npm run build`

Publish directory: `dist`

Functions directory: `netlify/functions`

Add `VITE_TMDB_API_KEY` and the Supabase values in the Netlify environment variables.

The local `server.js` is still used for development and non-Netlify Node hosting.

## 🖼️ Screenshots

<img width="1920" height="3655" alt="screencapture-movie-web-react-js-netlify-app-2025-08-29-02_54_24" src="https://github.com/user-attachments/assets/c7e6a871-6e02-4653-8dd6-eac07b7f6f6c" />

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss.

## 📜 License

MIT License
