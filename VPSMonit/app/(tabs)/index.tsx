import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  View,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useApi } from "@/context/ApiContext";
import { formatUptime, parsePercentage } from "@/lib/utils";
import { Link } from "expo-router";

export default function HomeScreen() {
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

  // Calculate average CPU load
  const avgCpuLoad =
    data.cpuLoad.reduce((sum, val) => sum + val, 0) / data.cpuLoad.length;

  // Get most used disk
  const sortedDisks = [...data.disk].sort((a, b) => {
    const aCapacity = parsePercentage(a.capacity);
    const bCapacity = parsePercentage(b.capacity);
    return bCapacity - aCapacity;
  });

  const mostUsedDisk = sortedDisks[0];
  const diskUsage = parsePercentage(mostUsedDisk.capacity);

  // Memory usage percentage
  const memoryUsage = parsePercentage(data.mem.usedPercent);

  // Network interfaces count
  const externalInterfaces = data.net.filter((n) => !n.internal).length;

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
        <ThemedView style={styles.headerCard}>
          <ThemedText type="title" style={styles.title}>
            VPS Monitor
          </ThemedText>
          <View style={styles.uptimeRow}>
            <ThemedText style={styles.uptimeValue}>
              {formatUptime(data.uptime)}
            </ThemedText>
            <View style={styles.uptimeStatus}>
              <View style={styles.statusDot} />
              <ThemedText style={styles.uptimeStatusText}>Online</ThemedText>
            </View>
          </View>
        </ThemedView>

        <View style={styles.dashboardGrid}>
          <Link href="/(tabs)/cpu" asChild>
            <TouchableOpacity style={styles.dashboardCard}>
              <View
                style={[
                  styles.cardStatusIndicator,
                  { backgroundColor: getStatusColor(avgCpuLoad) },
                ]}
              />
              <ThemedText style={styles.cardTitle}>CPU</ThemedText>
              <ThemedText
                style={styles.cardValue}
              >{`${avgCpuLoad.toFixed(1)}%`}</ThemedText>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/memory" asChild>
            <TouchableOpacity style={styles.dashboardCard}>
              <View
                style={[
                  styles.cardStatusIndicator,
                  { backgroundColor: getStatusColor(memoryUsage) },
                ]}
              />
              <ThemedText style={styles.cardTitle}>Memory</ThemedText>
              <ThemedText style={styles.cardValue}>
                {data.mem.usedPercent}
              </ThemedText>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/disk" asChild>
            <TouchableOpacity style={styles.dashboardCard}>
              <View
                style={[
                  styles.cardStatusIndicator,
                  { backgroundColor: getStatusColor(diskUsage) },
                ]}
              />
              <ThemedText style={styles.cardTitle}>Disk</ThemedText>
              <ThemedText style={styles.cardValue}>
                {mostUsedDisk.capacity}
              </ThemedText>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/network" asChild>
            <TouchableOpacity style={styles.dashboardCard}>
              <View
                style={[
                  styles.cardStatusIndicator,
                  { backgroundColor: "#4CAF50" },
                ]}
              />
              <ThemedText style={styles.cardTitle}>Network</ThemedText>
              <ThemedText
                style={styles.cardValue}
              >{`${externalInterfaces} interfaces`}</ThemedText>
            </TouchableOpacity>
          </Link>
        </View>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            System Status
          </ThemedText>
          <View style={styles.statusGrid}>
            <View style={styles.statusColumn}>
              <StatusItem
                label="Server Status"
                status="Online"
                statusType="good"
              />
              <StatusItem
                label="CPU Load"
                status={getCpuLoadStatus(data.cpuLoad)}
                statusType={getCpuLoadStatusType(data.cpuLoad)}
              />
            </View>
            <View style={styles.statusColumn}>
              <StatusItem
                label="Memory"
                status={getMemoryStatus(data.mem.usedPercent)}
                statusType={getMemoryStatusType(data.mem.usedPercent)}
              />
              <StatusItem
                label="Disk"
                status={getDiskStatus(data.disk)}
                statusType={getDiskStatusType(data.disk)}
              />
            </View>
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Alerts
          </ThemedText>
          {getSystemAlerts(data)}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

// Components
const StatusItem = ({
  label,
  status,
  statusType,
}: {
  label: string;
  status: string;
  statusType: "good" | "warning" | "critical";
}) => {
  const getStatusColor = () => {
    switch (statusType) {
      case "good":
        return "#4CAF50";
      case "warning":
        return "#FF9800";
      case "critical":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  return (
    <View style={styles.statusItem}>
      <ThemedText style={styles.statusLabel}>{label}</ThemedText>
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor() },
          ]}
        />
        <ThemedText style={[styles.statusText, { color: getStatusColor() }]}>
          {status}
        </ThemedText>
      </View>
    </View>
  );
};

// Helper function to determine status color based on usage percentage
const getStatusColor = (percentage: number): string => {
  if (percentage < 60) return "#4CAF50"; // Green
  if (percentage < 85) return "#FF9800"; // Orange
  return "#F44336"; // Red
};

// Helper functions for system status
const getCpuLoadStatus = (cpuLoad: number[]): string => {
  const avgLoad = cpuLoad.reduce((sum, val) => sum + val, 0) / cpuLoad.length;
  if (avgLoad < 60) return "Normal";
  if (avgLoad < 85) return "Moderate";
  return "High";
};

const getCpuLoadStatusType = (
  cpuLoad: number[],
): "good" | "warning" | "critical" => {
  const avgLoad = cpuLoad.reduce((sum, val) => sum + val, 0) / cpuLoad.length;
  if (avgLoad < 60) return "good";
  if (avgLoad < 85) return "warning";
  return "critical";
};

const getMemoryStatus = (usedPercent: string): string => {
  const percentage = parsePercentage(usedPercent);
  if (percentage < 60) return "Normal";
  if (percentage < 85) return "Moderate";
  return "High";
};

const getMemoryStatusType = (
  usedPercent: string,
): "good" | "warning" | "critical" => {
  const percentage = parsePercentage(usedPercent);
  if (percentage < 60) return "good";
  if (percentage < 85) return "warning";
  return "critical";
};

const getDiskStatus = (disks: any[]): string => {
  const highUsageDisks = disks.filter((disk) => {
    const usage = parsePercentage(disk.capacity);
    return usage > 85;
  });

  if (highUsageDisks.length === 0) return "Normal";
  if (highUsageDisks.length < disks.length / 2) return "Some disks high";
  return "Multiple disks high";
};

const getDiskStatusType = (disks: any[]): "good" | "warning" | "critical" => {
  const highUsageDisks = disks.filter((disk) => {
    const usage = parsePercentage(disk.capacity);
    return usage > 85;
  });

  if (highUsageDisks.length === 0) return "good";
  if (highUsageDisks.length < disks.length / 2) return "warning";
  return "critical";
};

// Function to generate alerts based on system data
const getSystemAlerts = (data: any) => {
  const alerts = [];

  // Check CPU load
  const avgCpuLoad =
    data.cpuLoad.reduce((sum: number, val: number) => sum + val, 0) /
    data.cpuLoad.length;
  if (avgCpuLoad > 85) {
    alerts.push(
      <AlertItem key="cpu" type="critical" message="CPU usage is very high" />,
    );
  } else if (avgCpuLoad > 70) {
    alerts.push(
      <AlertItem key="cpu" type="warning" message="CPU usage is elevated" />,
    );
  }

  // Check memory
  const memUsage = parsePercentage(data.mem.usedPercent);
  if (memUsage > 85) {
    alerts.push(
      <AlertItem
        key="memory"
        type="critical"
        message="Memory usage is very high"
      />,
    );
  } else if (memUsage > 70) {
    alerts.push(
      <AlertItem
        key="memory"
        type="warning"
        message="Memory usage is elevated"
      />,
    );
  }

  // Check disks
  data.disk.forEach((disk: any, index: number) => {
    const usage = parsePercentage(disk.capacity);
    if (usage > 90) {
      alerts.push(
        <AlertItem
          key={`disk-${index}`}
          type="critical"
          message={`Disk ${disk.filesystem} is almost full (${disk.capacity})`}
        />,
      );
    } else if (usage > 80) {
      alerts.push(
        <AlertItem
          key={`disk-${index}`}
          type="warning"
          message={`Disk ${disk.filesystem} is filling up (${disk.capacity})`}
        />,
      );
    }
  });

  if (alerts.length === 0) {
    return (
      <ThemedText style={styles.noAlertsText}>
        No critical alerts at this time
      </ThemedText>
    );
  }

  return alerts;
};

const AlertItem = ({
  type,
  message,
}: {
  type: "warning" | "critical";
  message: string;
}) => {
  const alertColor = type === "critical" ? "#F44336" : "#FF9800";

  return (
    <View style={[styles.alertItem, { borderLeftColor: alertColor }]}>
      <View style={[styles.alertDot, { backgroundColor: alertColor }]} />
      <ThemedText style={styles.alertText}>{message}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#f8f8f8",
  },
  scrollContainer: {
    paddingRight: 16,
    paddingLeft: 16,
    paddingBottom: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  section: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
  dashboardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dashboardCard: {
    width: "48%",
    backgroundColor: "#222222",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  cardStatusIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 4,
    height: "100%",
  },
  cardTitle: {
    fontSize: 14,
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0099ff",
  },
  headerCard: {
    padding: 16,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "#6200ee0f",
  },
  uptimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  uptimeValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0099ff",
  },
  uptimeStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 6,
  },
  uptimeStatusText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  viewMoreButton: {
    backgroundColor: "#6200ee",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  viewMoreText: {
    color: "white",
    fontWeight: "bold",
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#0000000f",
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  alertDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
  },
  noAlertsText: {
    textAlign: "center",
    fontStyle: "italic",
    padding: 16,
    color: "#4CAF50",
  },
  statusGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusColumn: {
    width: "48%",
  },
  statusItem: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 14,
    color: "#666",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontWeight: "bold",
  },
});
