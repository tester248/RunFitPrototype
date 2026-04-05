import { httpLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import Constants from "expo-constants";

import type { AppRouter } from "@/backend/trpc/app-router";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const envUrl =
    process.env.EXPO_PUBLIC_RORK_API_BASE_URL ?? process.env.EXPO_PUBLIC_API_BASE_URL;

  if (envUrl) {
    return envUrl;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:8081`;
  }

  // Fall back to localhost in development so the app can boot without Rork.
  if (__DEV__) {
    console.warn(
      "Missing EXPO_PUBLIC_RORK_API_BASE_URL. Falling back to http://localhost:8081.",
    );
    return "http://localhost:8081";
  }

  throw new Error("Missing API base URL in production environment.");
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
