"use client";

import { useState } from "react";

const inputClass =
  "w-full rounded-xl border border-cream/15 bg-ink px-5 py-4 text-base text-cream placeholder:text-cream-dim/50 outline-none transition-colors focus:border-emerald-bright pr-14 md:text-sm md:pr-12";

export default function PasswordInput({
  id,
  name,
  label,
  placeholder = "••••••••",
  required = true,
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs uppercase tracking-[0.25em] text-cream-dim"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-lg px-2 text-xs uppercase tracking-wider text-cream-dim transition-colors hover:text-emerald-bright"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
