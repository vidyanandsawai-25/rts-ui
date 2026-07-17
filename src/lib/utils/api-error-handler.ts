export function cleanErrorMessage(message: string | undefined, defaultMessage: string): string {
  let errMsg = message || defaultMessage;
  const payloadIdx = errMsg.indexOf("| Payload:");
  if (payloadIdx > -1) errMsg = errMsg.substring(0, payloadIdx).trim();
  
  const parts = errMsg.split(": ");
  if (parts.length === 2 && parts[0] === parts[1]) {
    errMsg = parts[0];
  } else if (parts.length > 2 && parts.length % 2 === 0) {
    const half = parts.length / 2;
    if (parts.slice(0, half).join(": ") === parts.slice(half).join(": ")) {
      errMsg = parts.slice(0, half).join(": ");
    }
  }
  // Simplify backend reference constraint errors for all masters
  const refMatch = errMsg.match(/Cannot deactivate\/delete this (.*?) because it is referenced in:(.*)/i);
  if (refMatch) {
    errMsg = `Cannot deactivate/delete because it is referenced in:${refMatch[2]}`;
  }

  return errMsg;
}
