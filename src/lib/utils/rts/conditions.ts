import { FieldCondition } from "@/types/rts/form.types";

export function isConditionMet(
  cond: FieldCondition | undefined,
  formData: Record<string, any>
): boolean {
  if (!cond) return true;

  // logical groups
  if ('any' in cond) return cond.any.some((c) => isConditionMet(c, formData));
  if ('all' in cond) return cond.all.every((c) => isConditionMet(c, formData));

  // single field rules
  const v = formData?.[cond.field];

  // ✅ boolean checks
  if ("equalsBool" in cond) return Boolean(v) === cond.equalsBool;
  if ("doesNotEqualBool" in cond) return Boolean(v) !== cond.doesNotEqualBool;

  // ✅ string-based checks (NOW supports checkboxDropdown where v can be string[])
  if ("equals" in cond) {
    if (Array.isArray(v)) return v.map(String).includes(String(cond.equals));
    return String(v ?? "") === String(cond.equals);
  }

  if ("doesNotEqual" in cond) {
    if (Array.isArray(v)) return !v.map(String).includes(String(cond.doesNotEqual));
    return String(v ?? "") !== String(cond.doesNotEqual);
  }

  if ("equalsAny" in cond) {
    const targets = cond.equalsAny.map(String);
    if (Array.isArray(v)) {
      const vv = v.map(String);
      return targets.some((t) => vv.includes(t));
    }
    return targets.includes(String(v ?? ""));
  }

  if ("doesNotEqualAny" in cond) {
    const targets = cond.doesNotEqualAny.map(String);
    if (Array.isArray(v)) {
      const vv = v.map(String);
      return !targets.some((t) => vv.includes(t));
    }
    return !targets.includes(String(v ?? ""));
  }

  // notEmpty (also supports arrays)
  if ("notEmpty" in cond) {
    const empty =
      v === undefined ||
      v === null ||
      (typeof v === "string" && v.trim() === "") ||
      (Array.isArray(v) && v.length === 0);

    return cond.notEmpty ? !empty : empty;
  }

  return true;
}

export function requiredIf(cond: FieldCondition, message: string): any {
  return (value: any, formData: Record<string, any>) => {
    const must = isConditionMet(cond, formData);
    if (!must) return null;

    const empty =
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "");

    return empty ? message : null;
  };
}
