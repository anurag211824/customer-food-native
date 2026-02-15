
import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { token, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (user || token) {
      router.replace("/restaurants");
    } else {
      router.replace("/auth/login");
    }
  }, [isLoading, user, token,router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
