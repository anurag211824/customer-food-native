
import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { token, isLoading } = useAuth();
  console.log(token);
  
  if (token === null && !isLoading) {
    router.replace("/auth/login");
  } else if (token !== null && !isLoading) {
    router.replace("/restaurants");
  }
  return (
    <View>
      <Text>index</Text>
    </View>
  );
}
