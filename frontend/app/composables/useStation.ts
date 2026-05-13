import { ref, computed } from "vue";

export type LogType = "info" | "critical" | "system";
export type StationState = "available" | "unavailable" | "maintenance";

export interface LogEntry {
  time: string;
  type: LogType;
  message: string;
}

function currentTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

export function useStation(
  stationId: string | string[],
  stationStore: ReturnType<typeof useStationStore>,
  logStore: ReturnType<typeof useLogStore>,
) {
  const id = Array.isArray(stationId) ? stationId[0] : stationId;

  const state = computed(
    () => stationStore.currentStation?.state ?? "available",
  );
  const alive = computed(() => stationStore.currentStation?.alive ?? false);

  const isShuttingDown = ref(false);
  const isRestarting = ref(false);
  const isBusy = computed(() => isShuttingDown.value || isRestarting.value);

  const statusLabel = computed(() => {
    if (!alive.value) return "Offline";
    if (state.value === "available") return "Available";
    if (state.value === "unavailable") return "In Use";
    if (state.value === "maintenance") return "Maintenance";
    return "Unknown";
  });

  function addLog(type: LogType, message: string) {
    logStore.logs.push({
      stationId: id,
      type,
      action: message,
      details: message,
      createdAt: new Date().toISOString(),
    });
  }

  async function shutdown() {
    if (isBusy.value) return;
    isShuttingDown.value = true;
    try {
      addLog("system", "Shutdown command received.");
      addLog("info", "Station entering maintenance...");
      await stationStore.executeCommand(id, "shutdown");
      await stationStore.fetchStationById(id);
      addLog(
        "info",
        alive.value ? "Station still alive." : "Station is now offline.",
      );
    } catch (e) {
      addLog("critical", `Shutdown failed: ${e}`);
    } finally {
      isShuttingDown.value = false;
    }
  }

  async function start() {
    if (isBusy.value) return;
    isShuttingDown.value = true;
    try {
      addLog("system", "Start command received.");
      addLog("info", "Station starting up...");
      await stationStore.executeCommand(id, "start");
      await stationStore.fetchStationById(id);
      addLog(
        "info",
        alive.value
          ? "Station is online. State: Available."
          : "Station failed to start.",
      );
    } catch (e) {
      addLog("critical", `Start failed: ${e}`);
    } finally {
      isShuttingDown.value = false;
    }
  }

  async function restart() {
    if (isBusy.value) return;
    isRestarting.value = true;
    try {
      addLog("system", "Restart command received.");
      addLog("info", "Station going offline...");
      await stationStore.executeCommand(id, "restart");
      await stationStore.fetchStationById(id);
      addLog(
        "info",
        alive.value && state.value === "available"
          ? "Station back online. State: Available."
          : "Station failed to restart.",
      );
    } catch (e) {
      addLog("critical", `Restart failed: ${e}`);
    } finally {
      isRestarting.value = false;
    }
  }

  function executeCommand(cmd: string) {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    addLog("system", `> ${trimmed}`);
    const lower = trimmed.toLowerCase();
    if (lower.includes("restart")) restart();
    else if (lower.includes("start")) start();
    else if (lower.includes("shutdown")) shutdown();
    else if (lower.includes("help"))
      addLog("info", "Available commands: restart, shutdown, start, help");
    else addLog("info", `Unknown command: ${trimmed}`);
  }

  function downloadReport() {
    const content = logStore.logs
      .map(
        (l) =>
          `[${new Date(l.createdAt).toLocaleString()}] ${l.type === "critical" ? "[Critical] " : ""}${l.details ?? l.action ?? ""}`,
      )
      .join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `station-report-${id}-${currentTimestamp()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return {
    id,
    state,
    alive,
    statusLabel,
    isShuttingDown,
    isRestarting,
    isBusy,

    addLog,
    shutdown,
    start,
    restart,
    executeCommand,
    downloadReport,
  };
}
