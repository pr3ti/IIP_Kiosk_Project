// Kiosk auto-reload with blank offline screen

(() => {
    const BOOT_KEY = "kiosk_boot_id";
    const STATUS_URL = "/api/server-status";
    const SSE_URL = "/api/reload-stream";

    let offlineShown = false;
    let recovering = false;

    function ensureCssLoaded() {
        if (document.getElementById("kiosk-auto-reload-css")) {
            return;
        }

        const link = document.createElement("link");
        link.id = "kiosk-auto-reload-css";
        link.rel = "stylesheet";
        link.href = "/KioskAutoReload.css";

        document.head.appendChild(link);
    }

    function showOfflineScreen() {
        if (offlineShown) {
            return;
        }

        ensureCssLoaded();
        offlineShown = true;

        const overlay = document.createElement("div");
        overlay.id = "kiosk-offline-overlay";

        overlay.innerHTML = `
            <div class="kiosk-offline-box">
                <div class="kiosk-title">Server Offline</div>
                <div class="kiosk-subtitle">Reconnecting…</div>
                <div class="kiosk-text">
                    This page will refresh automatically when the server is back.
                </div>
            </div>
        `;

        document.body.style.overflow = "hidden";
        document.body.appendChild(overlay);
    }

    function hideOfflineScreen() {
        const overlay = document.getElementById("kiosk-offline-overlay");
        if (overlay) {
            overlay.remove();
        }

        document.body.style.overflow = "";
        offlineShown = false;
    }

    function hardReload() {
        const url = new URL(window.location.href);
        url.searchParams.set("_r", Date.now());
        window.location.replace(url.toString());
    }

    async function fetchBootId() {
        const res = await fetch(STATUS_URL, { cache: "no-store" });
        if (!res.ok) {
            throw new Error(`server-status HTTP ${res.status}`);
        }
        const data = await res.json();
        return data.bootId;
    }

    function handleBootId(newBootId) {
        const lastBootId = localStorage.getItem(BOOT_KEY);

        if (!lastBootId) {
            localStorage.setItem(BOOT_KEY, newBootId);
            return;
        }

        if (lastBootId !== newBootId) {
            localStorage.setItem(BOOT_KEY, newBootId);
            hardReload();
        }
    }

    async function recoverLoop() {
        if (recovering) {
            return;
        }

        recovering = true;
        showOfflineScreen();

        while (true) {
            try {
                const bootId = await fetchBootId();
                localStorage.setItem(BOOT_KEY, bootId);
                hideOfflineScreen();
                hardReload();
                return;
            } catch (_) {}

            await new Promise(r => setTimeout(r, 2000));
        }
    }

    function startHeartbeat() {
        setInterval(async () => {
            try {
                const bootId = await fetchBootId();

                if (offlineShown) {
                    localStorage.setItem(BOOT_KEY, bootId);
                    hideOfflineScreen();
                    hardReload();
                    return;
                }

                handleBootId(bootId);
            } catch (_) {
                recoverLoop();
            }
        }, 2000);
    }

    function startSSE() {
        try {
            const es = new EventSource(SSE_URL);

            es.addEventListener("boot", (e) => {
                if (offlineShown) {
                    localStorage.setItem(BOOT_KEY, e.data);
                    hideOfflineScreen();
                    hardReload();
                    return;
                }

                handleBootId(e.data);
            });

            es.onerror = () => {
                try {
                    es.close();
                } catch {}

                recoverLoop();
            };
        } catch (_) {
            // Heartbeat will handle recovery
        }
    }

    startSSE();
    startHeartbeat();
})();