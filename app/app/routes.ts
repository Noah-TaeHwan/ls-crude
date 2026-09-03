import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("research", "routes/research.tsx"),
  route("backtest", "routes/backtest.tsx"),
] satisfies RouteConfig;
