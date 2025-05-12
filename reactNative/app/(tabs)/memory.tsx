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
import { formatBytes, parsePercentage } from "@/lib/utils";

export default function MemoryScreen() {
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

  // Calculate used memory
  const usedMemory = data.mem.total - data.mem.free;
  const usedPercentage = parsePercentage(data.mem.usedPercent);

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
          Memory Usage
        </ThemedText>

        {/* Memory Overview Card */}
        <ThemedView style={[styles.section, styles.overviewCard]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Overall Usage
          </ThemedText>
          <ThemedText style={styles.overallUsage}>
            {data.mem.usedPercent}
          </ThemedText>
          <View style={styles.usageBar}>
            <View
              style={[
                styles.usageBarFill,
                {
                  width: `${Math.min(100, usedPercentage)}%`,
                  backgroundColor: getColorForPercentage(usedPercentage),
                },
              ]}
            />
          </View>
          <View style={styles.memoryStats}>
            <MemoryStat label="Used" value={formatBytes(usedMemory)} />
            <MemoryStat label="Free" value={formatBytes(data.mem.free)} />
            <MemoryStat label="Total" value={formatBytes(data.mem.total)} />
          </View>
        </ThemedView>

        {/* Memory Breakdown */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Memory Breakdown
          </ThemedText>
          <View style={styles.memoryBreakdown}>
            <View style={styles.breakdownItem}>
              <View
                style={[styles.colorIndicator, { backgroundColor: "#6200ee" }]}
              />
              <ThemedText>Used: {formatBytes(usedMemory)}</ThemedText>
            </View>
            <View style={styles.breakdownItem}>
              <View
                style={[styles.colorIndicator, { backgroundColor: "#03DAC6" }]}
              />
              <ThemedText>Free: {formatBytes(data.mem.free)}</ThemedText>
            </View>
          </View>

          <View style={styles.donutChartPlaceholder}>
            <ThemedText style={styles.placeholderText}>
              Memory usage chart would be displayed here with a chart library
            </ThemedText>
          </View>
        </ThemedView>

        {/* Memory Recommendations */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Recommendations
          </ThemedText>
          {usedPercentage > 85 ? (
            <ThemedText style={[styles.recommendation, styles.highUsage]}>
              Memory usage is high. Consider closing unused applications or
              increasing available memory.
            </ThemedText>
          ) : usedPercentage > 70 ? (
            <ThemedText style={[styles.recommendation, styles.mediumUsage]}>
              Memory usage is moderate. Monitor for potential increases.
            </ThemedText>
          ) : (
            <ThemedText style={[styles.recommendation, styles.lowUsage]}>
              Memory usage is at a healthy level.
            </ThemedText>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const MemoryStat = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.memoryStatItem}>
    <ThemedText style={styles.statLabel}>{label}</ThemedText>
    <ThemedText style={styles.statValue}>{value}</ThemedText>
  </View>
);

// Helper function to get color based on memory usage percentage
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
  memoryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  memoryStatItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6200ee",
  },
  memoryBreakdown: {
    marginTop: 10,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  donutChartPlaceholder: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  recommendation: {
    fontSize: 16,
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  highUsage: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    color: "#F44336",
  },
  mediumUsage: {
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    color: "#FF9800",
  },
  lowUsage: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    color: "#4CAF50",
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
  },
});
