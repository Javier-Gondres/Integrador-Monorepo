export function normalizeDigits(value: string | undefined | null): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/\D/g, "");
}

export function normalizePhoneValueRD(value: string): string {
  return normalizeDigits(value).slice(0, 10);
}

export function normalizeRncValueRD(value: string): string {
  return normalizeDigits(value).slice(0, 11);
}

export function formatPhoneMaskRD(value: string | undefined | null): string {
  const digits = normalizePhoneValueRD(value ?? "");

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

export function formatRncMaskRD(value: string | undefined | null): string {
  const digits = normalizeRncValueRD(value ?? "");

  if (digits.length === 0) {
    return "";
  }

  // RNC Jurídico: 9 dígitos -> X-XX-XXXXX-X
  if (digits.length <= 9) {
    if (digits.length <= 1) {
      return digits;
    }
    if (digits.length <= 3) {
      return `${digits.slice(0, 1)}-${digits.slice(1)}`;
    }
    if (digits.length <= 8) {
      return `${digits.slice(0, 1)}-${digits.slice(1, 3)}-${digits.slice(3)}`;
    }
    return `${digits.slice(0, 1)}-${digits.slice(1, 3)}-${digits.slice(3, 8)}-${digits.slice(8)}`;
  }

  // RNC Físico / Cédula: 11 dígitos -> XXX-XXXXXXX-X
  if (digits.length <= 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`;
}
