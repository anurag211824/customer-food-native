import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Restaurants() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch(`${API_URL}/restaurants`);
      const data = await res.json();
      setRestaurants(data);
    } catch (err) {
      console.log("Error fetching restaurants", err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/restaurants/${item.id}`)}
    >
      <Text style={styles.name}>{item.name}</Text>

      <Text style={styles.cuisine}>
        {item.cuisineTypes.join(" • ")}
      </Text>

      <Text style={styles.cost}>
        ₹{item.costForTwo} for two
      </Text>

      <Text
        style={[
          styles.status,
          { color: item.isOpen ? "green" : "red" },
        ]}
      >
        {item.isOpen ? "Open Now" : "Closed"}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />

      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <Text style={{ color: "white" }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  cuisine: {
    marginTop: 6,
    color: "#555",
  },
  cost: {
    marginTop: 4,
    color: "#777",
  },
  status: {
    marginTop: 8,
    fontWeight: "600",
  },
  logoutBtn: {
    backgroundColor: "black",
    padding: 16,
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
  },
});
