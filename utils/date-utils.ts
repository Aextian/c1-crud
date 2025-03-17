import { Timestamp } from 'firebase/firestore'

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long', // e.g., "Monday"
    year: 'numeric', // e.g., "2023"
    month: 'long', // e.g., "December"
    day: 'numeric', // e.g., "12"
  })
}

export const commentFormatDate = (
  dateInput: Timestamp | string | null | undefined,
) => {
  if (!dateInput) return 'No date available'

  let date: Date

  // Handle Firestore Timestamp
  if (dateInput instanceof Timestamp) {
    date = dateInput.toDate()
  } else {
    date = new Date(dateInput)
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'long', // e.g., "Saturday"
    year: 'numeric', // e.g., "2025"
    month: 'long', // e.g., "March"
    day: 'numeric', // e.g., "8"
  })
}
