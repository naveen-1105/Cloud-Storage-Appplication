import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = "1080300698393-bi6pips0agn48q204jcksijvpkmejgk5.apps.googleusercontent.com"
createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={clientId}>
  <StrictMode>
    <App />
  </StrictMode>
  </GoogleOAuthProvider>
  
);
