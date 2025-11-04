# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
MUBAS Community Hub

This is the repository for the MUBAS Community Hub, a Next.js application designed to foster knowledge sharing and community engagement among students. It features a community forum, knowledge base, live updates, and an administrative dashboard, all powered by Firebase and Google's Generative AI.

## Getting Started Locally

To set up and run this project on your local machine, follow these steps.

### 1. Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js:** Version 18.x or later. You can download it from [nodejs.org](https://nodejs.org/).
- **npm:** This comes bundled with Node.js.
- **Firebase CLI:** This command-line tool allows you to interact with your Firebase projects. Install it globally by running:
  ```bash
  npm install -g firebase-tools
  ```

### 2. Firebase Project Setup

The application requires a Firebase project to handle the database, user authentication, and hosting.

1.  **Go to the Firebase Console:** Navigate to [console.firebase.google.com](https://console.firebase.google.com).
2.  **Create a Project:** Click "Add project" and follow the on-screen instructions. Give it a name like `mubas-community-hub`.
3.  **Enable Services:**
    *   In the "Build" section of the left sidebar, click on **Authentication**. Click "Get started" and enable the **Email/Password** provider.
    *   In the "Build" section, click on **Firestore Database**. Click "Create database", start in **production mode**, and choose a location for your database (e.g., `eur3` or `us-central`).

### 3. Set Up Environment Variables

The project needs API keys to connect to your Firebase project and the Google AI services.

1.  **Create an Environment File:** In the root directory of the project, create a new file named `.env.local`.

2.  **Get Firebase Keys:**
    *   In your Firebase project, go to **Project Settings** (click the gear icon ⚙️ next to "Project Overview").
    *   Under the "General" tab, scroll down to "Your apps".
    *   Click the **Web** icon (`</>`) to create a new web app. Give it a nickname (e.g., "MUBAS Hub Web") and register the app.
    *   Firebase will provide you with a `firebaseConfig` object. Copy the values from this object.

3.  **Get Gemini API Key:**
    *   Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Click "**Create API key in new project**". Copy the generated key.

4.  **Populate `.env.local`:** Add the keys you copied to your `.env.local` file like this:

    ```bash
    # Firebase Keys
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
    NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your-measurement-id"

    # Google AI Key
    GEMINI_API_KEY="your-gemini-api-key"
    ```

### 4. Install Modules

Open your terminal in the project's root directory and run the following command to download all the necessary packages defined in `package.json`:

```bash
npm install
```

### 5. Run the Application

This project has two parts that need to run at the same time: the Next.js web application and the Genkit AI server. You will need to open **two separate terminal windows** for this.

1.  **In your first terminal**, run the Next.js development server:
    ```bash
    npm run dev
    ```
    This will start the main application, typically available at `http://localhost:9002`.

2.  **In your second terminal**, run the Genkit AI development server:
    ```bash
    npm run genkit:dev
    ```
    This starts the server that handles the AI-powered features like hybrid search.

Your local development environment is now fully set up! You can open your browser to `http://localhost:9002` to see the application running.
