# Grocery Management System

A modern, responsive web application for managing grocery store operations, built with React, TypeScript, and Tailwind CSS. This project aims to provide a premium user experience for both customers and shopkeepers.

## 🚀 Features

- **Authentication System**: Secure login and signup pages tailored for both Users and Shopkeepers.
- **Modern UI/UX**: A premium, aesthetically pleasing interface designed with **Tailwind CSS**.
- **Smooth Animations**: Enhanced user interactions using **Framer Motion**.
- **Responsive Design**: Fully optimized for desktops, tablets, and mobile devices.
- **Component-Based Architecture**: Modular and reusable components for maintainability.

## 🛠️ Tech Stack

- **Frontend Framework**: [React](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 📂 Project Structure

```
src/
├── assets/          # Static assets (images, icons)
├── components/      # Reusable UI components
│   ├── Auth/        # Authentication related components
│   ├── Home/        # Home page specific components
│   ├── Layout/      # Layout components (Navbar, Footer)
│   └── ui/          # Generic UI elements
├── pages/           # Application pages
│   ├── Auth/        # Login and Signup pages
│   └── Home/        # Home page
├── styles/          # Global styles
├── App.tsx          # Main application component
└── main.tsx         # Entry point
```

## ⚡ Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Setup / Run

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd grocery-management-system
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   _Modify `.env` with your API URL if different from default._

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:5173](http://localhost:5173).

5. **Build for production**
   ```bash
   npm run build
   ```

## 📜 Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run preview`: Previews the production build locally.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
