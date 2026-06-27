// // "use client";

// // import * as React from "react";
// // import { AlertTriangle, LogOut } from "lucide-react";

// // import { Dialog, DialogContent } from "@/components/common/dialog";
// // import { Button } from "@/components/common/Button";
// // import type { Language } from "@/types/language.type";

// // type Lang = "en" | "hi" | "mr";
// // const safeLang = (v: unknown): Lang => (v === "hi" || v === "mr" || v === "en" ? (v as Lang) : "en");

// // const TXT: Record<
// //   Lang,
// //   { title: string; desc: string; cancel: string; confirm: string }
// // > = {
// //   en: {
// //     title: "Confirm Logout",
// //     desc: "Are you sure you want to logout? You will need to login again to access your account and services.",
// //     cancel: "Cancel",
// //     confirm: "Yes, Logout",
// //   },
// //   hi: {
// //     title: "लॉगआउट की पुष्टि करें",
// //     desc: "क्या आप वाकई लॉगआउट करना चाहते हैं? अपने खाते और सेवाओं तक पहुँचने के लिए आपको फिर से लॉगिन करना होगा।",
// //     cancel: "रद्द करें",
// //     confirm: "हाँ, लॉगआउट",
// //   },
// //   mr: {
// //     title: "लॉगआउटची पुष्टी करा",
// //     desc: "तुम्हाला खात्री आहे की तुम्ही लॉगआउट करू इच्छिता? तुमच्या खात्यातील सेवा वापरण्यासाठी तुम्हाला पुन्हा लॉगिन करावे लागेल.",
// //     cancel: "रद्द करा",
// //     confirm: "होय, लॉगआउट",
// //   },
// // };

// // export function LogoutConfirmDialog({
// //   open,
// //   onOpenChange,
// //   language = "en",
// //   onConfirm,
// // }: {
// //   open: boolean;
// //   onOpenChange: (open: boolean) => void;
// //   language?: Language;
// //   onConfirm: () => void;
// // }) {
// //   const lang = safeLang(language);
// //   const t = TXT[lang];

// //   const handleConfirm = () => {
// //     onOpenChange(false);
// //     onConfirm();
// //   };

// //   return (
// //     <Dialog open={open} onOpenChange={onOpenChange}>
// //       <DialogContent className="w-[min(820px,94vw)] max-w-none rounded-2xl p-0 overflow-hidden">
// //         <div className="p-6 sm:p-8">
// //           <div className="flex items-start gap-4">
// //             <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
// //               <AlertTriangle className="h-6 w-6 text-red-600" />
// //             </div>

// //             <div className="min-w-0">
// //               <h2 className="text-xl sm:text-2xl font-semibold text-red-600">
// //                 {t.title}
// //               </h2>
// //               <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
// //                 {t.desc}
// //               </p>
// //             </div>
// //           </div>

// //           <div className="mt-8 flex items-center justify-end gap-3">
// //             <Button
// //               variant="outline"
// //               className="h-10 px-5 rounded-lg border-slate-300 bg-white hover:bg-slate-50"
// //               onClick={() => onOpenChange(false)}
// //               type="button"
// //             >
// //               {t.cancel}
// //             </Button>

// //             <Button
// //               className="h-10 px-5 rounded-lg bg-red-600 hover:bg-red-700 text-white gap-2"
// //               onClick={handleConfirm}
// //               type="button"
// //             >
// //               <LogOut className="h-4 w-4" />
// //               {t.confirm}
// //             </Button>
// //           </div>
// //         </div>
// //       </DialogContent>
// //     </Dialog>
// //   );
// // }
// "use client";

// import * as React from "react";
// import { AlertTriangle, LogOut } from "lucide-react";

// import { Dialog, DialogContent } from "@/components/common/dialog";
// import { Button } from "@/components/common/Button";
// import type { Language } from "@/types/language.type";

// type Lang = "en" | "hi" | "mr";
// const safeLang = (v: unknown): Lang =>
//   v === "hi" || v === "mr" || v === "en" ? (v as Lang) : "en";

// const TXT: Record<Lang, { title: string; desc: string; cancel: string; confirm: string }> = {
//   en: {
//     title: "Confirm Logout",
//     desc: "Are you sure you want to logout? You will need to login again to access your account and services.",
//     cancel: "Cancel",
//     confirm: "Yes, Logout",
//   },
//   hi: {
//     title: "लॉगआउट की पुष्टि करें",
//     desc: "क्या आप वाकई लॉगआउट करना चाहते हैं? अपने खाते और सेवाओं तक पहुँचने के लिए आपको फिर से लॉगिन करना होगा।",
//     cancel: "रद्द करें",
//     confirm: "हाँ, लॉगआउट",
//   },
//   mr: {
//     title: "लॉगआउटची पुष्टी करा",
//     desc: "तुम्हाला खात्री आहे की तुम्ही लॉगआउट करू इच्छिता? तुमच्या खात्यातील सेवा वापरण्यासाठी तुम्हाला पुन्हा लॉगिन करावे लागेल.",
//     cancel: "रद्द करा",
//     confirm: "होय, लॉगआउट",
//   },
// };

// export function LogoutConfirmDialog({
//   open,
//   onOpenChange,
//   language = "en",
//   onConfirm,
// }: {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   language?: Language;
//   onConfirm: () => void;
// }) {
//   const lang = safeLang(language);
//   const t = TXT[lang];

//   const handleConfirm = () => {
//     onOpenChange(false);
//     onConfirm();
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="w-[min(820px,94vw)] max-w-none rounded-2xl p-0 overflow-hidden">
//         <div className="p-6 sm:p-8">
//           <div className="flex items-start gap-4">
//             <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
//               <AlertTriangle className="h-6 w-6 text-red-600" />
//             </div>

//             <div className="min-w-0">
//               <h2 className="text-xl sm:text-2xl font-semibold text-red-600">{t.title}</h2>
//               <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">{t.desc}</p>
//             </div>
//           </div>

//           <div className="mt-8 flex items-center justify-end gap-3">
//             <Button
//               variant="outline"
//               className="h-10 px-5 rounded-lg border-slate-300 bg-white hover:bg-slate-50"
//               onClick={() => onOpenChange(false)}
//               type="button"
//             >
//               {t.cancel}
//             </Button>

//             <Button
//               className="h-10 px-5 rounded-lg bg-red-600 hover:bg-red-700 text-white gap-2"
//               onClick={handleConfirm}
//               type="button"
//             >
//               <LogOut className="h-4 w-4" />
//               {t.confirm}
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import { AlertTriangle, LogOut } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/common/dialog";
import { Button } from "@/components/common/Button";
import type { Language } from "@/types/language.type";

type Lang = "en" | "hi" | "mr";
const safeLang = (v: unknown): Lang =>
  v === "hi" || v === "mr" || v === "en" ? (v as Lang) : "en";

const TXT: Record<
  Lang,
  { title: string; desc: string; cancel: string; confirm: string }
> = {
  en: {
    title: "Confirm Logout",
    desc: "Are you sure you want to logout? You will need to login again to access your account and services.",
    cancel: "Cancel",
    confirm: "Yes, Logout",
  },
  hi: {
    title: "लॉगआउट की पुष्टि करें",
    desc: "क्या आप वाकई लॉगआउट करना चाहते हैं? अपने खाते और सेवाओं तक पहुँचने के लिए आपको फिर से लॉगिन करना होगा।",
    cancel: "रद्द करें",
    confirm: "हाँ, लॉगआउट",
  },
  mr: {
    title: "लॉगआउटची पुष्टी करा",
    desc: "तुम्हाला खात्री आहे की तुम्ही लॉगआउट करू इच्छिता? तुमच्या खात्यातील सेवा वापरण्यासाठी तुम्हाला पुन्हा लॉगिन करावे लागेल.",
    cancel: "रद्द करा",
    confirm: "होय, लॉगआउट",
  },
};

// export function LogoutConfirmDialog({
//   open,
//   onOpenChange,
//   language = "en",
//   onConfirm,
// }: {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   language?: Language;
//  onConfirm: () => void | Promise<void>;
// }) {
//   const lang = safeLang(language);
//   const t = TXT[lang];

//  const handleConfirm = async () => {
//   onOpenChange(false);
//   await onConfirm();
// };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="w-[min(820px,94vw)] max-w-none rounded-2xl p-0 overflow-hidden">
//         <div className="p-6 sm:p-8">
//           <div className="flex items-start gap-4">
//             <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
//               <AlertTriangle className="h-6 w-6 text-red-600" />
//             </div>

//             <DialogHeader className="text-left space-y-2">
//               <DialogTitle className="text-xl sm:text-2xl font-semibold text-red-600">
//                 {t.title}
//               </DialogTitle>
//               <DialogDescription className="text-sm sm:text-base text-slate-600 leading-relaxed">
//                 {t.desc}
//               </DialogDescription>
//             </DialogHeader>
//           </div>

//           <div className="mt-8 flex items-center justify-end gap-3">
//             <Button
//               variant="outline"
//               className="h-10 px-5 rounded-lg border-slate-300 bg-white hover:bg-slate-50"
//               onClick={() => onOpenChange(false)}
//               type="button"
//             >
//               {t.cancel}
//             </Button>

//             <Button
//               className="h-10 px-5 rounded-lg bg-red-600 hover:bg-red-700 text-white gap-2"
//               onClick={handleConfirm}
//               type="button"
//             >
//               <LogOut className="h-4 w-4" />
//               {t.confirm}
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  language = "en",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language?: Language;
  onConfirm: () => void | Promise<void>;
}) {
  const lang = safeLang(language);
  const t = TXT[lang];

  const handleConfirm = async () => {
    onOpenChange(false);
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(820px,94vw)] max-w-none rounded-2xl p-0 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>

            <DialogHeader className="text-left space-y-2">
              <DialogTitle className="text-xl sm:text-2xl font-semibold text-red-600">
                {t.title}
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {t.desc}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              className="h-10 px-5 rounded-lg border-slate-300 bg-white hover:bg-slate-50"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              {t.cancel}
            </Button>

            <Button
              className="h-10 px-5 rounded-lg bg-red-600 hover:bg-red-700 text-white gap-2"
              onClick={handleConfirm}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              {t.confirm}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
