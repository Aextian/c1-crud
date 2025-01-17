import { auth } from '@/config' // Assuming auth is initialized in the config file
import { sendPasswordResetEmail } from 'firebase/auth'
import { Alert } from 'react-native'

const useAuthentication = () => {
  const sendResetEmail = async (email: string) => {
    // const email = auth.currentUser?.email // Get the email of the current logged-in user

    if (!email) {
      console.error('No email found for the current user.')
      return
    }

    Alert.alert(
      'Send Password Reset',
      ' Are you sure you want to send a password reset email to this user?',
      [
        {
          text: 'Cancel',
          style: 'cancel', // Just dismisses the dialog
        },
        {
          text: 'Send',
          style: 'destructive', // Highlights the delete action (iOS-specific)
          onPress: async () => {
            try {
              await sendPasswordResetEmail(auth, email) // Sending password reset email to the user
              Alert.alert(' Email sent successfully.')
              console.log('Course deleted successfully')
            } catch (error: any) {
              // console.error('Error deleting course:', error)
              console.error(
                'Error sending password reset email:',
                error.message,
              )
            }
          },
        },
      ],
    )
  }

  return { sendResetEmail }
}

export default useAuthentication
