import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("activate", "routes/activate.tsx"),
  route("reset-password", "routes/reset-password.tsx", [
    route("finish", "routes/reset-password.finish.tsx"),
  ]),
  route("dashboard", "routes/dashboard.tsx"),
  route("settings", "routes/settings.tsx"),
] satisfies RouteConfig;
