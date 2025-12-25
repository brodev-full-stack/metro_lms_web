# Comprehensive Installation and Run Guide for metro_lms_web on Fedora Linux

This guide provides a step-by-step process for setting up and running the `metro_lms_web` project on a Fedora Linux system. It assumes a fresh installation with no prior dependencies installed.

## 1. System Prerequisites Installation

The `metro_lms_web` project is a full-stack application built with Node.js, TypeScript, React, and Express, and uses `pnpm` as its package manager.

### 1.1. Install Node.js and npm

It is recommended to install Node.js from the official NodeSource repository to ensure you have a recent, stable version compatible with the project's dependencies.

1.  **Install the NodeSource repository:**
    ```bash
    sudo dnf install -y dnf-command-not-found
    sudo dnf install -y nodejs
    ```
    *Note: Fedora's default repositories often contain a recent version of Node.js. The command above uses the standard Fedora package manager (`dnf`) to install the `nodejs` package.*

2.  **Verify the installation:**
    ```bash
    node -v
    npm -v
    ```
    The output should show a version of Node.js (e.g., `v20.x.x` or later) and npm.

### 1.2. Install pnpm

The project uses `pnpm` for efficient dependency management. Install it globally using `npm`.

```bash
sudo npm install -g pnpm
```

2.  **Verify the installation:**
    ```bash
    pnpm -v
    ```

## 2. Project Setup

### 2.1. Clone the Repository

First, ensure you have `git` installed to clone the project repository.

```bash
sudo dnf install -y git
git clone https://github.com/brodev-full-stack/metro_lms_web.git
cd metro_lms_web
```

*Note: The repository URL will be provided after the project is uploaded to GitHub.*

### 2.2. Install Project Dependencies

Navigate into the project directory and use `pnpm` to install all required dependencies.

```bash
pnpm install
```

## 3. Running the Application

The project includes both a client (React/Vite) and a server (Express/TypeScript).

### 3.1. Development Mode (Client and Server)

To run the application in development mode with hot-reloading for the client:

```bash
pnpm run dev
```

This command will start the Vite development server, typically accessible at `http://localhost:5173`.

### 3.2. Production Mode (Build and Start)

For a production environment, you must first build the client and server code, and then start the compiled server.

1.  **Build the project:**
    ```bash
    pnpm run build
    ```
    This command compiles the client-side assets and the server-side TypeScript code into a `dist` directory.

2.  **Start the production server:**
    ```bash
    pnpm run start
    ```
    This command starts the compiled Express server, which will serve the built client application. The application will typically be accessible at `http://localhost:3000` (or the port configured in the server's `index.ts`).

---

