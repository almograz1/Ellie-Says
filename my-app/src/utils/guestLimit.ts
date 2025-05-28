export function getGuestPlayCount(): number {
  return parseInt(localStorage.getItem('guestPlays') || '0', 10);
}

export function incrementGuestPlayCount(): void {
  const count = getGuestPlayCount();
  localStorage.setItem('guestPlays', (count + 1).toString());
}

export function hasExceededGuestLimit(limit = 3): boolean {
  return getGuestPlayCount() >= limit;
}

export function resetGuestPlayCount(): void {
  localStorage.setItem('guestPlays', '0');
}
