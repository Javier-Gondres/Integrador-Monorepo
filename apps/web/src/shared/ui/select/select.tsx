import { ERP_COLORS as C, PAGE_SIZE_OPTIONS } from "@/constants/theme";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: readonly number[] | readonly string[];
}

export function Select({ options, style, ...props }: SelectProps) {
  return (
    <select
      style={{
        height: "32px",
        padding: "0 8px",
        border: `1px solid ${C.inputBorder}`,
        borderRadius: "6px",
        fontSize: "13px",
        color: C.bodyText,
        backgroundColor: C.cardBg,
        cursor: "pointer",
        outline: "none",
        ...style,
      }}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export function PageSizeSelect(props: Omit<SelectProps, "options">) {
  return <Select options={PAGE_SIZE_OPTIONS} {...props} />;
}
