/* eslint-disable i18next/no-literal-string */
export const money = (v: number) => "₹" + Math.round(v).toLocaleString("en-IN");

export const formatArea = (v: number | string | undefined | null) => {
  if (v === undefined || v === null || v === "") return "0";
  const num = Number(v);
  if (isNaN(num)) return "0";
  return parseFloat(num.toFixed(3)).toLocaleString("en-IN");
};

export const percentText = (v: number) => (v > 0 ? "+" : "") + v.toFixed(2) + "%";

export const getDifferenceColorClass = (v: number) => {
  if (Math.abs(v) < 0.01) return "text-amber-500 font-bold";
  return v > 0 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold";
};

export const getBadgeForPercent = (p: number) => {
  if (Math.abs(p) < 0.01) {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
        Equal
      </span>
    );
  }
  if (p > 0) {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Old is Less (+{p.toFixed(1)}%)
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
      Old is More ({p.toFixed(1)}%)
    </span>
  );
};
