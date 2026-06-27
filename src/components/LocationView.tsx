// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { X, MapPin, Navigation, Copy, ExternalLink, Check } from "lucide-react";

// import { Language } from "@/types/service.types";
// import { AuthUserData } from "@/types/safe";
// import { Button } from "@/components/common/Button";

// interface LocationViewProps {
//   language: Language;
//   darkMode?: boolean;
//   authUser?: {
//     userType: "user" | "admin";
//     userData: AuthUserData;
//   } | null;
//   onClose: () => void;
// }

// type LatLng = { lat: number; lng: number };

// export function LocationView(props: LocationViewProps) {
//   const { language, darkMode = false, onClose } = props;

//   const [location, setLocation] = useState<LatLng | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [copied, setCopied] = useState(false);

//   const fallback = useMemo<LatLng>(() => ({ lat: 20.7002, lng: 77.0082 }), []); // Akola

//   useEffect(() => {
//     setLoading(true);
//     setError(null);

//     if (!navigator.geolocation) {
//       setLocation(fallback);
//       setError(
//         language === "en"
//           ? "Geolocation not supported. Showing default location (Akola, Maharashtra)."
//           : language === "hi"
//           ? "आपका ब्राउज़र भू-स्थान का समर्थन नहीं करता। डिफ़ॉल्ट स्थान दिखाया जा रहा है (अकोला, महाराष्ट्र)।"
//           : "तुमचा ब्राउझर भौगोलिक स्थान समर्थित करत नाही. डीफॉल्ट स्थान दाखवत आहे (अकोला, महाराष्ट्र)."
//       );
//       setLoading(false);
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
//         setLoading(false);
//       },
//       (err) => {
//         setLocation(fallback);

//         let msg = "";
//         switch (err.code) {
//           case err.PERMISSION_DENIED:
//             msg =
//               language === "en"
//                 ? "Location access denied. Showing default location (Akola, Maharashtra)."
//                 : language === "hi"
//                 ? "स्थान अनुमति अस्वीकृत। डिफ़ॉल्ट स्थान दिखाया जा रहा है (अकोला, महाराष्ट्र)।"
//                 : "स्थान परवानगी नाकारली. डीफॉल्ट स्थान दाखवत आहे (अकोला, महाराष्ट्र).";
//             break;
//           case err.POSITION_UNAVAILABLE:
//             msg =
//               language === "en"
//                 ? "Location unavailable. Showing default location (Akola, Maharashtra)."
//                 : language === "hi"
//                 ? "स्थान जानकारी अनुपलब्ध। डिफ़ॉल्ट स्थान दिखाया जा रहा है (अकोला, महाराष्ट्र)।"
//                 : "स्थान माहिती अनुपलब्ध. डीफॉल्ट स्थान दाखवत आहे (अकोला, महाराष्ट्र).";
//             break;
//           case err.TIMEOUT:
//             msg =
//               language === "en"
//                 ? "Location request timed out. Showing default location (Akola, Maharashtra)."
//                 : language === "hi"
//                 ? "स्थान अनुरोध का समय समाप्त। डिफ़ॉल्ट स्थान दिखाया जा रहा है (अकोला, महाराष्ट्र)।"
//                 : "स्थान विनंती कालबाह्य. डीफॉल्ट स्थान दाखवत आहे (अकोला, महाराष्ट्र).";
//             break;
//           default:
//             msg =
//               language === "en"
//                 ? "Unable to get location. Showing default location (Akola, Maharashtra)."
//                 : language === "hi"
//                 ? "स्थान प्राप्त नहीं हो सका। डिफ़ॉल्ट स्थान दिखाया जा रहा है (अकोला, महाराष्ट्र)।"
//                 : "स्थान मिळू शकले नाही. डीफॉल्ट स्थान दाखवत आहे (अकोला, महाराष्ट्र).";
//         }

//         setError(msg);
//         setLoading(false);
//       },
//       { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//     );
//   }, [language, fallback]);

//   const copyCoordinates = async () => {
//     if (!location) return;
//     try {
//       await navigator.clipboard.writeText(`${location.lat}, ${location.lng}`);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 1500);
//     } catch {
//       setCopied(false);
//     }
//   };

//   const openInGoogleMaps = () => {
//     if (!location) return;
//     window.open(`https://www.google.com/maps?q=${location.lat},${location.lng}`, "_blank");
//   };

//   // ✅ Dummy registered address (replace later with props.authUser mapping)
//   const registeredAddress = {
//     line1:
//       language === "en"
//         ? "Plot 123, Sector 15"
//         : language === "hi"
//         ? "प्लॉट 123, सेक्टर 15"
//         : "प्लॉट 123, सेक्टर 15",
//     line2:
//       language === "en"
//         ? "Akola, Maharashtra - 444001"
//         : language === "hi"
//         ? "अकोला, महाराष्ट्र - 444001"
//         : "अकोला, महाराष्ट्र - 444001",
//     country: language === "en" ? "India" : language === "hi" ? "भारत" : "भारत",
//   };

//   return (
//     <div
//       className={[
//         "w-full max-w-4xl max-h-[85vh] rounded-xl shadow-2xl overflow-hidden",
//         darkMode ? "bg-gray-900" : "bg-white",
//       ].join(" ")}
//     >
//       {/* Header */}
//       <div
//         className={[
//           "p-6 border-b",
//           darkMode
//             ? "bg-gray-800 border-gray-700"
//             : "bg-gradient-to-r from-orange-100 via-red-100 to-pink-100 border-gray-200",
//         ].join(" ")}
//       >
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <div
//               className={[
//                 "p-3 rounded-lg",
//                 darkMode ? "bg-orange-500/20" : "bg-white/60 backdrop-blur-sm",
//               ].join(" ")}
//             >
//               <MapPin className={["w-8 h-8", darkMode ? "text-orange-400" : "text-orange-600"].join(" ")} />
//             </div>

//             <div>
//               <h2 className={["text-2xl font-bold", darkMode ? "text-white" : "text-gray-900"].join(" ")}>
//                 {language === "en" ? "My Location" : language === "hi" ? "मेरा स्थान" : "माझे स्थान"}
//               </h2>

//               <p className={["text-sm mt-1", darkMode ? "text-gray-300" : "text-gray-700"].join(" ")}>
//                 {language === "en"
//                   ? "Live location tracking"
//                   : language === "hi"
//                   ? "लाइव स्थान ट्रैकिंग"
//                   : "थेट स्थान ट्रॅकिंग"}
//               </p>
//             </div>
//           </div>

//           <Button
//             onClick={onClose}
//             variant="ghost"
//             size="icon"
//             className={[
//               "rounded-full",
//               darkMode ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-white/60",
//             ].join(" ")}
//           >
//             <X className="w-6 h-6" />
//           </Button>
//         </div>
//       </div>

//       {/* Body (single scrollbar ✅) */}
//       <div className="p-6 space-y-6">
//         {error && (
//           <div
//             className={[
//               "rounded-lg p-4",
//               darkMode ? "bg-amber-500/20 border border-amber-500/30" : "bg-amber-50 border border-amber-200",
//             ].join(" ")}
//           >
//             <p className={["text-sm", darkMode ? "text-amber-300" : "text-amber-800"].join(" ")}>{error}</p>
//           </div>
//         )}

//         {loading && (
//           <div className="text-center py-12">
//             <div className="inline-block w-12 h-12 border-4 border-t-orange-500 border-r-orange-500 border-b-transparent border-l-transparent rounded-full animate-spin" />
//             <p className={["mt-4", darkMode ? "text-gray-400" : "text-gray-600"].join(" ")}>
//               {language === "en"
//                 ? "Getting your location..."
//                 : language === "hi"
//                 ? "आपका स्थान प्राप्त कर रहे हैं..."
//                 : "तुमचे स्थान मिळवत आहे..."}
//             </p>
//           </div>
//         )}

//         {!loading && location && (
//           <>
//             <div className="rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
//               <iframe
//                 src={`https://www.google.com/maps?q=${location.lat},${location.lng}&output=embed`}
//                 className="w-full h-[380px]"
//                 style={{ border: 0 }}
//                 loading="lazy"
//                 referrerPolicy="no-referrer-when-downgrade"
//                 title="Location Map"
//               />
//             </div>

//             <div
//               className={[
//                 "rounded-xl border p-6",
//                 darkMode
//                   ? "bg-gray-800 border-gray-700"
//                   : "bg-gradient-to-br from-orange-50 to-red-50 border-gray-200",
//               ].join(" ")}
//             >
//               <h3
//                 className={[
//                   "text-lg font-semibold mb-4 flex items-center gap-2",
//                   darkMode ? "text-white" : "text-gray-900",
//                 ].join(" ")}
//               >
//                 <Navigation className="w-5 h-5 text-orange-600" />
//                 {language === "en" ? "Location Details" : language === "hi" ? "स्थान विवरण" : "स्थान तपशील"}
//               </h3>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <p className={["text-xs mb-1", darkMode ? "text-gray-400" : "text-gray-600"].join(" ")}>
//                     {language === "en" ? "Latitude" : language === "hi" ? "अक्षांश" : "अक्षांश"}
//                   </p>
//                   <p className={["text-sm font-medium", darkMode ? "text-white" : "text-gray-900"].join(" ")}>
//                     {location.lat.toFixed(6)}°
//                   </p>
//                 </div>

//                 <div>
//                   <p className={["text-xs mb-1", darkMode ? "text-gray-400" : "text-gray-600"].join(" ")}>
//                     {language === "en" ? "Longitude" : language === "hi" ? "देशांतर" : "रेखांश"}
//                   </p>
//                   <p className={["text-sm font-medium", darkMode ? "text-white" : "text-gray-900"].join(" ")}>
//                     {location.lng.toFixed(6)}°
//                   </p>
//                 </div>
//               </div>

//               <div className={["mt-4 p-3 rounded-lg", darkMode ? "bg-gray-700" : "bg-white"].join(" ")}>
//                 <p className={["text-xs mb-1", darkMode ? "text-gray-400" : "text-gray-600"].join(" ")}>
//                   {language === "en" ? "Coordinates" : language === "hi" ? "निर्देशांक" : "निर्देशांक"}
//                 </p>

//                 <div className="flex items-center justify-between gap-2">
//                   <p className={["text-sm font-mono", darkMode ? "text-white" : "text-gray-900"].join(" ")}>
//                     {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
//                   </p>

//                   <Button size="sm" variant="ghost" onClick={copyCoordinates}>
//                     {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
//                   </Button>
//                 </div>
//               </div>

//               <div className="flex gap-2 mt-4">
//                 <button
//                   type="button"
//                   onClick={openInGoogleMaps}
//                   className="flex-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 flex items-center justify-center"
//                 >
//                   <ExternalLink className="w-4 h-4 mr-2" />
//                   {language === "en"
//                     ? "Open in Google Maps"
//                     : language === "hi"
//                     ? "Google Maps में खोलें"
//                     : "Google Maps मध्ये उघडा"}
//                 </button>
//               </div>
//             </div>

//             <div
//               className={[
//                 "rounded-xl border p-6",
//                 darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
//               ].join(" ")}
//             >
//               <h3 className={["text-lg font-semibold mb-4", darkMode ? "text-white" : "text-gray-900"].join(" ")}>
//                 {language === "en" ? "Registered Address" : language === "hi" ? "पंजीकृत पता" : "नोंदणीकृत पत्ता"}
//               </h3>

//               <div className="flex items-start gap-3">
//                 <div className={["p-2 rounded-lg", darkMode ? "bg-orange-500/20" : "bg-orange-50"].join(" ")}>
//                   <MapPin className={["w-5 h-5", darkMode ? "text-orange-400" : "text-orange-600"].join(" ")} />
//                 </div>

//                 <div>
//                   <p className={["text-sm font-medium mb-1", darkMode ? "text-white" : "text-gray-900"].join(" ")}>
//                     {registeredAddress.line1}
//                   </p>
//                   <p className={["text-sm", darkMode ? "text-gray-400" : "text-gray-600"].join(" ")}>
//                     {registeredAddress.line2}
//                   </p>
//                   <p className={["text-sm mt-1", darkMode ? "text-gray-400" : "text-gray-600"].join(" ")}>
//                     {registeredAddress.country}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div
//               className={[
//                 "rounded-xl border p-4",
//                 darkMode ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-50 border-blue-200",
//               ].join(" ")}
//             >
//               <p className={["text-sm", darkMode ? "text-blue-300" : "text-blue-800"].join(" ")}>
//                 <strong>{language === "en" ? "Note:" : language === "hi" ? "नोट:" : "टीप:"}</strong>{" "}
//                 {language === "en"
//                   ? "Your location is used to provide better services and show nearby civic facilities."
//                   : language === "hi"
//                   ? "आपके स्थान का उपयोग बेहतर सेवाएं और नज़दीकी सुविधाएँ दिखाने के लिए होता है।"
//                   : "तुमचे स्थान चांगल्या सेवा आणि जवळपासच्या सुविधा दाखवण्यासाठी वापरले जाते."}
//               </p>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useMemo, useState } from "react";
import { X, MapPin, Navigation, Copy, ExternalLink, Check } from "lucide-react";

import type { Language } from "@/types/service.types";
import type { AuthUserData } from "@/types/safe";

import { Button } from "@/components/common/Button";

type LatLng = { lat: number; lng: number };

interface LocationViewProps {
  language: Language;
  darkMode?: boolean;
  authUser?: {
    userType: "user" | "admin";
    userData: AuthUserData;
  } | null;
  onClose: () => void;
}

export function LocationView(props: LocationViewProps) {
  const { language, darkMode = false, onClose } = props;

  const [location, setLocation] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fallback = useMemo<LatLng>(() => ({ lat: 20.7002, lng: 77.0082 }), []); // Akola

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setLocation(fallback);
      setError(
        language === "en"
          ? "Geolocation not supported. Showing default location (Akola, Maharashtra)."
          : language === "hi"
          ? "आपका ब्राउज़र भू-स्थान का समर्थन नहीं करता। डिफ़ॉल्ट स्थान दिखाया जा रहा है (अकोला, महाराष्ट्र)।"
          : "तुमचा ब्राउझर भौगोलिक स्थान समर्थित करत नाही. डीफॉल्ट स्थान दाखवत आहे (अकोला, महाराष्ट्र)."
      );
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setLocation(fallback);

        let msg = "";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            msg =
              language === "en"
                ? "Location access denied. Showing default location (Akola, Maharashtra)."
                : language === "hi"
                ? "स्थान अनुमति अस्वीकृत। डिफ़ॉल्ट स्थान दिखाया जा रहा है (अकोला, महाराष्ट्र)।"
                : "स्थान परवानगी नाकारली. डीफॉल्ट स्थान दाखवत आहे (अकोला, महाराष्ट्र).";
            break;
          case err.POSITION_UNAVAILABLE:
            msg =
              language === "en"
                ? "Location unavailable. Showing default location (Akola, Maharashtra)."
                : language === "hi"
                ? "स्थान जानकारी अनुपलब्ध। डिफ़ॉल्ट स्थान दिखाया जा रहा है (अकोला, महाराष्ट्र)।"
                : "स्थान माहिती अनुपलब्ध. डीफॉल्ट स्थान दाखवत आहे (अकोला, महाराष्ट्र).";
            break;
          case err.TIMEOUT:
            msg =
              language === "en"
                ? "Location request timed out. Showing default location (Akola, Maharashtra)."
                : language === "hi"
                ? "स्थान अनुरोध का समय समाप्त। डिफ़ॉल्ट स्थान दिखाया जा रहा है (अकोला, महाराष्ट्र)।"
                : "स्थान विनंती कालबाह्य. डीफॉल्ट स्थान दाखवत आहे (अकोला, महाराष्ट्र).";
            break;
          default:
            msg =
              language === "en"
                ? "Unable to get location. Showing default location (Akola, Maharashtra)."
                : language === "hi"
                ? "स्थान प्राप्त नहीं हो सका। डिफ़ॉल्ट स्थान दिखाया जा रहा है (अकोला, महाराष्ट्र)।"
                : "स्थान मिळू शकले नाही. डीफॉल्ट स्थान दाखवत आहे (अकोला, महाराष्ट्र).";
        }

        setError(msg);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [language, fallback]);

  const copyCoordinates = async () => {
    if (!location) return;
    try {
      await navigator.clipboard.writeText(`${location.lat}, ${location.lng}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const openInGoogleMaps = () => {
    if (!location) return;
    window.open(`https://www.google.com/maps?q=${location.lat},${location.lng}`, "_blank");
  };

  // Dummy registered address (replace later using props.authUser mapping)
  const registeredAddress = {
    line1:
      language === "en"
        ? "Plot 123, Sector 15"
        : language === "hi"
        ? "प्लॉट 123, सेक्टर 15"
        : "प्लॉट 123, सेक्टर 15",
    line2:
      language === "en"
        ? "Akola, Maharashtra - 444001"
        : language === "hi"
        ? "अकोला, महाराष्ट्र - 444001"
        : "अकोला, महाराष्ट्र - 444001",
    country: language === "en" ? "India" : language === "hi" ? "भारत" : "भारत",
  };

  return (
    <div
      className={[
        "w-full max-w-4xl max-h-[85vh] rounded-xl shadow-2xl overflow-hidden",
        darkMode ? "bg-gray-900" : "bg-white",
      ].join(" ")}
    >
      {/* Header */}
      <div
        className={[
          "p-6 border-b",
          darkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-gradient-to-r from-orange-100 via-red-100 to-pink-100 border-gray-200",
        ].join(" ")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={[
                "p-3 rounded-lg",
                darkMode ? "bg-orange-500/20" : "bg-white/60 backdrop-blur-sm",
              ].join(" ")}
            >
              <MapPin className={["w-8 h-8", darkMode ? "text-orange-400" : "text-orange-600"].join(" ")} />
            </div>

            <div>
              <h2 className={["text-2xl font-bold", darkMode ? "text-white" : "text-gray-900"].join(" ")}>
                {language === "en" ? "My Location" : language === "hi" ? "मेरा स्थान" : "माझे स्थान"}
              </h2>

              <p className={["text-sm mt-1", darkMode ? "text-gray-300" : "text-gray-700"].join(" ")}>
                {language === "en"
                  ? "Live location tracking"
                  : language === "hi"
                  ? "लाइव स्थान ट्रैकिंग"
                  : "थेट स्थान ट्रॅकिंग"}
              </p>
            </div>
          </div>

          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className={[
              "rounded-full",
              darkMode ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-white/60",
            ].join(" ")}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {error && (
          <div
            className={[
              "rounded-lg p-4",
              darkMode ? "bg-amber-500/20 border border-amber-500/30" : "bg-amber-50 border border-amber-200",
            ].join(" ")}
          >
            <p className={["text-sm", darkMode ? "text-amber-300" : "text-amber-800"].join(" ")}>{error}</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-t-orange-500 border-r-orange-500 border-b-transparent border-l-transparent rounded-full animate-spin" />
            <p className={["mt-4", darkMode ? "text-gray-400" : "text-gray-600"].join(" ")}>
              {language === "en"
                ? "Getting your location..."
                : language === "hi"
                ? "आपका स्थान प्राप्त कर रहे हैं..."
                : "तुमचे स्थान मिळवत आहे..."}
            </p>
          </div>
        )}

        {!loading && location && (
          <>
            <div className="rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
              <iframe
                src={`https://www.google.com/maps?q=${location.lat},${location.lng}&output=embed`}
                className="w-full h-[380px]"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
              />
            </div>

            <div
              className={[
                "rounded-xl border p-6",
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gradient-to-br from-orange-50 to-red-50 border-gray-200",
              ].join(" ")}
            >
              <h3
                className={[
                  "text-lg font-semibold mb-4 flex items-center gap-2",
                  darkMode ? "text-white" : "text-gray-900",
                ].join(" ")}
              >
                <Navigation className="w-5 h-5 text-orange-600" />
                {language === "en" ? "Location Details" : language === "hi" ? "स्थान विवरण" : "स्थान तपशील"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className={["text-xs mb-1", darkMode ? "text-gray-400" : "text-gray-600"].join(" ")}>
                    {language === "en" ? "Latitude" : language === "hi" ? "अक्षांश" : "अक्षांश"}
                  </p>
                  <p className={["text-sm font-medium", darkMode ? "text-white" : "text-gray-900"].join(" ")}>
                    {location.lat.toFixed(6)}°
                  </p>
                </div>

                <div>
                  <p className={["text-xs mb-1", darkMode ? "text-gray-400" : "text-gray-600"].join(" ")}>
                    {language === "en" ? "Longitude" : language === "hi" ? "देशांतर" : "रेखांश"}
                  </p>
                  <p className={["text-sm font-medium", darkMode ? "text-white" : "text-gray-900"].join(" ")}>
                    {location.lng.toFixed(6)}°
                  </p>
                </div>
              </div>

              <div className={["mt-4 p-3 rounded-lg", darkMode ? "bg-gray-700" : "bg-white"].join(" ")}>
                <p className={["text-xs mb-1", darkMode ? "text-gray-400" : "text-gray-600"].join(" ")}>
                  {language === "en" ? "Coordinates" : language === "hi" ? "निर्देशांक" : "निर्देशांक"}
                </p>

                <div className="flex items-center justify-between gap-2">
                  <p className={["text-sm font-mono", darkMode ? "text-white" : "text-gray-900"].join(" ")}>
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>

                  <Button size="sm" variant="ghost" onClick={copyCoordinates}>
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={openInGoogleMaps}
                  className="flex-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 flex items-center justify-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {language === "en"
                    ? "Open in Google Maps"
                    : language === "hi"
                    ? "Google Maps में खोलें"
                    : "Google Maps मध्ये उघडा"}
                </button>
              </div>
            </div>

            <div
              className={[
                "rounded-xl border p-6",
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
              ].join(" ")}
            >
              <h3 className={["text-lg font-semibold mb-4", darkMode ? "text-white" : "text-gray-900"].join(" ")}>
                {language === "en" ? "Registered Address" : language === "hi" ? "पंजीकृत पता" : "नोंदणीकृत पत्ता"}
              </h3>

              <div className="flex items-start gap-3">
                <div className={["p-2 rounded-lg", darkMode ? "bg-orange-500/20" : "bg-orange-50"].join(" ")}>
                  <MapPin className={["w-5 h-5", darkMode ? "text-orange-400" : "text-orange-600"].join(" ")} />
                </div>

                <div>
                  <p className={["text-sm font-medium mb-1", darkMode ? "text-white" : "text-gray-900"].join(" ")}>
                    {registeredAddress.line1}
                  </p>
                  <p className={["text-sm", darkMode ? "text-gray-400" : "text-gray-600"].join(" ")}>
                    {registeredAddress.line2}
                  </p>
                  <p className={["text-sm mt-1", darkMode ? "text-gray-400" : "text-gray-600"].join(" ")}>
                    {registeredAddress.country}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={[
                "rounded-xl border p-4",
                darkMode ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-50 border-blue-200",
              ].join(" ")}
            >
              <p className={["text-sm", darkMode ? "text-blue-300" : "text-blue-800"].join(" ")}>
                <strong>{language === "en" ? "Note:" : language === "hi" ? "नोट:" : "टीप:"}</strong>{" "}
                {language === "en"
                  ? "Your location is used to provide better services and show nearby civic facilities."
                  : language === "hi"
                  ? "आपके स्थान का उपयोग बेहतर सेवाएं और नज़दीकी सुविधाएँ दिखाने के लिए होता है।"
                  : "तुमचे स्थान चांगल्या सेवा आणि जवळपासच्या सुविधा दाखवण्यासाठी वापरले जाते."}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
