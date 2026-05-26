export const whatsappContactUrl = 'https://wa.me/5521979382423';

export function normalizeWhatsappContactUrl(value: string | null | undefined) {
  const trimmedValue = value?.trim();

  if (!trimmedValue || /whatsapp|wa\.me/i.test(trimmedValue)) {
    return whatsappContactUrl;
  }

  return trimmedValue;
}
