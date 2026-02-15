import { BASE_URL, COOKIE_NAME } from "@/constant";
import {
  AuthError,
  AuthRequestConfig,
  DiscoveryDocument,
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Linking, Platform } from "react-native";
// Platform-agnostic storage: SecureStore on native, localStorage on web
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider?: string;
  exp?: number;
  cookieExpiration?: number;
};
type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  googleSignIn?: () => Promise<void>;
  googleSignOut?: () => Promise<void>;
  error: AuthError | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  googleSignIn: async () => {},
  googleSignOut: async () => {},
  error: null as AuthError | null,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  // config and discovery for Google OAuth
  const config: AuthRequestConfig = {
    clientId: "google",
    scopes: ["openid", "profile", "email"],
    redirectUri: makeRedirectUri(),
  };
  const discovery: DiscoveryDocument = {
    authorizationEndpoint: `${BASE_URL}/api/auth/authorize`,
    tokenEndpoint: `${BASE_URL}/api/auth/token`,
  };
  // useAuthRequest hook to create the auth request and handle responses
  const [request, response, promptAsync] = useAuthRequest(config, discovery);

  // On app load, check for existing session token and restore user session if valid
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await storage.getItem(COOKIE_NAME);
        console.log("Found existing session token", token);
        if (token) {
          console.log("Found existing session token");
          // Ideally verify token with backend or decode it.
          // For now, attempting to decode the payload part of the JWT
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            console.log("Decoded token payload", payload);
            setUser({
              id: payload.id,
              name: payload.name,
              email: payload.email,
              avatarUrl: payload.picture,
            });
          } catch (e) {
            console.error("Failed to decode token", e);
            await storage.deleteItem(COOKIE_NAME);
          }
        }
      } catch (e) {
        console.error("Failed to restore session", e);
      }
    };
    checkSession();
  }, [response]);

  // Handle deep links for OAuth redirect and token exchange
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await storage.getItem("token");
        setToken(storedToken);
      } catch (err) {
        console.error("Failed to load token:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  useEffect(() => {
    const handleDeepLink = async () => {
      let code;
      if (response?.type === "success") {
        code = response.params.code;
      }

      // On web, check the URL hash for the OAuth code (from full-page redirect)
      if (!code && Platform.OS === "web") {
        const hash = window.location.hash;
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1));
          code = hashParams.get("code") ?? undefined;
        }
      }

      if (!code) {
        const url = await Linking.getInitialURL();
        console.log("Redirected URL:", url);
        if (url) {
          const match = url.match(/code=([^&]+)/);
          if (match) code = decodeURIComponent(match[1]);
        }
      }

      if (!code) return;

      console.log("Decoded OAuth code:", code);

      const existingToken = await storage.getItem(COOKIE_NAME);
      if (existingToken) {
        console.log("Session exists, skipping token exchange");
        if (Platform.OS === "web")
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        return;
      }

      setIsLoading(true);

      try {
        const res = await fetch(`${BASE_URL}/api/auth/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          avatarUrl: data.user.picture,
        });

        await storage.setItem(COOKIE_NAME, data.token);

        if (Platform.OS === "web") {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        }

        console.log("User set successfully ✅");
        router.replace("/restaurants");
      } catch (err) {
        console.error("Token exchange failed:", err);
        setError({ message: "Login failed" } as AuthError);
      } finally {
        setIsLoading(false);
      }
    };

    handleDeepLink();
  }, [response]);

  const signIn = async (newToken: string) => {
    const tokenString =
      typeof newToken === "string" ? newToken : JSON.stringify(newToken);
    await storage.setItem("token", tokenString);
    setToken(tokenString);
  };

  const signOut = async () => {
    await storage.deleteItem("token");
    setToken(null);
    router.replace("/auth/login");
  };
  const googleSignIn = async () => {
    try {
      if (Platform.OS === "web") {
        // Use full-page redirect on web to avoid COOP popup issues
        const redirectUri = makeRedirectUri();
        const state = Math.random().toString(36).substring(2, 15);
        const params = new URLSearchParams({
          client_id: "google",
          redirect_uri: redirectUri,
          scope: "openid profile email",
          state,
        });
        window.location.href = `${BASE_URL}/api/auth/authorize?${params.toString()}`;
        return;
      }
      if (!request) {
        console.log("no request");
        setError({ message: "Failed to create auth request" } as AuthError);
        return;
      }
      await promptAsync();
    } catch (err) {
      console.error("Error during sign-in:", err);
    }
  };

  const googleSignOut = async () => {
    await storage.deleteItem("token");
    setToken(null);
  };
  return (
    <AuthContext.Provider
      value={{
        token,
        isLoading,
        signIn,
        signOut,
        googleSignIn,
        googleSignOut,
        error,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
