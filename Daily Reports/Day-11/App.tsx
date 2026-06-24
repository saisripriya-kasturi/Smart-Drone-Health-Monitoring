import React, { useState, useEffect, useRef } from "react";
import { 
  Compass, 
  Cpu, 
  Activity, 
  ShieldAlert, 
  Radio, 
  Battery, 
  Wind, 
  ArrowUpRight, 
  Power, 
  MapPin, 
  TriangleAlert, 
  CircleCheck, 
  Terminal, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Clock,
  Database,
  Cloud,
  CircleAlert,
  Sliders,
  ChevronRight,
  KeyRound,
  User
} from "lucide-react";

// Types
type SystemState = "NOMINAL" | "WARNING" | "CRITICAL";

interface LogEntry {
  id: string;
  timestamp: string;
  type: "info" | "warning" | "error" | "success";
  message: string;
}

export default function App() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // Demo Credentials
  const DEMO_USER = "admin";
  const DEMO_PASS = "drone-secure-7";

  // ThingSpeak Cloud & Live Mapping configurations
  const [channelId, setChannelId] = useState<string>("12397"); // Weather Station is highly responsive public channel
  const [readApiKey, setReadApiKey] = useState<string>("");
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false); // Starts in simulation mode for instant rich mock telemetry
  const [lastSyncTime, setLastSyncTime] = useState<string>("Never Synchronized");
  const [syncStatus, setSyncStatus] = useState<"IDLE" | "SYNCING" | "SUCCESS" | "ERROR">("IDLE");
  const [syncErrorMessage, setSyncErrorMessage] = useState<string>("");
  
  // Real-time parameters (Mapped to the 7 Fields from ThingSpeak Cloud structure)
  const [thingspeakBattery, setThingspeakBattery] = useState<string | number>(88);       // Field 1
  const [thingspeakTemp, setThingspeakTemp] = useState<string | number>(36.8);         // Field 2
  const [thingspeakAltitude, setThingspeakAltitude] = useState<string | number>(145.2);   // Field 3
  const [thingspeakMotor, setThingspeakMotor] = useState<string | number>("Active (OK)"); // Field 4
  const [thingspeakLat, setThingspeakLat] = useState<string | number>(37.774929);      // Field 5
  const [thingspeakLng, setThingspeakLng] = useState<string | number>(-122.419416);    // Field 6
  const [thingspeakDuration, setThingspeakDuration] = useState<string | number>(540);     // Field 7

  const [systemAlerts, setSystemAlerts] = useState<string[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemState>("NOMINAL");

  // Log Stream
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "1", timestamp: "07:33:01", type: "info", message: "Kernel secure load completed." },
    { id: "2", timestamp: "07:33:02", type: "success", message: "Satellite link synchronized with 12 geo-nodes." },
    { id: "3", timestamp: "07:33:04", type: "info", message: "IMU auto-calibration state: 100% aligned." },
    { id: "4", timestamp: "07:33:05", type: "success", message: "Operator uplink established. AERO-GUARD X4 READY." }
  ]);

  // Current live time
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Quick helper to append telemetry logs
  const addLog = (message: string, type: "info" | "warning" | "error" | "success" = "info") => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: timeStr,
      type,
      message
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Max 50 items
  };

  // ThingSpeak cloud REST query handler
  const fetchThingSpeakData = async (userInitiated = false) => {
    if (!channelId.trim()) {
      setSyncStatus("ERROR");
      setSyncErrorMessage("Channel ID is empty.");
      if (userInitiated) {
        addLog("Sync failure: Channel ID is vacant.", "error");
      }
      return;
    }

    setSyncStatus("SYNCING");
    if (userInitiated) {
      addLog(`Connecting with ThingSpeak Channel #${channelId}...`, "info");
    }

    try {
      let url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?results=1`;
      if (readApiKey.trim()) {
        url += `&api_key=${readApiKey.trim()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP Error Status ${response.status}`);
      }

      const data = await response.json();
      if (!data.feeds || data.feeds.length === 0) {
        throw new Error("No feeds records found in this channel.");
      }

      const latestFeed = data.feeds[0];
      
      // Update our 7 Fields with live data
      if (latestFeed.field1 !== null && latestFeed.field1 !== undefined) {
        const val = latestFeed.field1;
        setThingspeakBattery(isNaN(Number(val)) ? val : parseFloat(Number(val).toFixed(1)));
      }
      if (latestFeed.field2 !== null && latestFeed.field2 !== undefined) {
        const val = latestFeed.field2;
        setThingspeakTemp(isNaN(Number(val)) ? val : parseFloat(Number(val).toFixed(2)));
      }
      if (latestFeed.field3 !== null && latestFeed.field3 !== undefined) {
        const val = latestFeed.field3;
        setThingspeakAltitude(isNaN(Number(val)) ? val : parseFloat(Number(val).toFixed(1)));
      }
      if (latestFeed.field4 !== null && latestFeed.field4 !== undefined) {
        setThingspeakMotor(latestFeed.field4);
      }
      if (latestFeed.field5 !== null && latestFeed.field5 !== undefined) {
        const val = latestFeed.field5;
        setThingspeakLat(isNaN(Number(val)) ? val : parseFloat(Number(val).toFixed(6)));
      }
      if (latestFeed.field6 !== null && latestFeed.field6 !== undefined) {
        const val = latestFeed.field6;
        setThingspeakLng(isNaN(Number(val)) ? val : parseFloat(Number(val).toFixed(6)));
      }
      if (latestFeed.field7 !== null && latestFeed.field7 !== undefined) {
        const val = latestFeed.field7;
        setThingspeakDuration(isNaN(Number(val)) ? val : Math.max(0, parseInt(val)));
      }

      setSyncStatus("SUCCESS");
      setSyncErrorMessage("");
      const now = new Date().toLocaleTimeString();
      setLastSyncTime(now);
      
      if (userInitiated) {
        addLog(`ThingSpeak synchronized. Feed ID #${latestFeed.entry_id} retrieved successfully.`, "success");
      }
    } catch (err: any) {
      console.error(err);
      setSyncStatus("ERROR");
      setSyncErrorMessage(err.message || "Failed to download feeds.");
      addLog(`ThingSpeak synchronization failure: ${err.message || "Network Error"}.`, "error");
    }
  };

  // Setup loop for cloud synchronization or local hardware simulation
  useEffect(() => {
    if (!isLoggedIn) return;

    let syncInterval: NodeJS.Timeout | null = null;

    if (isLiveMode) {
      // Fetch immediately, then setup 15s interval (standard ThingSpeak public API limit)
      fetchThingSpeakData(true);
      syncInterval = setInterval(() => {
        fetchThingSpeakData(false);
      }, 15000);
    } else {
      // Simulated Telemetry drift - drifts exactly according to the 7 fields format!
      addLog("Local telemetry drift simulation activated.", "info");
      syncInterval = setInterval(() => {
        // Field 1: Battery Data (drifts down slowly)
        setThingspeakBattery(prev => {
          const val = parseFloat(String(prev));
          if (isNaN(val)) return 85;
          return val > 12 ? parseFloat((val - 0.04).toFixed(1)) : 100;
        });

        // Field 2: Temperature Data
        setThingspeakTemp(prev => {
          const val = parseFloat(String(prev));
          if (isNaN(val)) return 36.8;
          const delta = (Math.random() - 0.5) * 0.4;
          return parseFloat(Math.max(28, Math.min(65, val + delta)).toFixed(2));
        });

        // Field 3: Altitude Data
        setThingspeakAltitude(prev => {
          const val = parseFloat(String(prev));
          if (isNaN(val)) return 145.2;
          const delta = (Math.random() - 0.5) * 0.9;
          return parseFloat(Math.max(10, Math.min(290, val + delta)).toFixed(1));
        });

        // Field 4: Motor Status
        setThingspeakMotor(prev => {
          const states = ["Active (OK)", "Active (Load Optimal)", "Active (Divergent Offset)", "Idle"];
          // 90% chance to remain the same, 10% change to randomly shift states
          if (Math.random() > 0.9) {
            const nextIdx = Math.floor(Math.random() * states.length);
            return states[nextIdx];
          }
          return prev;
        });

        // Field 5 & 6: GPS Coordinates
        setThingspeakLat(prev => {
          const val = parseFloat(String(prev));
          if (isNaN(val)) return 37.774929;
          const delta = (Math.random() - 0.5) * 0.0001;
          return parseFloat((val + delta).toFixed(6));
        });
        setThingspeakLng(prev => {
          const val = parseFloat(String(prev));
          if (isNaN(val)) return -122.419416;
          const delta = (Math.random() - 0.5) * 0.0001;
          return parseFloat((val + delta).toFixed(6));
        });

        // Field 7: Flight Duration (up-counts seconds elapsed)
        setThingspeakDuration(prev => {
          const val = parseInt(String(prev));
          if (isNaN(val)) return 540;
          return val + 1;
        });
      }, 1500);
    }

    return () => {
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [isLoggedIn, isLiveMode, channelId, readApiKey]);

  // Handle system warning flags based on Field values
  useEffect(() => {
    if (!isLoggedIn) return;

    const alerts: string[] = [];
    const batteryNum = parseFloat(String(thingspeakBattery));
    const tempNum = parseFloat(String(thingspeakTemp));
    const altitudeNum = parseFloat(String(thingspeakAltitude));

    if (!isNaN(batteryNum) && batteryNum < 20) {
      alerts.push("BATTERY CRITICALLY LOW (< 20%)");
    }
    if (!isNaN(tempNum) && tempNum > 50) {
      alerts.push("EXOTHERMIC THERMAL PEAK DETECTED (> 50°C)");
    }
    if (!isNaN(altitudeNum) && altitudeNum > 240) {
      alerts.push("MAX FLIGHT CEILING FLIGHT CEILING EXCEEDED (> 240M)");
    }
    if (String(thingspeakMotor).toLowerCase().includes("fault") || String(thingspeakMotor).toLowerCase().includes("divergent")) {
      alerts.push("PROPULSION ANOMALY DISCOVERED");
    }

    setSystemAlerts(alerts);

    if (alerts.length > 1) {
      setSystemHealth("CRITICAL");
    } else if (alerts.length === 1) {
      setSystemHealth("WARNING");
    } else {
      setSystemHealth("NOMINAL");
    }
  }, [thingspeakBattery, thingspeakTemp, thingspeakAltitude, thingspeakMotor, isLoggedIn]);

  // Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!username.trim() || !password.trim()) {
      setLoginError("Please complete both access fields.");
      return;
    }

    setIsConnecting(true);

    // Simulate verification latency
    setTimeout(() => {
      if (username === DEMO_USER && password === DEMO_PASS) {
        setIsLoggedIn(true);
        setIsConnecting(false);
        addLog("Security key verified. Drone dashboard uplink granted.", "success");
      } else {
        setLoginError("Access Denied: Invalid Security Signature or Operator ID.");
        setIsConnecting(false);
      }
    }, 1200);
  };

  const fillDemoCredentials = () => {
    setUsername(DEMO_USER);
    setPassword(DEMO_PASS);
    setLoginError("");
  };

  // Demo injection helper
  const triggerSimulation = (type: "wind" | "voltage" | "temp" | "nominal") => {
    if (isLiveMode) {
      addLog("Simulation overrides are rejected during active ThingSpeak Cloud mode.", "warning");
      return;
    }

    if (type === "wind") {
      setThingspeakTemp(44.2);
       setThingspeakAltitude(255)
      addLog("Manual Overrides: Dynamic thermal offset and altitude ceiling breach injected.", "warning");
    } else if (type === "voltage") {
      setThingspeakBattery(12.5);
      addLog("Manual Overrides: Simulated battery cell critical discharge injected.", "error");
    } else if (type === "temp") {
      setThingspeakTemp(58.4);
      addLog("Manual Overrides: High exothermic thermal footprint: 58.4°C injected.", "warning");
    } else {
      setThingspeakBattery(88);
      setThingspeakTemp(34.2);
      setThingspeakAltitude(124.5);
      setThingspeakMotor("Active (OK)");
      setThingspeakLat(37.774929);
      setThingspeakLng(-122.419416);
      setThingspeakDuration(540);
      addLog("Diagnostic sweep completed. Reestablished drone to nominal parameters.", "success");
    }
  };

  // Helper to format Flight Duration seconds beautifully
  const formatDuration = (val: string | number) => {
    const rawSec = parseInt(String(val));
    if (isNaN(rawSec)) return String(val);
    const hrs = Math.floor(rawSec / 3600);
    const mins = Math.floor((rawSec % 3600) / 60);
    const secs = rawSec % 60;
    return `${hrs > 0 ? hrs + "h " : ""}${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#161B22_1px,transparent_1px),linear-gradient(to_bottom,#161B22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-40 pointer-events-none"
        id="grid-bg"
      />

      {/* Ambient Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

      {!isLoggedIn ? (
        // ==================== LOGIN SCREEN ====================
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 relative z-10">
          <div className="w-full max-w-md" id="login-container">
            {/* Logo and Brand Header */}
            <div className="text-center mb-6 flex flex-col items-center">
              <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl mb-3 shadow-lg shadow-cyan-500/5 relative group">
                <div className="absolute inset-0 bg-cyan-500/10 rounded-2xl blur-lg group-hover:opacity-100 transition-opacity opacity-50" />
                <Compass className="w-10 h-10 text-cyan-400 relative z-10 animate-spin" style={{ animationDuration: '20s' }} />
              </div>
              <h1 className="text-2xl font-bold tracking-wider text-white uppercase font-sans">
                AERO-GUARD <span className="text-cyan-400">TELEMETRY</span>
              </h1>
              <p className="text-xs text-slate-400 tracking-widest uppercase mt-0.5">
                IoT Drone Cloud Handshake Interface
              </p>
            </div>

            {/* Login Card */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-black/80">
              {/* Corner crosshairs */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500/60" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500/60" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-500/60" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-500/60" />

              <div className="mb-6 border-b border-slate-800 pb-4">
                <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  AUTHENTICATE OPERATOR
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Establish secure pilot session terminal linkage</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-cyan-400/80 flex items-center justify-between">
                    <span>Operator ID</span>
                    <span className="text-slate-500">demo: admin</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="input-username"
                      type="text"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all font-mono"
                      placeholder="e.g. admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password / Access Key */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-cyan-400/80 flex items-center justify-between">
                    <span>Secure Access Key</span>
                    <span className="text-slate-500">demo: drone-secure-7</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="input-password"
                      type={showPassword ? "text" : "password"}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-11 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all font-mono"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      id="btn-toggle-password"
                      type="button"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error messages */}
                {loginError && (
                  <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl" id="login-error">
                    <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-red-200">{loginError}</span>
                  </div>
                )}

                {/* Confirm Uplink */}
                <button
                  id="btn-login"
                  type="submit"
                  disabled={isConnecting}
                  className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-medium py-3 rounded-xl border border-cyan-500/30 active:scale-[0.98] transition-all flex justify-center items-center gap-2 cursor-pointer shadow-lg shadow-cyan-950/30"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>INITIALIZING CLOUD PORTAL...</span>
                    </>
                  ) : (
                    <>
                      <Power className="w-4 h-4 text-cyan-200" />
                      <span>START TELEMETRY STREAM</span>
                    </>
                  )}
                </button>
              </form>

              {/* Demo auto bypass helper card */}
              <div className="mt-6 p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Quick Bypass Matrix</span>
                  <button
                    id="btn-fill-demo"
                    onClick={fillDemoCredentials}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 uppercase tracking-widest font-mono flex items-center gap-1 hover:underline transition-colors"
                  >
                    Auto-Fill Signature
                  </button>
                </div>
                <div className="space-y-1 text-xs font-mono text-slate-500">
                  <div className="flex justify-between">
                    <span>Operator:</span>
                    <span className="text-slate-300">admin</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Password:</span>
                    <span className="text-slate-300">drone-secure-7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // ==================== DASHBOARD SCREEN ====================
        <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 md:p-6 relative z-10" id="dashboard-container">
          {/* Dashboard Header Bar */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800/80 bg-slate-900/60 backdrop-blur rounded-2xl p-4 md:p-5 mb-6 shadow-md relative">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-950/60 border border-cyan-500/30 rounded-xl shadow-inner relative">
                <Compass className="w-6 h-6 text-cyan-400 animate-spin" style={{ animationDuration: '45s' }} />
                <div className="absolute inset-0 bg-cyan-500/5 rounded-xl blur-xs" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-md md:text-lg font-bold tracking-wider text-slate-100 uppercase">AERO-GUARD CLOUD</h1>
                  <span className="text-[10px] tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    {isLiveMode ? "LIVE CLONED" : "DRIFT SIMULATION"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono tracking-wide mt-0.5">UPLINK SECURE: {DEMO_USER}@thingspeak.cloud</p>
              </div>
            </div>

            {/* Status indicators and system control buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Real-time Clock */}
              <div className="px-3.5 py-1.5 bg-slate-950/80 border border-slate-800/60 rounded-xl font-mono text-xs text-slate-300 tracking-wider flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>UTC {currentTime}</span>
              </div>

              {/* Status indicator */}
              <div className={`px-3 py-1.5 rounded-xl font-mono text-xs border tracking-wider flex items-center gap-1.5 font-semibold ${
                systemHealth === "NOMINAL" 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                  : systemHealth === "WARNING"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}>
                {systemHealth === "NOMINAL" && <CircleCheck className="w-4 h-4 text-emerald-400" />}
                {systemHealth === "WARNING" && <TriangleAlert className="w-4 h-4 text-amber-500 animate-bounce" />}
                {systemHealth === "CRITICAL" && <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />}
                <span>SYS: {systemHealth}</span>
              </div>

              {/* Terminate Session Button */}
              <button
                id="btn-logout"
                onClick={() => {
                  setIsLoggedIn(false);
                  addLog("Operator session secure termination complete.", "info");
                }}
                className="bg-slate-950/80 border border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-red-400 hover:border-red-500/30 font-mono text-xs font-medium py-1.5 px-3.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Power className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" />
                <span>TERMINATE</span>
              </button>
            </div>
          </header>

          {/* Active warnings block */}
          {systemAlerts.length > 0 && (
            <div className="mb-6 bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-xl flex items-start gap-3">
              <TriangleAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 animate-bounce" />
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider block">CRITICAL TELEMETRY LEVEL BREAKS</span>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-300 font-mono">
                  {systemAlerts.map((alert, i) => (
                    <span key={i}>⚠️ {alert}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Grid Space of Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ================== LEFT COLUMN: THE 7 COMPANION DASHBOARD SECTIONS (8/12) ================== */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <h2 className="text-sm font-bold tracking-widest text-cyan-400 font-mono flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  DRONE TELEMETRY METRIC CONSTELLATION [7 MAPPED CHANNELS]
                </h2>
                <span className="text-[10px] text-slate-500 font-mono font-semibold uppercase">Hardware State Overview</span>
              </div>

              {/* Bento Grid: 7 Separate Parameter Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* 1. Battery Telemetry Block (FIELD 1) */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col relative overflow-hidden group hover:border-slate-700/80 transition-colors">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-0.5 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono rounded font-bold">
                      FIELD 1
                    </span>
                    <Battery className="w-4 h-4 text-emerald-400" />
                  </div>

                  <div className="mt-1 font-mono">
                    <div className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">BATTERY ENERGY LEVEL</div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-3xl font-bold text-white tracking-tight">{thingspeakBattery}</span>
                      <span className="text-xs text-emerald-400 font-bold">%</span>
                    </div>
                  </div>

                  {/* High Quality animated battery bar */}
                  <div className="w-full bg-slate-950 h-2.5 rounded-full mt-5 overflow-hidden border border-slate-850 flex p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        parseFloat(String(thingspeakBattery)) > 40 
                          ? "bg-emerald-400" 
                          : parseFloat(String(thingspeakBattery)) > 20 
                          ? "bg-amber-400 animate-pulse" 
                          : "bg-red-500 animate-pulse"
                      }`} 
                      style={{ width: `${Math.min(100, Math.max(0, parseFloat(String(thingspeakBattery)) || 0))}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-850/40">
                    <span>CELL CAPACITY</span>
                    <span className="text-slate-400 font-bold">
                      {parseFloat(String(thingspeakBattery)) < 20 ? "ALERT" : "NOMINAL"}
                    </span>
                  </div>
                </div>

                {/* 2. Temperature Sensor Block (FIELD 2) */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col relative overflow-hidden group hover:border-slate-700/80 transition-colors">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-0.5 bg-orange-950/40 border border-orange-500/20 text-orange-400 text-[9px] font-mono rounded font-bold">
                      FIELD 2
                    </span>
                    <Activity className="w-4 h-4 text-orange-400" />
                  </div>

                  <div className="mt-1 font-mono">
                    <div className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">CELL TEMPERATURE</div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-3xl font-bold text-white tracking-tight">{thingspeakTemp}</span>
                      <span className="text-xs text-orange-400 font-bold">°C</span>
                    </div>
                  </div>

                  {/* Heat bar visual represent */}
                  <div className="w-full bg-slate-950 h-2 rounded-full mt-6 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        parseFloat(String(thingspeakTemp)) > 50 
                          ? "bg-red-500 animate-pulse" 
                          : parseFloat(String(thingspeakTemp)) > 40 
                          ? "bg-amber-400" 
                          : "bg-cyan-400"
                      }`} 
                      style={{ width: `${Math.min(100, Math.max(0, (parseFloat(String(thingspeakTemp)) / 80) * 100))}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-850/40">
                    <span>THERMAL OFFSET</span>
                    <span className={`font-bold ${parseFloat(String(thingspeakTemp)) > 50 ? "text-red-400" : "text-green-400"}`}>
                      {parseFloat(String(thingspeakTemp)) > 50 ? "OVERHEATING" : "SAFE TEMP"}
                    </span>
                  </div>
                </div>

                {/* 3. Altitude Level Block (FIELD 3) */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col relative overflow-hidden group hover:border-slate-700/80 transition-colors">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-0.5 bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 text-[9px] font-mono rounded font-bold">
                      FIELD 3
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-cyan-400" />
                  </div>

                  <div className="mt-1 font-mono">
                    <div className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">ALTITUDE (AGL)</div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-3xl font-bold text-white tracking-tight">{thingspeakAltitude}</span>
                      <span className="text-xs text-cyan-400 font-bold">METERS</span>
                    </div>
                  </div>

                  {/* Vertical bar elevation map */}
                  <div className="w-full bg-slate-950 h-2 rounded-full mt-6 overflow-hidden">
                    <div 
                      className="bg-cyan-500 h-full transition-all duration-1000" 
                      style={{ width: `${Math.min(100, Math.max(0, (parseFloat(String(thingspeakAltitude)) / 300) * 100))}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-850/40">
                    <span>CEILING LIMIT: 240M</span>
                    <span className={`font-bold ${parseFloat(String(thingspeakAltitude)) > 240 ? "text-red-400" : "text-slate-400"}`}>
                      {parseFloat(String(thingspeakAltitude)) > 240 ? "CEILING EXCEEDED" : "STABLE"}
                    </span>
                  </div>
                </div>

                {/* 4. Motor Status Block (FIELD 4) */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col relative overflow-hidden group hover:border-slate-700/80 transition-colors">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-0.5 bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 text-[9px] font-mono rounded font-bold">
                      FIELD 4
                    </span>
                    <Cpu className="w-4 h-4 text-indigo-400" />
                  </div>

                  <div className="mt-1 font-mono">
                    <div className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">PROPULSION STATUS</div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-bold text-white truncate max-w-full block tracking-tight" title={String(thingspeakMotor)}>
                        {thingspeakMotor}
                      </span>
                    </div>
                  </div>

                  {/* Custom motor activity tick LEDs */}
                  <div className="flex gap-1.5 mt-7 py-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-indigo-400 font-mono -mt-1 ml-auto font-bold">ALL ROTORS STABILIZED</span>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-850/40">
                    <span>PROPULSION MATRIX</span>
                    <span className="text-green-400 font-bold">ONLINE</span>
                  </div>
                </div>

                {/* 5. GPS Latitude Block (FIELD 5) */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col relative overflow-hidden group hover:border-slate-700/80 transition-colors">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-0.5 bg-teal-950/40 border border-teal-500/20 text-teal-400 text-[9px] font-mono rounded font-bold">
                      FIELD 5
                    </span>
                    <MapPin className="w-4 h-4 text-teal-400" />
                  </div>

                  <div className="mt-1 font-mono">
                    <div className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">GEODETIC LATITUDE</div>
                    <div className="flex items-baseline gap-0.5 mt-0.5">
                      <span className="text-xl font-bold text-white tracking-tight">{thingspeakLat}</span>
                      <span className="text-[10px] text-teal-400 font-bold">°N</span>
                    </div>
                  </div>

                  {/* Coordinate representation signal radar lines */}
                  <div className="flex items-center gap-1.5 mt-6">
                    <Radio className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[9px] text-slate-500 font-mono tracking-wider font-semibold uppercase">GEODESY CAPTURE</span>
                    <span className="ml-auto text-[10px] text-teal-400 font-bold font-mono">GPS LOCK</span>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-850/40">
                    <span>AXIS VERIFIED</span>
                    <span className="text-slate-400">WGS-84</span>
                  </div>
                </div>

                {/* 6. GPS Longitude Block (FIELD 6) */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col relative overflow-hidden group hover:border-slate-700/80 transition-colors">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-0.5 bg-teal-950/40 border border-teal-500/20 text-teal-400 text-[9px] font-mono rounded font-bold">
                      FIELD 6
                    </span>
                    <MapPin className="w-4 h-4 text-teal-400" />
                  </div>

                  <div className="mt-1 font-mono">
                    <div className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">GEODETIC LONGITUDE</div>
                    <div className="flex items-baseline gap-0.5 mt-0.5">
                      <span className="text-xl font-bold text-white tracking-tight">{thingspeakLng}</span>
                      <span className="text-[10px] text-teal-400 font-bold">°W</span>
                    </div>
                  </div>

                  {/* Satellite lock visual indicators */}
                  <div className="flex items-center gap-1.5 mt-6">
                    <Compass className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[9px] text-slate-500 font-mono tracking-wider font-semibold uppercase">LONGITUDE BEARING</span>
                    <span className="ml-auto text-[10px] text-teal-400 font-bold font-mono">12 NODES</span>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-850/40">
                    <span>BEARING REFERENCE</span>
                    <span className="text-slate-400">PRIME MERIDIAN</span>
                  </div>
                </div>

                {/* 7. Flight Duration Block (FIELD 7) */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col relative overflow-hidden group hover:border-slate-700/80 transition-colors">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-0.5 bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 text-[9px] font-mono rounded font-bold">
                      FIELD 7
                    </span>
                    <Clock className="w-4 h-4 text-cyan-400" />
                  </div>

                  <div className="mt-1 font-mono">
                    <div className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">FLIGHT CHRONOMETER</div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-[22px] font-bold text-white tracking-tight leading-none">
                        {formatDuration(thingspeakDuration)}
                      </span>
                    </div>
                  </div>

                  {/* Elapsed timer progression indicator */}
                  <div className="w-full bg-slate-950 h-1.5 rounded-full mt-6 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-teal-500 h-full animate-pulse" 
                      style={{ width: `${Math.min(100, (parseInt(String(thingspeakDuration)) / 1200) * 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-850/40">
                    <span>ELAPSED SECURITY</span>
                    <span className="text-green-400 font-bold">ACTIVE FLY</span>
                  </div>
                </div>

              </div>

              {/* GEOFENCING INTERACTIVE RADAR SCREEN DETAIL PANEL (COMPREHENSIVE GPS COMPANION VIEW) */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
                  <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-400" />
                    LIVE NAVIGATIONAL COORD-MAPPING GRID
                  </h3>
                  <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">Dynamic Geo-positioning tracking lock</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 space-y-3.5">
                    <p className="text-xs text-slate-400 leading-relaxed font-mono">
                      Continuous real-time geolocation computed from Field 5 (Latitude) and Field 6 (Longitude) data streams.
                    </p>
                    
                    <div className="space-y-2 text-xs font-mono">
                      <div className="bg-slate-950 px-3 py-2 border border-slate-850 rounded-xl flex justify-between">
                        <span className="text-slate-500 text-[10px]">CURRENT LAT</span>
                        <span className="text-slate-300 font-bold">{thingspeakLat}° N</span>
                      </div>
                      <div className="bg-slate-950 px-3 py-2 border border-slate-850 rounded-xl flex justify-between">
                        <span className="text-slate-500 text-[10px]">CURRENT LNG</span>
                        <span className="text-slate-300 font-bold">{thingspeakLng}° W</span>
                      </div>
                    </div>
                  </div>

                  {/* Sweeping target visual */}
                  <div className="md:col-span-8 relative aspect-video bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(20,184,166,0.1)_10%,transparent_11%)] bg-[size:16px_16px] pointer-events-none" />
                    
                    {/* Geofence concentrics */}
                    <div className="w-40 h-40 border border-teal-500/25 rounded-full absolute flex items-center justify-center animate-pulse" />
                    <div className="w-24 h-24 border border-teal-500/10 rounded-full absolute" />
                    <div className="w-10 h-10 border border-teal-500/5 rounded-full absolute" />

                    {/* Laser scanning diagonal */}
                    <div 
                      className="absolute left-1/2 top-1/2 w-48 h-0.5 bg-gradient-to-r from-teal-500/40 to-transparent origin-left rotate-12"
                      style={{ animation: 'spin 5s linear infinite' }}
                    />

                    {/* Flashing Node marker */}
                    <div className="absolute flex flex-col items-center select-none" style={{ left: '52%', top: '38%' }}>
                      <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500 border border-white" />
                      </span>
                      <span className="text-[8px] text-teal-400 font-mono mt-1 font-bold">DRN-AERO4</span>
                    </div>

                    <div className="absolute bottom-2.5 left-3 text-[9px] text-slate-500 font-mono">
                      BASE GEOFENCE STATION REFERENCE: AREA SECURE ALPHA-1
                    </div>
                  </div>
                </div>
              </div>

              {/* DEMO DYNAMIC SIMULATION EMULATOR BUTTONS */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-950/20 shrink-0 pointer-events-none" />
                <div className="mb-4">
                  <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-orange-400" />
                    INTEGRATION OVERLAY: SIMULATED HARDWARE OVERRIDE ENGINE
                  </h3>
                  <p className="text-xs text-slate-400 leading-normal mt-1">
                    Inject mock hazard values directly into the cloud parameters to test system diagnostic warnings. (Requires active Simulation Uplink mode).
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
                  <button
                    id="btn-sim-wind"
                    onClick={() => triggerSimulation("wind")}
                    disabled={isLiveMode}
                    className="p-2.5 bg-red-950/30 border border-red-500/30 hover:border-red-500 text-red-200 hover:text-white disabled:opacity-40 disabled:hover:border-red-500/30 disabled:text-red-300 rounded-xl text-xs font-mono transition-all text-center cursor-pointer"
                  >
                    🚀 Ceiling Over-breach
                  </button>
                  <button
                    id="btn-sim-voltage"
                    onClick={() => triggerSimulation("voltage")}
                    disabled={isLiveMode}
                    className="p-2.5 bg-amber-950/30 border border-amber-500/30 hover:border-amber-500 text-amber-200 hover:text-white disabled:opacity-40 disabled:hover:border-amber-500/30 disabled:text-amber-300 rounded-xl text-xs font-mono transition-all text-center cursor-pointer"
                  >
                    🔋 Critical Depletion
                  </button>
                  <button
                    id="btn-sim-thermal"
                    onClick={() => triggerSimulation("temp")}
                    disabled={isLiveMode}
                    className="p-2.5 bg-orange-950/30 border border-orange-500/30 hover:border-orange-500 text-orange-200 hover:text-white disabled:opacity-40 disabled:hover:border-orange-500/30 disabled:text-orange-300 rounded-xl text-xs font-mono transition-all text-center cursor-pointer"
                  >
                    🔥 High Thermal Surge
                  </button>
                  <button
                    id="btn-sim-nominal"
                    onClick={() => triggerSimulation("nominal")}
                    disabled={isLiveMode}
                    className="p-2.5 bg-emerald-950/30 border border-emerald-500/30 hover:border-emerald-500 text-emerald-200 hover:text-white disabled:opacity-40 disabled:hover:border-emerald-500/30 disabled:text-emerald-300 rounded-xl text-xs font-mono transition-all text-center cursor-pointer"
                  >
                    ✅ Safe System Reset
                  </button>
                </div>
              </div>

            </div>

            {/* ================== RIGHT COLUMN: CONNECTION CONTROL TOWER & SYSTEM INFO (4/12) ================== */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* SYSTEM INFORMATION & CONNECTION CONTROL SECTION */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden" id="connection-center">
                {/* Visual glow backdrop highlight */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3.5 mb-4">
                  <Database className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-widest uppercase font-sans">SYSTEM INFORMATION</h2>
                    <p className="text-[10px] text-slate-400 font-mono">Uplink Gateway & Field Mapping</p>
                  </div>
                </div>

                {/* Cloud specifications requested fields */}
                <div className="space-y-4">
                  {/* Visual specs list */}
                  <div className="bg-slate-950/90 border border-slate-850 p-4 rounded-xl space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-850/50">
                      <span className="text-slate-400">Data Source:</span>
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                        ThingSpeak Cloud
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-slate-850/50">
                      <span className="text-slate-400">Monitored Parameters:</span>
                      <span className="text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 border border-emerald-500/20 rounded">
                        7 Parameters
                      </span>
                    </div>

                    <div className="space-y-1 pt-1">
                      <span className="text-slate-500 text-[10px] block uppercase font-bold">Real-Time Update Status</span>
                      <div className="flex items-center gap-2 mt-1">
                        {syncStatus === "SYNCING" ? (
                          <>
                            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                            <span className="text-cyan-300 font-bold">Synchronizing feeds...</span>
                          </>
                        ) : syncStatus === "SUCCESS" ? (
                          <>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <span className="text-emerald-400 font-bold">CONNECTED & REFRESHED</span>
                          </>
                        ) : syncStatus === "ERROR" ? (
                          <>
                            <CircleAlert className="w-4 h-4 text-red-500 animate-pulse" />
                            <span className="text-red-400 font-bold">MUTED / SYNC ERROR</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            <span className="text-slate-400 font-bold font-semibold uppercase">STANDBY / LOCAL SIM</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Config settings panel to connect users' own channels or modify thingspeak credentials */}
                  <div className="bg-slate-950/60 border border-slate-850/80 p-4 rounded-xl space-y-3.5">
                    <div className="text-[11px] font-mono font-bold tracking-wider text-cyan-400/80 uppercase">
                      THINGSPEAK GATEWAY CONFIG
                    </div>

                    {/* Mode Toggle Switch */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-850/30">
                      <span className="text-xs text-slate-300 font-mono font-semibold">Uplink Mode</span>
                      <button
                        id="btn-toggle-mode"
                        onClick={() => {
                          const nextMode = !isLiveMode;
                          setIsLiveMode(nextMode);
                          addLog(`Switched telemetry system to: ${nextMode ? "ThingSpeak Live Cloud" : "Local Simulator Drift"}.`, "info");
                        }}
                        className={`font-mono text-[9px] font-bold py-1 px-2.5 rounded-md border tracking-widest transition-all cursor-pointer uppercase ${
                          isLiveMode 
                            ? "bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-md shadow-cyan-500/20" 
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300"
                        }`}
                      >
                        {isLiveMode ? "● LIVE CLOUD" : "○ SIMULATION"}
                      </button>
                    </div>

                    {/* Channel ID */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 block uppercase">Channel ID</label>
                      <input
                        id="thingspeak-channel-id"
                        type="text"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        placeholder="e.g. 12397"
                        value={channelId}
                        onChange={(e) => setChannelId(e.target.value)}
                      />
                    </div>

                    {/* Read API Key */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 block uppercase">Read API Key (Optional)</label>
                      <input
                        id="thingspeak-api-key"
                        type="password"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        placeholder="Required for private channels"
                        value={readApiKey}
                        onChange={(e) => setReadApiKey(e.target.value)}
                      />
                    </div>

                    {/* Buttons: Force Sync & Details */}
                    <div className="flex gap-2 pt-1.5">
                      <button
                        id="btn-force-sync"
                        onClick={() => fetchThingSpeakData(true)}
                        className="flex-1 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 hover:border-slate-700/80 rounded-lg py-1.5 px-2 font-mono text-[10px] font-bold text-slate-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                      >
                        <RefreshCw className={`w-3 h-3 text-cyan-400 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
                        FORCE SYNC
                      </button>
                    </div>

                    {/* Synchronization Status details */}
                    <div className="p-2.5 bg-slate-950/80 border border-slate-850/80 rounded-lg text-[10px] font-mono space-y-1 text-slate-400">
                      <div className="flex justify-between">
                        <span>Last Handshake:</span>
                        <span className="text-slate-300 font-bold">{lastSyncTime}</span>
                      </div>
                      {syncErrorMessage && (
                        <div className="text-red-400 text-[9px] mt-1 break-words bg-red-950/10 p-1 rounded border border-red-950">
                          {syncErrorMessage}
                        </div>
                      )}
                      {!isLiveMode && (
                        <p className="text-[9px] text-slate-500 italic leading-normal pt-1 border-t border-slate-850/40">
                          *Simulation feed outputs dynamic drifts. Toggle Live Cloud to execute real HTTP JSON handshakes down from ThingSpeak.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Monitored field definitions mappings requested by user */}
                  <div className="bg-slate-950/40 border border-slate-850/80 p-4 rounded-xl">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 block uppercase mb-2">
                      ThingSpeak Field Structure Map
                    </span>
                    <div className="space-y-1.5 font-mono text-[10px] text-slate-400">
                      <div className="flex justify-between pb-1 border-b border-slate-850/30">
                        <span>Field 1</span>
                        <span className="text-emerald-400 font-bold">Battery telemetry</span>
                      </div>
                      <div className="flex justify-between pb-1 border-b border-slate-850/30">
                        <span>Field 2</span>
                        <span className="text-orange-400 font-bold">Thermal sensor</span>
                      </div>
                      <div className="flex justify-between pb-1 border-b border-slate-850/30">
                        <span>Field 3</span>
                        <span className="text-cyan-400 font-bold">AGL Altitude</span>
                      </div>
                      <div className="flex justify-between pb-1 border-b border-slate-850/30">
                        <span>Field 4</span>
                        <span className="text-indigo-400 font-bold">Propulsion matrix</span>
                      </div>
                      <div className="flex justify-between pb-1 border-b border-slate-850/30">
                        <span>Field 5</span>
                        <span className="text-teal-400 font-bold">GPS Latitude</span>
                      </div>
                      <div className="flex justify-between pb-1 border-b border-slate-850/30">
                        <span>Field 6</span>
                        <span className="text-teal-400 font-bold">GPS Longitude</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Field 7</span>
                        <span className="text-cyan-400 font-bold">Flight duration</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* SECURE Handshake operator console log logs */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-lg flex flex-col h-[280px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <h3 className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-cyan-450" />
                    OPERATOR DIAL HANDSHAKE TERMINAL
                  </h3>
                  <span className="text-[9px] text-slate-500 font-mono uppercase">Log loop</span>
                </div>

                <div 
                  id="log-terminal"
                  className="flex-1 overflow-y-auto pr-1 space-y-2.5 font-mono text-[11px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
                >
                  {logs.map((log) => (
                    <div key={log.id} className="flex gap-2 items-start">
                      <span className="text-slate-500 font-mono text-[10px] flex-shrink-0 mt-0.5 select-none text-right w-14">
                        [{log.timestamp}]
                      </span>
                      <span className={
                        log.type === "success" 
                          ? "text-emerald-400" 
                          : log.type === "warning" 
                          ? "text-amber-400" 
                          : log.type === "error" 
                          ? "text-red-400" 
                          : "text-slate-300"
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
