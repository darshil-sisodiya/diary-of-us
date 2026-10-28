import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";
import "./styles/animations.css";
import "./styles/intro.css";
import "./styles/diary.css";
import "./styles/photos.css";
import "./styles/room.css";
import "./styles/scenes.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
