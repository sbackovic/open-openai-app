# open-openai-app

This project is a **Vue 3** application that interacts with **OpenAI** using Firebase Functions and Firebase Hosting.
It allows users to interact with OpenAI's API through a web interface, with CORS configured for secure communication.

## Project Setup

First, clone the repository and install dependencies:

```sh
npm install
```

### Firebase Setup

1. Make sure you have Firebase CLI installed:
```sh
npm install -g firebase-tools
```

2. Log in to Firebase:
```sh
firebase login
```

3. Set up Firebase project in your local environment:
```sh
firebase init
```
Follow the prompts to set up Firebase Functions and Hosting.

4. Set your **OpenAI API Key** in Firebase environment:
    - Go to Firebase Console → Functions → Environment Variables.
    - Set **OPENAI_API_KEY** to your OpenAI key.

### Compile and Hot-Reload for Development

To run the application locally in development mode:

```sh
npm run dev
```

This will start the local development server at **`http://localhost:3000`**.

### Build for Production

To compile and minify the application for production:

```sh
npm run build
```

### Deploy to Firebase Hosting

To deploy the app to Firebase Hosting and Firebase Functions, make sure to run the following command after building the app:

```sh
firebase deploy --only hosting,functions
```

### Type-Check, Compile and Minify for Production

To perform a production build and type-check the code:

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

To check the code for linting issues:

```sh
npm run lint
```

### Firebase Functions

For cloud function handling and CORS configuration, function is set to interact with OpenAI API securely:

- You can check the deployed Firebase Functions on Firebase Console → Functions.
- The `askOpenAI` function handles **POST** requests with CORS, and logs the interactions in **Firestore** for tracking.
- Firebase Functions are deployed to **Google Cloud** and interact with OpenAI's API, returning a response to the frontend application.

### CORS Configuration

The **CORS** handler is configured based on the environment:

- In **production**, it checks the allowed origins from the configuration file.
- In **development**, it allows requests from all origins.

This ensures secure handling of requests while allowing flexible access during development.
