import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("observations/tankers", "routes/tankers.tsx"),
  route("observations/empties", "routes/empties.tsx"),
  route("observations/visibility", "routes/visibility.tsx"),
  route("observations/cushing-busy", "routes/cushing-busy.tsx"),
  route("research", "routes/research.tsx"),
  route("history", "routes/history.tsx"),
  route("backtest", "routes/backtest.tsx"),
  route("api/local-status", "routes/api.local-status.ts"),
  route("cai-team-workflow.md", "routes/team-workflow.ts"),
] satisfies RouteConfig;
