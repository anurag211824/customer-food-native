import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Register() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleRegister = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, email, password, name }),
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
    }
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: "center" }}>
      {/* Name */}
      <Text style={{ marginBottom: 4, fontWeight: "600" }}>Full Name</Text>
      <TextInput
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
        }}
      />

      {/* Phone */}
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

      {/* Email */}
      <Text style={{ marginBottom: 4, fontWeight: "600" }}>Email Address</Text>
      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
        }}
      />

      {/* Password */}
      <Text style={{ marginBottom: 4, fontWeight: "600" }}>Password</Text>
      <TextInput
        placeholder="Enter your password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          marginBottom: 24,
        }}
      />

      <Button title="Register" onPress={handleRegister} />

      <Text
        style={{ marginTop: 20, textAlign: "center" }}
        onPress={() => router.push("/auth/login")}
      >
        Already have an account? Login
      </Text>
    </View>
  );
}
