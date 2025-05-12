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

export default function DiskScreen() {
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

  // Sort disks by capacity usage (highest first)
  const sortedDisks = [...data.disk].sort((a, b) => {
    const aCapacity = parsePercentage(a.capacity);
    const bCapacity = parsePercentage(b.capacity);
    return bCapacity - aCapacity;
  });

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
          Disk Usage
        </ThemedText>
        <ThemedText style={{ textAlign: "center", margin: 20 }}>
          {formatBytes(parseFloat(sortedDisks[0].available) || 0)} free of{" "}
          {formatBytes(parseFloat(sortedDisks[0].size) || 0)}
        </ThemedText>
        {/* Disk Overview Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Storage Overview
          </ThemedText>

          <ThemedText style={styles.summaryText}>
            Monitoring {data.disk.length} mounted filesystems
          </ThemedText>
        </ThemedView>

        {/* Individual Disk Cards */}
        {sortedDisks.map((disk, index) => {
          const capacityValue = parsePercentage(disk.capacity);
          const capacityColor = getColorForPercentage(capacityValue);

          return (
            <ThemedView key={index} style={styles.diskCard}>
              <View style={styles.diskHeader}>
                <ThemedText
                  style={styles.diskName}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {disk.filesystem}
                </ThemedText>
                <ThemedText
                  style={[styles.diskCapacity, { color: capacityColor }]}
                >
                  {disk.capacity}%
                </ThemedText>
              </View>

              <ThemedText style={styles.diskMountPoint}>
                Mounted on: {disk.mount}
              </ThemedText>

              <View style={styles.usageBar}>
                <View
                  style={[
                    styles.usageBarFill,
                    {
                      width: `${capacityValue}%`,
                      backgroundColor: capacityColor,
                    },
                  ]}
                />
              </View>

              <View style={styles.diskStats}>
                <DiskStat
                  label="Used"
                  value={formatBytes(parseFloat(disk.used) || 0)}
                />
              </View>

              {capacityValue > 85 && (
                <ThemedText style={styles.warningText}>
                  Warning: This filesystem is nearly full!
                </ThemedText>
              )}
            </ThemedView>
          );
        })}

        {/* Recommendations Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Storage Recommendations
          </ThemedText>
          {sortedDisks.some((disk) => parsePercentage(disk.capacity) > 85) ? (
            <ThemedText style={styles.recommendationText}>
              One or more filesystems are approaching capacity limits. Consider
              freeing up space or expanding storage.
            </ThemedText>
          ) : (
            <ThemedText style={styles.recommendationText}>
              All filesystems have adequate free space.
            </ThemedText>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const DiskStat = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.statItem}>
    <ThemedText style={styles.statLabel}>{label}</ThemedText>
    <ThemedText style={styles.statValue}>{value}</ThemedText>
  </View>
);

// Helper function to get color based on disk usage percentage
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
  diskCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  diskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  diskName: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  diskCapacity: {
    fontSize: 16,
    fontWeight: "bold",
  },
  diskMountPoint: {
    fontSize: 14,
    marginBottom: 12,
    fontStyle: "italic",
    color: "#777777",
  },
  usageBar: {
    width: "100%",
    height: 12,
    backgroundColor: "#77777777",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 16,
  },
  usageBarFill: {
    height: "100%",
  },
  diskStats: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: "#777777",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  warningText: {
    color: "#F44336",
    fontWeight: "bold",
    marginTop: 12,
    fontSize: 14,
  },
  recommendationText: {
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
});
