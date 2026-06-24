/**
 * Aero-Guard Drone Handshake and Telemetry Controller script.
 * Standard Vanilla Client-Side execution script.
 */

// Global constant credentials
const DEMO_USER = "admin";
const DEMO_PASS = "drone-secure-7";

// Run after DOM content finishes parsing
document.addEventListener("DOMContentLoaded", () => {
    
    /* ==========================================================================
       1. LOGIN PORTAL HANDLERS (login.html)
       ========================================================================== */
    const loginForm = document.getElementById("loginForm");
    
    if (loginForm) {
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");
        const btnTogglePassword = document.getElementById("btnTogglePassword");
        const eyeOpen = document.getElementById("eyeOpen");
        const eyeClosed = document.getElementById("eyeClosed");
        const errorNotification = document.getElementById("errorNotification");
        const errorMessage = document.getElementById("errorMessage");
        const btnLogin = document.getElementById("btnLogin");
        const btnAutoFill = document.getElementById("btnAutoFill");

        // Input Password visibility Toggle
        if (btnTogglePassword) {
            btnTogglePassword.addEventListener("click", () => {
                const isPassword = passwordInput.getAttribute("type") === "password";
                passwordInput.setAttribute("type", isPassword ? "text" : "password");
                
                // Toggle Lucide SVGs
                if (isPassword) {
                    eyeOpen.classList.add("hidden");
                    eyeClosed.classList.remove("hidden");
                } else {
                    eyeOpen.classList.remove("hidden");
                    eyeClosed.classList.add("hidden");
                }
            });
        }

        // Auto credentials filler helper
        if (btnAutoFill) {
            btnAutoFill.addEventListener("click", () => {
                usernameInput.value = DEMO_USER;
                passwordInput.value = DEMO_PASS;
                // Clear active error frames
                errorNotification.classList.add("hidden");
            });
        }

        // Credentials form validation submit
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            errorNotification.classList.add("hidden");
            const inputUser = usernameInput.value.trim();
            const inputPass = passwordInput.value.trim();

            if (!inputUser || !inputPass) {
                errorMessage.textContent = "Please provide both operating credentials.";
                errorNotification.classList.remove("hidden");
                return;
            }

            // Visual feedback loop: button loading stage
            const btnSpan = btnLogin.querySelector("span");
            const originalText = btnSpan.textContent;
            btnSpan.textContent = "VERIFYING SIGNATURE...";
            btnLogin.disabled = true;

            setTimeout(() => {
                if (inputUser === DEMO_USER && inputPass === DEMO_PASS) {
                    // Success! Redirect Operator to live console
                    // Setting local session indicator to verify in dashboard
                    localStorage.setItem("operatorSession", inputUser);
                    localStorage.setItem("firstLoadLogs", "true");
                    window.location.href = "dashboard.html";
                } else {
                    // Denied credentials
                    errorMessage.textContent = "Access Denied: Invalid Security Key or Operator ID.";
                    errorNotification.classList.remove("hidden");
                    btnSpan.textContent = originalText;
                    btnLogin.disabled = false;
                }
            }, 1000);
        });
    }


    /* ==========================================================================
       2. DYNAMIC MONITORING DASHBOARD INTERACTION (dashboard.html)
       ========================================================================== */
    const scrollingLogsSection = document.getElementById("scrollingLogsSection");
    
    if (scrollingLogsSection) {
        // Elements configuration
        const liveClock = document.getElementById("liveClock");
        const operatorUserField = document.getElementById("operatorUserField");
        const altValue = document.getElementById("altValue");
        const altFill = document.getElementById("altFill");
        const speedValue = document.getElementById("speedValue");
        const speedFill = document.getElementById("speedFill");
        const signalValue = document.getElementById("signalValue");
        const sigBar4 = document.getElementById("sigBar4");
        const pingText = document.getElementById("pingText");
        const satText = document.getElementById("satText");
        
        // Motors sub-components
        const tabMotorsBtn = document.getElementById("tabMotorsBtn");
        const tabBatteryBtn = document.getElementById("tabBatteryBtn");
        const motorsHealthView = document.getElementById("motorsHealthView");
        const batteryHealthView = document.getElementById("batteryHealthView");
        
        const r1Val = document.getElementById("r1Val");
        const r1Fill = document.getElementById("r1Fill");
        const r2Val = document.getElementById("r2Val");
        const r2Fill = document.getElementById("r2Fill");
        const r3Val = document.getElementById("r3Val");
        const r3Fill = document.getElementById("r3Fill");
        const r4Val = document.getElementById("r4Val");
        const r4Fill = document.getElementById("r4Fill");

        // Battery components
        const batTemp = document.getElementById("batTemp");
        const batVolt = document.getElementById("batVolt");
        const batAmp = document.getElementById("batAmp");

        // Simulation components
        const btnSimWind = document.getElementById("btnSimWind");
        const btnSimLowBat = document.getElementById("btnSimLowBat");
        const btnSimOverheat = document.getElementById("btnSimOverheat");
        const btnSimNominal = document.getElementById("btnSimNominal");
        
        const alertBanner = document.getElementById("alertBanner");
        const alertMessageText = document.getElementById("alertMessageText");
        const systemStatusLabel = document.getElementById("systemStatusLabel");
        const systStateText = document.getElementById("systStateText");
        const btnDisconnect = document.getElementById("btnDisconnect");
        
        // Navigation variables
        const latCoords = document.getElementById("latCoords");
        const lngCoords = document.getElementById("lngCoords");

        // Set verified operator badge
        const storedOperator = localStorage.getItem("operatorSession") || "admin";
        if (operatorUserField) {
            operatorUserField.textContent = storedOperator;
        }

        // Active flight logs dataset
        const logsList = [];

        // Appending logs method
        function logToTerminal(message, type = "info") {
            const timeObj = new Date();
            const timeStr = timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
            
            const logEntry = {
                timestamp: timeStr,
                message: message,
                type: type
            };

            logsList.unshift(logEntry);
            if (logsList.length > 50) logsList.pop(); // limit size

            // Render output inside logs area
            renderLogs();
        }

        function renderLogs() {
            scrollingLogsSection.innerHTML = "";
            logsList.forEach(log => {
                const logDiv = document.createElement("div");
                logDiv.className = "log-entry-row animate-fade-in";
                
                let textClass = "";
                if (log.type === "success") textClass = "log-msg-success";
                else if (log.type === "warning") textClass = "log-msg-warn";
                else if (log.type === "error") textClass = "log-msg-error";
                else textClass = "log-msg-info";

                logDiv.innerHTML = `
                    <span class="log-timestamp">[${log.timestamp}]</span>
                    <span class="${textClass}">${log.message}</span>
                `;
                scrollingLogsSection.appendChild(logDiv);
            });
        }

        // Populate baseline logs on startup
        if (localStorage.getItem("firstLoadLogs") === "true") {
            logToTerminal("Kernel secure diagnostic load complete.", "info");
            setTimeout(() => logToTerminal("Geofence satellite link verified with 12 nodes.", "success"), 250);
            setTimeout(() => logToTerminal("IMU sensor alignments 100% stable.", "info"), 600);
            setTimeout(() => logToTerminal(`Welcome operator ${storedOperator}. Handshake established complete.`, "success"), 900);
            localStorage.removeItem("firstLoadLogs");
        } else {
            logToTerminal("Secure handshake session synchronized.", "success");
        }

        // GMT Navigation Clock Update
        function updateClock() {
            const now = new Date();
            if (liveClock) {
                liveClock.textContent = now.toLocaleTimeString();
            }
        }
        setInterval(updateClock, 1000);
        updateClock();

        /* --- Dynamic Fluctuations Simulation variables --- */
        let stateAltitude = 124.5;
        let stateSpeed = 42.8;
        let stateSignal = 94;
        let isSimulatingAnomaly = false;

        // Interactive dynamic values fluct interval timer
        const sensorFluctuationInterval = setInterval(() => {
            if (isSimulatingAnomaly) return; // Freeze dynamic loops when hazard button is actively showing danger

            // Altitude micro drifts
            const altDrift = (Math.random() - 0.5) * 0.6;
            stateAltitude = Math.max(120, Math.min(130, stateAltitude + altDrift));
            if (altValue) altValue.textContent = stateAltitude.toFixed(1);
            if (altFill) altFill.style.width = `${(stateAltitude / 300) * 100}%`;

            // Speed minor drifts
            const speedDrift = (Math.random() - 0.5) * 0.4;
            stateSpeed = Math.max(39, Math.min(45, stateSpeed + speedDrift));
            if (speedValue) speedValue.textContent = stateSpeed.toFixed(1);
            if (speedFill) speedFill.style.width = `${(stateSpeed / 80) * 100}%`;

            // Fluctuating Rotors RPM slightly
            const r1 = Math.floor(8250 + (Math.random() - 0.5) * 50);
            const r2 = Math.floor(8220 + (Math.random() - 0.5) * 50);
            const r3 = Math.floor(8290 + (Math.random() - 0.5) * 50);
            const r4 = Math.floor(8240 + (Math.random() - 0.5) * 50);

            if (r1Val) r1Val.textContent = `${r1.toLocaleString()} RPM`;
            if (r1Fill) r1Fill.style.width = `${(r1 / 10000) * 100}%`;
            if (r2Val) r2Val.textContent = `${r2.toLocaleString()} RPM`;
            if (r2Fill) r2Fill.style.width = `${(r2 / 10000) * 100}%`;
            if (r3Val) r3Val.textContent = `${r3.toLocaleString()} RPM`;
            if (r3Fill) r3Fill.style.width = `${(r3 / 10000) * 100}%`;
            if (r4Val) r4Val.textContent = `${r4.toLocaleString()} RPM`;
            if (r4Fill) r4Fill.style.width = `${(r4 / 10000) * 100}%`;

            // Mini Voltage drops
            const packVolt = 16.70 + (Math.random() - 0.5) * 0.04;
            if (batVolt) batVolt.textContent = `${packVolt.toFixed(2)} V`;

            // Micro GPS Coordinates drift
            const baseLat = 37.774900 + (Math.random() - 0.5) * 0.0001;
            const baseLng = -122.419400 + (Math.random() - 0.5) * 0.0001;
            if (latCoords) latCoords.textContent = `${baseLat.toFixed(6)}° N`;
            if (lngCoords) lngCoords.textContent = `${baseLng.toFixed(6)}° W`;

        }, 1500);

        /* --- DIAGNOSTICS SUB-TAB HEADERS SWITCH PANEL --- */
        if (tabMotorsBtn && tabBatteryBtn) {
            tabMotorsBtn.addEventListener("click", () => {
                tabMotorsBtn.classList.add("active");
                tabBatteryBtn.classList.remove("active");
                motorsHealthView.classList.remove("hidden");
                batteryHealthView.classList.add("hidden");
            });

            tabBatteryBtn.addEventListener("click", () => {
                tabBatteryBtn.classList.add("active");
                tabMotorsBtn.classList.remove("active");
                motorsHealthView.classList.add("hidden");
                batteryHealthView.classList.remove("hidden");
            });
        }

        /* --- TRICK SYSTEM FAULTS ALARM SIMULATIONS ENGINE --- */
        function triggerSystemStatus(level, message, alertTitle = "") {
            // Remove previous indicators
            systemStatusLabel.className = "system-status-indicator";
            
            if (level === "NOMINAL") {
                systemStatusLabel.classList.add("status-nominal");
                systStateText.textContent = "SYS: NOMINAL";
                alertBanner.classList.add("hidden");
                isSimulatingAnomaly = false;
            } else if (level === "WARNING") {
                systemStatusLabel.classList.add("status-warning");
                systStateText.textContent = `SYS: LIMITS`;
                alertBanner.classList.remove("hidden");
                alertMessageText.textContent = message;
                isSimulatingAnomaly = true;
            } else if (level === "CRITICAL") {
                systemStatusLabel.classList.add("status-critical");
                systStateText.textContent = "SYS: FAULT";
                alertBanner.classList.remove("hidden");
                alertMessageText.textContent = message;
                isSimulatingAnomaly = true;
            }
        }

        // Simulation Button listeners
        if (btnSimWind) {
            btnSimWind.addEventListener("click", () => {
                stateSpeed = 68.4;
                if (speedValue) speedValue.textContent = "68.4";
                if (speedFill) speedFill.style.width = "85%";
                
                // RPM fluctuation spike
                if (r1Val) r1Val.textContent = "9,740 RPM";
                if (r1Fill) r1Fill.style.width = "97.4%";
                if (r4Val) r4Val.textContent = "9,650 RPM";
                if (r4Fill) r4Fill.style.width = "96.5%";

                triggerSystemStatus("WARNING", "FLIGHT CRITICAL ALERT: Heavy wind shear gusts. Adaptive stability lock active.");
                logToTerminal("Warning: Sudden air turbulence drift registered (68.4 knots).", "warning");
            });
        }

        if (btnSimLowBat) {
            btnSimLowBat.addEventListener("click", () => {
                if (batVolt) batVolt.textContent = "13.84 V";
                if (batAmp) {
                    batAmp.textContent = "-12.5 A";
                    batAmp.style.color = "var(--color-rose)";
                }
                
                // Satellite and latency degradation
                if (pingText) pingText.textContent = "45ms";
                if (satText) satText.textContent = "6";
                if (signalValue) signalValue.textContent = "41";
                if (sigBar4) sigBar4.classList.remove("active");

                triggerSystemStatus("CRITICAL", "AUTO-BASE SYSTEM ENGAGED: Drone-cell voltage low. Auto landing scheduled.");
                logToTerminal("CRITICAL FAIL: Low power diagnostic alarm triggered. Cell discharge rate at peak. Retracting link.", "error");
            });
        }

        if (btnSimOverheat) {
            btnSimOverheat.addEventListener("click", () => {
                if (batTemp) batTemp.textContent = "54.8 °C";
                
                triggerSystemStatus("WARNING", "CELL COMPARTMENT OVERHEAT: Thermal overload reached 54.8°C. RPMs choked.");
                logToTerminal("Thermal warning: Brushless cell compartments tracking thermal spike. Limit 48°C breached.", "warning");
            });
        }

        if (btnSimNominal) {
            btnSimNominal.addEventListener("click", () => {
                // Return stats back to safe constants
                stateAltitude = 124.5;
                stateSpeed = 42.8;
                stateSignal = 94;
                
                if (altValue) altValue.textContent = "124.5";
                if (altFill) altFill.style.width = "41%";
                if (speedValue) speedValue.textContent = "42.8";
                if (speedFill) speedFill.style.width = "53%";
                if (signalValue) signalValue.textContent = "94";
                if (sigBar4) sigBar4.classList.add("active");
                if (pingText) pingText.textContent = "8ms";
                if (satText) satText.textContent = "12";
                if (batTemp) batTemp.textContent = "34.2 °C";
                if (batVolt) batVolt.textContent = "16.70 V";
                if (batAmp) {
                    batAmp.textContent = "-4.2 A";
                    batAmp.style.color = "var(--color-green)";
                }

                triggerSystemStatus("NOMINAL");
                logToTerminal("Diagnostics checklist complete. Restoring baseline parameters.", "success");
            });
        }

        // Link Terminate exit route
        if (btnDisconnect) {
            btnDisconnect.addEventListener("click", () => {
                clearInterval(sensorFluctuationInterval);
                localStorage.removeItem("operatorSession");
                window.location.href = "login.html";
            });
        }
    }
});
