import { db } from '@/config'
import { addDoc, collection, doc, getDoc } from 'firebase/firestore'

type TNotification = {
  fromUserId: string
  postId: string
  type: string
  liketype?: string
  toUserId?: string
}
async function addNotifications({
  fromUserId,
  postId,
  type,
  liketype,
  toUserId,
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
      toUserId: toUserId ?? authorid, // who will receive the notification
      type: type,
      message: `${
        type === 'like'
          ? liketype === 'like'
            ? 'liked your post!'
            : 'disliked your post!'
          : type === 'comment'
            ? 'commented on your post!'
            : type === 'reply'
              ? 'replied to your comment!'
              : type === 'approved'
                ? 'your post has been approved! ✅ '
                : 'your post has been rejected! ❌'
      }`,

      createdAt: new Date(),
      isRead: false,
      postId: postId ?? 'unknown',
    })

    console.log('Notifications success')
  } else {
    console.error('User not found!')
  }
}

// Example Usage
export default addNotifications
