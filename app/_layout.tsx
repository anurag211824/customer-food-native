import { Colors } from "@/constants/colors";
import { AuthProvider } from "@/context/auth-context";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_900Black,
  useFonts,
} from "@expo-google-fonts/nunito";
import { Stack } from "expo-router";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_900Black,
  });
  if (!fontsLoaded) {
    return null;
  }
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerTitle: () => null,
            headerStyle: {
              backgroundColor: Colors.primary,
            },

            headerTintColor: Colors.white,

            headerTitleStyle: {
              fontWeight: "600",
              fontSize: 20,
            },

            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
