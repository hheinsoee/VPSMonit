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
import { formatPercentage } from "@/lib/utils";

// Optional: You can add a chart library like react-native-chart-kit
// This is a placeholder for where you would import and use charts

export default function CpuScreen() {
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

  // Calculate average CPU load across all cores
  const averageCpuLoad =
    data.cpuLoad.reduce((acc, val) => acc + val, 0) / data.cpuLoad.length;

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
          CPU Usage
        </ThemedText>

        {/* CPU Overview Card */}
        <ThemedView style={[styles.section, styles.overviewCard]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Overall Usage
          </ThemedText>
          <ThemedText style={styles.overallUsage}>
            {formatPercentage(averageCpuLoad)}
          </ThemedText>
          <View style={styles.usageBar}>
            <View
              style={[
                styles.usageBarFill,
                {
                  width: `${Math.min(100, averageCpuLoad)}%`,
                  backgroundColor: getColorForPercentage(averageCpuLoad),
                },
              ]}
            />
          </View>
        </ThemedView>

        {/* CPU Cores Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Core Details
          </ThemedText>
          {data.cpuLoad.map((value, index) => (
            <CoreUsageItem key={index} coreIndex={index} usage={value} />
          ))}
        </ThemedView>

        {/* Here you would add a CPU load history chart using a chart library */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            CPU Load History
          </ThemedText>
          <ThemedText style={styles.placeholderText}>
            CPU load history would be displayed here with a chart library
          </ThemedText>
          {/* This is where you'd add your chart component */}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const CoreUsageItem = ({
  coreIndex,
  usage,
}: {
  coreIndex: number;
  usage: number;
}) => (
  <View style={styles.coreItem}>
    <ThemedText style={styles.coreLabel}>Core {coreIndex + 1}</ThemedText>
    <View style={styles.coreUsageBarContainer}>
      <View style={styles.coreUsageBar}>
        <View
          style={[
            styles.coreUsageBarFill,
            {
              width: `${Math.min(100, usage)}%`,
              backgroundColor: getColorForPercentage(usage),
            },
          ]}
        />
      </View>
      <ThemedText style={styles.coreUsageText}>
        {formatPercentage(usage)}
      </ThemedText>
    </View>
  </View>
);

// Helper function to get color based on CPU usage percentage
const getColorForPercentage = (percentage: number): string => {
  if (percentage < 60) return "#4CAF50"; // Green
  if (percentage < 85) return "#FF9800"; // Orange
  return "#F44336"; // Red
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
  overviewCard: {
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  overallUsage: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#6200ee",
    marginVertical: 10,
  },
  usageBar: {
    width: "100%",
    height: 20,
    backgroundColor: "#77777777",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 10,
  },
  usageBarFill: {
    height: "100%",
  },
  coreItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  coreLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: "bold",
  },
  coreUsageBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  coreUsageBar: {
    flex: 1,
    height: 12,
    backgroundColor: "#77777777",
    borderRadius: 6,
    overflow: "hidden",
    marginRight: 10,
  },
  coreUsageBarFill: {
    height: "100%",
  },
  coreUsageText: {
    width: 60,
    textAlign: "right",
    fontSize: 14,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  highlight: {
    fontWeight: "bold",
    color: "#6200ee",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
  placeholderText: {
    textAlign: "center",
    fontStyle: "italic",
    color: "#757575",
    marginVertical: 20,
  },
});
