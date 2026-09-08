import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("observations/tankers", "routes/tankers.tsx"),
  route("observations/visibility", "routes/visibility.tsx"),
  route("research", "routes/research.tsx"),
  route("backtest", "routes/backtest.tsx"),
] satisfies RouteConfig;
