import { useAuth } from "@/context/auth-context";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
console.log(API_URL);

export default function Login() {
  const router = useRouter();
  const { signIn, googleSignIn } = useAuth();

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
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoIcon}>🍽️</Text>
        <Text style={styles.logoText}>
          Brainy<Text style={styles.logoHighlight}>Food</Text>
        </Text>
        <Text style={styles.logoTagline}>Smart eats, happy treats</Text>
      </View>

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

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Google Sign-In Button */}
      <TouchableOpacity style={styles.googleButton} onPress={googleSignIn}>
        <AntDesign name="google" size={20} color="#fff" />
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    marginBottom: 36,
  },
  logoIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#222",
    letterSpacing: 1,
  },
  logoHighlight: {
    color: "#DB4437",
  },
  logoTagline: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
    fontStyle: "italic",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#888",
    fontWeight: "600",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DB4437",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 10,
  },
  googleButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
