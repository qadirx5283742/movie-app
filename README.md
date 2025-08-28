# 🎬 Movie Web (React + Vite)

A simple movie discovery web app built with **React** and **Vite**, featuring real-time search and trending movie displays.

## 🔗 Live Demo
👉 [Movie Web](https://movie-web-react-js.netlify.app/)

## ✨ Features
- 🔍 **Real-time Search** – Search for movies instantly as you type.  
- 📊 **Trending & Popular Movies** – See a list of the most popular movies right now.  
- 🖼️ **Responsive UI** – Works smoothly on mobile, tablet, and desktop.  
- 🚫 **Note:** Clicking on a movie card does **not** open details yet — movies are currently displayed only.

## 🧰 Tech Stack
- **Frontend:** React (with Vite)
- **Styling:** Tailwind
- **API:** Movie Database API TMDB

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
Create a .env file in the project root with your API details:
```bash
VITE_API_BASE_URL=https://api.themoviedb.org/3
VITE_API_KEY=your_api_key_here
```

## 🗂️ Project Structure
```bash
src/
 ├── public/          # images, icons
 ├── components/      # reusable components
 ├── App.jsx
 └── main.jsx
```

## 🚀 Deployment

This app is deployed on Netlify:

Build command: npm run build

Publish directory: dist

Add environment variables in Netlify dashboard.

## 🖼️ Screenshots

Add screenshots or GIFs here to showcase UI.


## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss.

## 📜 License

MIT License
