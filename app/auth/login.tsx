import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
console.log(API_URL);

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert("Error", "Please enter phone and password");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.error);
        return;
      }

      await signIn(data.token);
      router.replace("/restaurants");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: "center" }}>
      {/* Phone Label */}
      <Text style={{ marginBottom: 4, fontWeight: "600" }}>Phone Number</Text>
      <TextInput
        placeholder="Enter your phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
        }}
      />

      {/* Password Label */}
      <Text style={{ marginBottom: 4, fontWeight: "600" }}>Password</Text>
      <TextInput
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          marginBottom: 24,
        }}
      />

      {/* Login Button */}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}

      {/* Register Link */}
      <TouchableOpacity
        style={{ marginTop: 20 }}
        onPress={() => router.push("/auth/register")}
      >
        <Text style={{ textAlign: "center" }}>
          Don&apos;t have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}
