import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./providers/auth-provider";
import GlobalStylesProvider from "./components/global-styles-provider";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <GlobalStylesProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GlobalStylesProvider>
    </QueryClientProvider>
  </React.StrictMode>
);