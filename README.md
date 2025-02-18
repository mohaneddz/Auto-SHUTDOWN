# Auto-Shutdown 【﻿⏻】

Auto-Shutdown is a Tauri application built with React and Typescript. This template is designed to help you get started with developing cross-platform desktop apps using Tauri, Vite, and React.

> ## ⚠️ **Warning:**
>
> This project is still under development, and it's functionalities are not yet fully implemented


## Features ⚡

- **Tauri Backend:** Uses Rust for native capabilities like system shutdown.
- **React Frontend:** Built with React and React Router for a smooth SPA experience.
- **TailwindCSS:** For styling and rapid UI development.
- **State Management:** Integrates with Tauri's store plugin to persist settings.
- **Modular Components:** Reusable components such as Button, Input, UserIcon, and ShutdownPrompt.

## Early Screenshots 🖼️

<img src="screenshots/main.png"  alt="Screenshot 3" width="50%"/>

**Main Window**: Sleek minimal interface, to get you straight to the point!

<img src="screenshots/settings.png"  alt="Screenshot 3" width="50%"/>

**Settings Window**: Customize your experience to fit your needs.

<img src="screenshots/modes.png"  alt="Screenshot 3" width="50%"/>

**Modes Window**: Select the shutdown modes that are benefecial to you.

## Project Structure

```plaintext
/ (root)
├── README.md          # This file.
├── package.json       # Node dependecies and scripts.
├── tsconfig.json      # Typescript configuration.
├── vite.config.ts     # Vite configuration.
├── public/            # Public assets.
├── src/               # React source code.
│   ├── App.css        # App level styles.
│   ├── App.tsx        # Main App component.
│   ├── components/    # Reusable React components.
│   ├── lib/           # Utility library (e.g., store management).
│   ├── pages/         # Application pages (Home, Settings, Mode).
│   └── main.tsx       # Application entry point.
└── src-tauri/         # Tauri integration (Rust backend).
```

## Setup and Development 🛠️

1. **Install Dependencies**

   Run the following command to install project dependencies:

   ```sh
   npm install
   ```

2. **Start Development**

   To run the project in development mode with hot reloading, use:

   ```sh
   npm run dev
   ```

3. **Build Project**

   To build the project for production, use:

   ```sh
   npm run build
   ```

4. **Tauri Commands**

   To run Tauri commands, such as testing the native backend functions, use:

   ```sh
   npm run tauri
   ```

## Recommended IDE Setup 💻

- [VS Code](https://code.visualstudio.com/)
- [Tauri for VS Code](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Contributing 👥

Feel free to open issues or pull requests if you find any bugs or have suggestions for improvements.

## License ⚖️

This project is licensed under the MIT License.