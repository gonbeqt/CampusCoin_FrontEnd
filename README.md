# CampusCoin Frontend

This project is the frontend for the CampusCoin application, built with React and Vite.

## Setup Instructions

Follow these steps to get the project up and running on your local machine.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CampusCoin_FrontEnd/campuscoin
```

### 2. Install Dependencies

Install the project dependencies using npm.

```bash
npm install
```

**Key Dependencies:**

*   `lucide-react`: ^0.544.0 (React components for Lucide icons)
*   `react`: ^19.1.1 (React library)
*   `react-dom`: ^19.1.1 (React DOM)
*   `react-router-dom`: ^7.9.1 (Declarative routing for React)

**Development Dependencies:**

*   `@eslint/js`: ^9.36.0 (ESLint core)
*   `@tailwindcss/postcss`: ^4.1.13 (Tailwind CSS PostCSS plugin)
*   `@types/react`: ^19.1.13 (TypeScript types for React)
*   `@types/react-dom`: ^19.1.9 (TypeScript types for React DOM)
*   `@vitejs/plugin-react`: ^5.0.3 (Vite plugin for React)
*   `autoprefixer`: ^10.4.21 (PostCSS plugin to parse CSS and add vendor prefixes)
*   `eslint`: ^9.36.0 (Pluggable JavaScript linter)
*   `eslint-plugin-react-hooks`: ^5.2.0 (ESLint rules for React Hooks)
*   `eslint-plugin-react-refresh`: ^0.4.20 (ESLint plugin for React Refresh)
*   `globals`: ^16.4.0 (Global variables for ESLint)
*   `postcss`: ^8.5.6 (Tool for transforming CSS with JavaScript)
*   `tailwindcss`: ^3.4.17 (A utility-first CSS framework)
*   `vite`: ^7.1.7 (Next Generation Frontend Tooling)

### 3. Tailwind CSS Configuration

Ensure your Tailwind CSS is correctly set up. The `tailwind.config.js` and `postcss.config.js` files should be present in the project root.

**`tailwind.config.js`:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**`postcss.config.js`:**
```javascript
module.exports = {
  plugins: {
    tailwindcss: require('tailwindcss'),
    autoprefixer: require('autoprefixer'),
  },
}
```

**`src/index.css`:**
Ensure your main CSS file (`src/index.css`) includes the Tailwind directives:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Run the Development Server

To start the development server, run:

```bash
npm run dev
```

The application should then be accessible at `http://localhost:5173/` (or another port if 5173 is in use).

### 5. Build for Production

To build the application for production, run:

```bash
npm run build
```


