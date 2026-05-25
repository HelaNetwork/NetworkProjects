export type ConfigField = {
  key: string;
  label: string;
  inputType: "text" | "number" | "textarea" | "select" | "date";
  placeholder: string;
  options?: string[];
};

const TYPE_IMAGE_MAP: Record<string, string> = {
  trading:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCP9WykVHXlBO4UR2yXu_3m-9IlbFZ2gQIcMEdQEFf9kGLNUq3OsUSKEd-VP82nlecVqwhbNq-gonLvflkS3USYdgiPjK3LnO14jyjCtsyoXoWhgddIoMD7l4mDOaljT05Z6K5HXw2-DtHyNQRWIr3YVhYzViY-zmT2_q0hdYaHqqVYeK02HmzB_BbVzpyU-W444Ddm1M8nXvvT5padIoGxZGyKmLtGHJA73rLAHpMHnKxe3z179wvZf3q8lJpEHjZkxmW_IL2iOFY",
  farming:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCsYXxIvzCasfwu0KjYNIBqyp1bFixdCnGRqahsrugyzKTdlpaGYJekeVsoCU80cL0ClsaNm1FUZV7OHNfe7ilj-_l2COB9BDtlqOfu0HEjItghJg8n2BazGMVB6NGd_jKE5p3iIUTBOuXIBCUcdRPsNbvuOncUKAoiw2vvz28Edhtyu7cNaMo24d13vtgrzJqATCd0DPQq1HH72HD6hjJ4vCZ6_nWMAJrgRtul6oDOhyJ9D95rrWRDMpXWM8gJgn5MwzQSljgigWY",
  content:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCdvfCf5x6E9xZ1AIosqHI4a2tE0JdCcz9eA6a0Mg1XVmXbiUf9tvBcRRdtvhuLii5lPeODU7FR5BT6cbAZZOH8IW5iM6UcR9es5YxQdlDcFnKhHDEhkzm25txi8bCgKRgLbhTJdgJ4ptuZK6HaIddvX8vLhaAL8LvsrsMB3dGgrVmUAgyYqRN9SDUWaz-CfvrK2r8-dBCa57ZYpspB8HEKiGrXhWrUoI3-LDWeMc8dOjvKSHsWXCLg8frA1SnBPO4ihdmXdOGczmY",
  scheduling:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCP9WykVHXlBO4UR2yXu_3m-9IlbFZ2gQIcMEdQEFf9kGLNUq3OsUSKEd-VP82nlecVqwhbNq-gonLvflkS3USYdgiPjK3LnO14jyjCtsyoXoWhgddIoMD7l4mDOaljT05Z6K5HXw2-DtHyNQRWIr3YVhYzViY-zmT2_q0hdYaHqqVYeK02HmzB_BbVzpyU-W444Ddm1M8nXvvT5padIoGxZGyKmLtGHJA73rLAHpMHnKxe3z179wvZf3q8lJpEHjZkxmW_IL2iOFY",
  rebalancing:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCsYXxIvzCasfwu0KjYNIBqyp1bFixdCnGRqahsrugyzKTdlpaGYJekeVsoCU80cL0ClsaNm1FUZV7OHNfe7ilj-_l2COB9BDtlqOfu0HEjItghJg8n2BazGMVB6NGd_jKE5p3iIUTBOuXIBCUcdRPsNbvuOncUKAoiw2vvz28Edhtyu7cNaMo24d13vtgrzJqATCd0DPQq1HH72HD6hjJ4vCZ6_nWMAJrgRtul6oDOhyJ9D95rrWRDMpXWM8gJgn5MwzQSljgigWY",
  business:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBnv7KX2CUfHTtVNxA3N1yyGsjzDYkP_tVm03JkSp3rGuTJQF3OvgGDqR9hxevv8RomyvjQ6-OpASMXLDOTmas1e_LExvngr7iYa9-gZKbhMMtfxN2_QEUutB8pNwKVbqGnEG4pdiorgTct8ZPrxVV1m9RqZGcuRbQ1S9Pzs4Vnw9j5CXoVZVBXmQ5nwmxi5VxpPjwhUcoI6Il77MiHdn5XqHSFwI8z4rfxhVaUDWKbf80d-7E65rlm75sk4g5o6hL3I5FpuJ6K6X8"
};

const TYPE_LABEL_MAP: Record<string, string> = {
  trading: "TRADING",
  farming: "FARMING",
  scheduling: "SCHEDULING",
  rebalancing: "REBALANCING",
  content: "CONTENT",
  business: "BUSINESS"
};

const TYPE_DEFAULT_DESCRIPTION_MAP: Record<string, string> = {
  trading: "Monitors price thresholds and simulates trading decisions.",
  farming: "Tracks LP APY and recommends when to compound rewards.",
  scheduling: "Schedules recurring HLUSD transfers on selected cadence.",
  rebalancing: "Monitors allocation drift and recommends portfolio rebalancing actions.",
  content: "Generates contextual response options with tone control.",
  business: "Answers business questions, drafts content, and provides practical guidance."
};

const TYPE_DESCRIPTION_MISMATCH_PATTERNS: Record<string, RegExp[]> = {
  business: [/\bportfolio\b/i, /\brebalanc/i, /allocation\s+drift/i, /drift\s+tolerance/i],
  rebalancing: [/\bbusiness assistant\b/i, /\bdraft\s+email/i, /customer\s+query/i]
};

const FIELD_OPTIONS_MAP: Record<string, string[]> = {
  tone: ["professional", "casual", "aggressive"],
  formality: ["formal", "informal"],
  frequency: ["hourly", "daily", "weekly", "monthly"],
  language: ["English"]
};

const HIDDEN_AGENT_NAME_PATTERNS: RegExp[] = [
  /pet\s*&?\s*baby\s*name\s*genie/i,
  /baby\s*&?\s*pet\s*name\s*(?:genie|suggester)/i,
  /\bname\s*suggest(?:ion|ions|er|ers)?\b/i,
  /\bname\s*genie\b/i
];

function prettifyKey(rawKey: string): string {
  return rawKey
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeType(value: string): string {
  return value.trim().toLowerCase();
}

function toInputType(typeHint: string, key: string): ConfigField["inputType"] {
  const normalized = normalizeType(typeHint);
  const normalizedKey = normalizeType(key);

  if (normalized.includes("number") || normalizedKey.includes("amount") || normalizedKey.includes("price")) {
    return "number";
  }

  if (normalized.includes("date") || normalizedKey.includes("date")) {
    return "date";
  }

  if (normalized.includes("textarea") || normalized.includes("object") || normalized.includes("[]")) {
    return "textarea";
  }

  if (
    normalized.includes("select") ||
    normalizedKey.includes("tone") ||
    normalizedKey.includes("formality") ||
    normalizedKey.includes("frequency") ||
    normalizedKey.includes("language") ||
    normalizedKey.includes("action")
  ) {
    return "select";
  }

  if (normalizedKey.includes("context") || normalizedKey.includes("description")) {
    return "textarea";
  }

  return "text";
}

function buildPlaceholder(key: string, typeHint: string): string {
  const inputType = toInputType(typeHint, key);
  if (inputType === "date") {
    return "YYYY-MM-DD";
  }
  if (inputType === "number") {
    return "Enter a numeric value";
  }
  if (inputType === "textarea") {
    return `Enter ${prettifyKey(key).toLowerCase()}`;
  }
  return `Enter ${prettifyKey(key).toLowerCase()}`;
}

export function getAgentImage(agentType: string): string {
  return TYPE_IMAGE_MAP[normalizeType(agentType)] || TYPE_IMAGE_MAP.trading;
}

export function toAgentTypeLabel(agentType: string): string {
  return TYPE_LABEL_MAP[normalizeType(agentType)] || normalizeType(agentType).toUpperCase();
}

export function normalizeAgentDescription(agentType: string, description: string): string {
  const normalizedType = normalizeType(agentType);
  const trimmed = description.trim();
  const fallback =
    TYPE_DEFAULT_DESCRIPTION_MAP[normalizedType] || "AI agent that executes configured automated tasks.";

  if (!trimmed) {
    return fallback;
  }

  const mismatchPatterns = TYPE_DESCRIPTION_MISMATCH_PATTERNS[normalizedType] || [];
  if (mismatchPatterns.some((pattern) => pattern.test(trimmed))) {
    return fallback;
  }

  return trimmed;
}

export function isHiddenAgentName(name: string): boolean {
  if (!name || !name.trim()) {
    return false;
  }

  return HIDDEN_AGENT_NAME_PATTERNS.some((pattern) => pattern.test(name));
}

export function parseConfigSchema(rawSchema: string): ConfigField[] {
  if (!rawSchema || !rawSchema.trim()) {
    return [
      {
        key: "notes",
        label: "Notes",
        inputType: "textarea",
        placeholder: "Optional activation notes"
      }
    ];
  }

  try {
    const parsed = JSON.parse(rawSchema) as unknown;

    if (Array.isArray(parsed)) {
      const fields = parsed
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }

          const record = item as {
            key?: string;
            field?: string;
            label?: string;
            type?: string;
            placeholder?: string;
            options?: string[];
          };

          const key = (record.key || record.field || "field").trim();
          const typeHint = record.type || "text";
          const inputType = toInputType(typeHint, key);
          const normalizedKey = normalizeType(key);

          return {
            key,
            label: record.label?.trim() || prettifyKey(key),
            inputType,
            placeholder: record.placeholder?.trim() || buildPlaceholder(key, typeHint),
            options:
              inputType === "select"
                ? record.options && record.options.length
                  ? record.options
                  : FIELD_OPTIONS_MAP[normalizedKey] || ["Option 1", "Option 2"]
                : undefined
          } as ConfigField;
        })
        .filter((field): field is ConfigField => field !== null);

      if (fields.length) {
        return fields;
      }
    }

    if (parsed && typeof parsed === "object") {
      const fields = Object.entries(parsed as Record<string, unknown>).map(([key, value]) => {
        const typeHint = typeof value === "string" ? value : "text";
        const inputType = toInputType(typeHint, key);
        const normalizedKey = normalizeType(key);

        return {
          key,
          label: prettifyKey(key),
          inputType,
          placeholder: buildPlaceholder(key, typeHint),
          options: inputType === "select" ? FIELD_OPTIONS_MAP[normalizedKey] || ["Option 1", "Option 2"] : undefined
        } as ConfigField;
      });

      if (fields.length) {
        return fields;
      }
    }
  } catch {
    // Fallback for non-JSON schema strings.
  }

  return [
    {
      key: "config",
      label: "Configuration",
      inputType: "textarea",
      placeholder: "Paste configuration JSON"
    }
  ];
}