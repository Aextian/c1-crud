import { db } from '@/config'
import { addDoc, collection, doc, getDoc } from 'firebase/firestore'

type TNotification = {
  fromUserId: string
  postId: string
  type: string
  liketype?: string
}
async function addNotifications({
  fromUserId,
  postId,
  type,
  liketype,
}: TNotification) {
  // get posts
  const postRef = doc(db, 'posts', postId)
  const postSnapshot = await getDoc(postRef)

  if (postSnapshot.exists()) {
    // Check if the document exists
    const authorid = postSnapshot.data()?.authorId
    if (fromUserId === authorid) return
    // Save notification to Firestore
    await addDoc(collection(db, 'notifications'), {
      fromUserId: fromUserId, // who sent the notification
      toUserId: authorid, // who is being notified
      type: type,
      message: `${type === 'like' ? (liketype === 'like' ? 'liked' : 'disliked') : 'commented'}  your post!`,
      createdAt: new Date(),
      isRead: false,
      postId: postId,
    })

    console.log('Notifications success')
  } else {
    console.error('User not found!')
  }
}

// Example Usage
export default addNotifications
