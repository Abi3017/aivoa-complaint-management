import { useEffect, useState } from "react";
import { checkHealth } from "../api/complaintsApi.js";

export default function useHealthCheck(intervalMs = 20000) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function ping() {
      const ok = await checkHealth().catch(() => false);
      if (!cancelled) setIsOnline(ok);
    }

    ping();
    const id = setInterval(ping, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return isOnline;
}
