import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

const repositoryName = "TodoList_demo";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter
      basename={import.meta.env.PROD ? `/${repositoryName}/` : "/"}
    >
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
