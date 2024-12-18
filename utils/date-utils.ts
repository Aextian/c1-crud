export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long', // e.g., "Monday"
    year: 'numeric', // e.g., "2023"
    month: 'long', // e.g., "December"
    day: 'numeric', // e.g., "12"
  })
}
