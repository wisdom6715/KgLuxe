// components/CustomMeasurementFields.tsx
"use client";

import { X } from "lucide-react";

export interface Measurement {
  type: string;
  value: string;
}

export const MEASUREMENT_OPTIONS = ["Shoulder", "Burst", "Waist", "Hip"];

interface CustomMeasurementFieldsProps {
  measurements: Measurement[];
  onChange: (measurements: Measurement[]) => void;
  options?: string[];
}

export default function CustomMeasurementFields({
  measurements,
  onChange,
  options = MEASUREMENT_OPTIONS,
}: CustomMeasurementFieldsProps) {
  const availableOptions = options.filter(
    (opt) => !measurements.some((m) => m.type === opt)
  );

  const addMeasurement = (type: string) => {
    if (!type) return;
    onChange([...measurements, { type, value: "" }]);
  };

  const updateValue = (index: number, value: string) => {
    const next = [...measurements];
    next[index] = { ...next[index], value };
    onChange(next);
  };

  const removeMeasurement = (index: number) => {
    onChange(measurements.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2">
      {measurements.map((m, i) => (
        <div key={m.type} className="flex items-center gap-2">
          <span className="w-20 shrink-0 text-xs text-neutral-600">{m.type}</span>
          <input
            type="text"
            inputMode="decimal"
            value={m.value}
            onChange={(e) => updateValue(i, e.target.value)}
            placeholder="0"
            className="flex-1 min-w-0 border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900"
          />
          <span className="text-xs text-neutral-400 shrink-0">inches</span>
          <button
            type="button"
            onClick={() => removeMeasurement(i)}
            aria-label={`Remove ${m.type}`}
            className="text-neutral-400 hover:text-red-500 shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {availableOptions.length > 0 && (
        <select
          value=""
          onChange={(e) => addMeasurement(e.target.value)}
          className="border border-neutral-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-neutral-900 text-neutral-600"
        >
          <option value="" disabled>
            + Add measurement
          </option>
          {availableOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {measurements.length === 0 && (
        <p className="text-xs text-neutral-400">
          Add at least one measurement in inches above.
        </p>
      )}
    </div>
  );
}