# Ayan Banerjee's Personal Portfolio (AYANROCKS // PORTFOLIO)

A premium, scalable, and dynamically engineered personal portfolio website built to showcase projects, technical skills, and professional experience. Designed with a focus on high-level cognitive performance in code and deep visual aesthetics.

## Features

- **Modern & Brutalist Aesthetics**: Distinctive edge navigation, dynamic borders, and massive typography elements.
- **3D Interactive Background**: Implemented using **Three.js** to create a dynamic, engaging canvas background.
- **Smooth Animations**: Powered by **GSAP (GreenSock Animation Platform)** and **ScrollTrigger** for highly performant scroll-based event animations and parallax effects.
- **Dynamic Project Showcase**: Fetches and displays the latest featured projects directly from GitHub.
- **Theme Switching**: Includes custom dark/light mode toggle adapting to different visual preferences.
- **Responsive Layout**: Designed to look and function beautifully across a wide range of devices and screen sizes.

## Tech Stack

- **Frontend Core**: HTML5, CSS3, Vanilla JavaScript.
- **3D Rendering**: Three.js (`r128`).
- **Animations**: GSAP (`3.12.2`) with ScrollTrigger.
- **Deployment**: GitHub Pages.

## Getting Started

### Prerequisites

No complex build tools are required since the project relies on vanilla web technologies. A modern web browser is sufficient to view the application.

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ayanrocks/ayanrocks.github.io.git
   ```

2. **Navigate to the project directory:**
   ```bash
   cd ayanrocks.github.io
   ```

3. **Start a local development server:**
   To avoid CORS issues and test everything locally, run a local development server. For instance, using Python:
   ```bash
   python3 -m http.server 8000
   ```
   Then open `http://localhost:8000` in your web browser.

## Project Structure

- `index.html`: The main landing page structure and hero section.
- `contact.html`: The contact page.
- `styles.css`: Global styles, layout definitions, theme variables, and custom cursor logic.
- `script.js`: Handles GSAP animations, 3D WebGL background rendering, theme toggling, and data fetching logic.
- `contact.js`: Manages the local logic and interactions specifically for the contact page form.

## License

Designed and engineered by Ayan Banerjee.
