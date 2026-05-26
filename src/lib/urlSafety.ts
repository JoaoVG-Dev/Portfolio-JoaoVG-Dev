const blockedLocalPathPattern = /^(?:file:\/\/|[a-z]:[\\/]|(?:downloads|.*[\\/]downloads)(?:[\\/]|$))/i;
const imageDataUrlPattern = /^data:image\/(?:png|jpe?g|webp);base64,[a-z0-9+/=\s]+$/i;

const trimValue = (value: string | null | undefined) => value?.trim() ?? '';

export function isBlockedLocalPath(value: string) {
  return blockedLocalPathPattern.test(trimValue(value));
}

export function isSafeExternalUrl(value: string | null | undefined) {
  const trimmedValue = trimValue(value);

  if (!trimmedValue || isBlockedLocalPath(trimmedValue)) {
    return false;
  }

  try {
    const url = new URL(trimmedValue);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isSafePublicPath(value: string | null | undefined) {
  const trimmedValue = trimValue(value);

  return (
    trimmedValue.startsWith('/') &&
    !trimmedValue.startsWith('//') &&
    !trimmedValue.includes('\\') &&
    !isBlockedLocalPath(trimmedValue)
  );
}

export function isSafeImageSrc(value: string | null | undefined) {
  const trimmedValue = trimValue(value);

  return (
    isSafeExternalUrl(trimmedValue) ||
    isSafePublicPath(trimmedValue) ||
    imageDataUrlPattern.test(trimmedValue)
  );
}

export function toSafeExternalUrl(value: string | null | undefined) {
  const trimmedValue = trimValue(value);
  return isSafeExternalUrl(trimmedValue) ? trimmedValue : null;
}

export function toSafePublicPath(value: string | null | undefined) {
  const trimmedValue = trimValue(value);
  return isSafePublicPath(trimmedValue) ? trimmedValue : null;
}

export function toSafeImageSrc(value: string | null | undefined) {
  const trimmedValue = trimValue(value);
  return isSafeImageSrc(trimmedValue) ? trimmedValue : '';
}

export function toSafeMailtoHref(email: string | null | undefined) {
  const trimmedValue = trimValue(email);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
    return null;
  }

  return `mailto:${trimmedValue}`;
}
