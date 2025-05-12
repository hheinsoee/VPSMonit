import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  View,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useApi } from "@/context/ApiContext";

export default function NetworkScreen() {
  const { data, loading, error, refresh } = useApi();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refresh();
    setTimeout(() => setRefreshing(false), 2000);
  }, [refresh]);

  if (loading || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6200ee" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedText style={styles.errorText}>Error: {error.message}</ThemedText>
      </SafeAreaView>
    );
  }

  // Filter out loopback interfaces
  const activeInterfaces = data.net.filter((iface) => !iface.internal);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6200ee"]}
          />
        }
      >
        <ThemedText type="title" style={styles.title}>
          Network
        </ThemedText>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Network Interfaces
          </ThemedText>
          <ThemedText style={styles.summaryText}>
            {activeInterfaces.length} active network interfaces
          </ThemedText>
        </ThemedView>

        {/* Network Interface Cards */}
        {data.net.map((network, index) => (
          <ThemedView key={index} style={styles.interfaceCard}>
            <View style={styles.interfaceHeader}>
              <ThemedText style={styles.interfaceName}>
                {network.iface}
              </ThemedText>
              <ThemedText
                style={[
                  styles.interfaceStatus,
                  {
                    backgroundColor: network.internal
                      ? "#e0e0e0"
                      : "rgba(76, 175, 80, 0.1)",
                    color: network.internal ? "#757575" : "#4CAF50",
                  },
                ]}
              >
                {network.internal ? "Internal" : "External"}
              </ThemedText>
            </View>

            <View style={styles.interfaceDetails}>
              <DetailItem label="IP Address" value={network.ip4 || "N/A"} />
              <DetailItem label="MAC Address" value={network.mac} />
              <DetailItem
                label="Type"
                value={getInterfaceType(network.iface, network.internal)}
              />
            </View>

            {/* Placeholder for network speed stats */}
            <View style={styles.speedStats}>
              <ThemedText style={styles.speedLabel}>
                TX/RX data would appear here
              </ThemedText>
            </View>
          </ThemedView>
        ))}

        {/* Network Overview Card */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Network Overview
          </ThemedText>

          <View style={styles.chartPlaceholder}>
            <ThemedText style={styles.placeholderText}>
              Network traffic history chart would display here
            </ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailItem}>
    <ThemedText style={styles.detailLabel}>{label}:</ThemedText>
    <ThemedText style={styles.detailValue}>{value}</ThemedText>
  </View>
);

// Helper function to guess network interface type
const getInterfaceType = (name: string, isInternal: boolean): string => {
  if (isInternal) return "Loopback";
  if (name.startsWith("wl") || name.includes("wlan")) return "Wireless";
  if (name.startsWith("en") || name.includes("eth")) return "Ethernet";
  if (name.includes("docker") || name.includes("veth")) return "Virtual";
  if (name.includes("tun") || name.includes("vpn")) return "VPN";
  return "Other";
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingRight: 16,
    paddingLeft: 16,
    paddingBottom: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
  },
  interfaceCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  interfaceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  interfaceName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  interfaceStatus: {
    fontSize: 12,
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  interfaceDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: "bold",
    marginRight: 8,
    width: 100,
  },
  detailValue: {
    flex: 1,
  },
  speedStats: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  speedLabel: {
    fontStyle: "italic",
    color: "#757575",
  },
  chartPlaceholder: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
    marginTop: 16,
  },
  placeholderText: {
    textAlign: "center",
    fontStyle: "italic",
    color: "#757575",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
});
