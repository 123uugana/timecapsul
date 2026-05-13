export function isUnlocked(unlockDate) {
  return new Date(unlockDate).getTime() <= Date.now();
}

export function formatDateTime(value) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getTimeParts(targetDate) {
  const diff = Math.max(new Date(targetDate).getTime() - Date.now(), 0);

  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}
