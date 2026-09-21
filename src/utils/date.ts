export function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
}
