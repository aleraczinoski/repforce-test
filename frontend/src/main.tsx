import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createRouter,
  createRoute,
  createRootRoute,
} from "@tanstack/react-router";
import "./index.css";
import CatalogPage from "./pages/CatalogPage";

const queryClient = new QueryClient();

const rootRoute = createRootRoute();

const catalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: CatalogPage, // Quando o usuário acessa a rota /, mostra na tela o página CatalogPage
});

const routeTree = rootRoute.addChildren([catalogRoute]);
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
