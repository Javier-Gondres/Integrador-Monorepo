import { ERP_COLORS as C } from "@/constants/theme";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  required?: boolean;
}

export function Input({ error, label, required, style, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontSize: "13px", fontWeight: 600, color: C.bodyText }}
        >
          {label} {required && <span style={{ color: C.danger }}>*</span>}
        </label>
      )}
      <input
        id={inputId}
        style={{
          height: "42px",
          padding: "0 14px",
          border: `1px solid ${error ? C.danger : C.inputBorder}`,
          borderRadius: "8px",
          fontSize: "14px",
          color: C.bodyText,
          backgroundColor: C.cardBg,
          outline: "none",
          width: "100%",
          ...style,
        }}
        {...props}
      />
      {error && <span style={{ fontSize: "12px", color: C.danger }}>{error}</span>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export function Textarea({ error, label, style, id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontSize: "13px", fontWeight: 600, color: C.bodyText }}
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        style={{
          height: "90px",
          padding: "10px 14px",
          resize: "none",
          border: `1px solid ${error ? C.danger : C.inputBorder}`,
          borderRadius: "8px",
          fontSize: "14px",
          color: C.bodyText,
          backgroundColor: C.cardBg,
          outline: "none",
          width: "100%",
          ...style,
        }}
        {...props}
      />
      {error && <span style={{ fontSize: "12px", color: C.danger }}>{error}</span>}
    </div>
  );
}

interface SearchInputProps extends Omit<InputProps, "label"> {
  width?: string | number;
}

export function SearchInput({ width = "280px", style, ...props }: SearchInputProps) {
  return (
    <Input
      {...props}
      style={{
        width,
        height: "40px",
        ...style,
      }}
    />
  );
}
