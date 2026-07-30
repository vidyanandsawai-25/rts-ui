import { toast } from "sonner";

export const handleLocationClick = async (property: Record<string, unknown> | null) => {
  try {
    const secretKey = "ThaneGisHmacSsoKey@2026#Secure";
    let loggedInName = "Unknown User";
    let loggedInUserId = "1263";

    try {
      if (typeof window !== "undefined") {
        const sessionRaw = sessionStorage.getItem("ptms_session_user");
        if (sessionRaw) {
          const sessionUser = JSON.parse(sessionRaw);
          if (sessionUser?.displayName || sessionUser?.username) {
            loggedInName = String(sessionUser.displayName || sessionUser.username);
          }
          if (sessionUser?.userId) {
            loggedInUserId = String(sessionUser.userId);
          }
        }
      }
    } catch (e) {
      console.warn("Could not read session user for GIS SSO", e);
    }

    const userId = loggedInUserId;
    const name = loggedInName;
    const timestamp = Math.floor(Date.now() / 1000);
    const data = `${userId}${name}${timestamp}`;

    // Also extract property's ownerId for map navigation if needed
    const rawOwnerId = property?.propertyId
    const propertyOwnerId = rawOwnerId ? String(rawOwnerId) : (property?.id ? String(property.id).split('-')[0] : "");

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const dataToSign = encoder.encode(data);

    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await window.crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      dataToSign
    );

    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const signatureHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase();

    const baseUrl = (process.env.NEXT_PUBLIC_GIS_BASE_URL || "https://gisthane.tabamc.in/").replace(/\/$/, "");
    let url = `${baseUrl}/en/gis?userId=${userId}&name=${encodeURIComponent(name)}&timestamp=${timestamp}&signature=${signatureHex}`;

    if (propertyOwnerId) {
      url += `&ownerId=${propertyOwnerId}`;
    }

    window.open(url, "_blank");
  } catch { 
    toast.error("Failed to open map view");
  }
};
