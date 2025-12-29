import * as Sentry from "@sentry/browser";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

Sentry.init({
  dsn: "https://f2ce44affa5c3714f02266ee31343105@o4510583966072832.ingest.us.sentry.io/4510616880152576",
  environment: "production",
  tracesSampleRate: 1.0,
});
