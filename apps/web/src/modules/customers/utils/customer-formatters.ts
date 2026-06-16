export function normalizeDigits(value: string | undefined | null): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/\D/g, "");
}

export function normalizePhoneValue(value: string): string {
  return normalizeDigits(value).slice(0, 10);
}

export function normalizeCedulaValue(value: string): string {
  return normalizeDigits(value).slice(0, 11);
}

export function formatPhoneMask(value: string | undefined | null): string {
  const digits = normalizePhoneValue(value ?? "");

  if (digits.length === 0) {
    return "";
  }

  if (digits.length <= 3) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function formatCedulaMask(value: string | undefined | null): string {
  const digits = normalizeCedulaValue(value ?? "");

  if (digits.length === 0) {
    return "";
  }

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`;
}
