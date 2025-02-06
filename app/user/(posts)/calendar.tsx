import { auth, db } from '@/config'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import {
  DocumentData,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Agenda } from 'react-native-calendars'

const App = () => {
  useHideTabBarOnFocus()
  const [items, setItems] = useState<DocumentData>({})
  const [isLoading, setLoading] = useState(false)

  const dateToday = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(dateToday)
  const [newEvent, setNewEvent] = useState('')
  const [event, setEvent] = useState<DocumentData>({})
  const currentUser = auth?.currentUser

  // Add new event to Firestore and update the local state
  const handleAddSubmit = async () => {
    if (!currentUser || newEvent.trim() === '') return
    setLoading(true)

    try {
      // Save event data to Firestore
      await addDoc(collection(db, 'events', currentUser.uid, 'userEvents'), {
        date: selectedDate,
        name: newEvent,
        time: 'All Day',
      })

      // Clear the input field after saving the event
      setNewEvent('')
    } catch (error) {
      console.error('Error adding event: ', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSubmit = async () => {
    setLoading(true)
    try {
      const eventsRef = doc(
        db,
        'events',
        String(currentUser?.uid),
        'userEvents',
        event.id,
      )
      const docEvent = await getDoc(eventsRef)
      if (docEvent.exists()) {
        await updateDoc(eventsRef, {
          name: newEvent,
        })
      }
      setLoading(false)
      setEvent({})
      setNewEvent('')
    } catch (error) {
      console.error('Error updating event: ', error)
      setLoading(false)
    }
  }

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const eventsRef = doc(
              db,
              'events',
              String(currentUser?.uid),
              'userEvents',
              id,
            )
            await deleteDoc(eventsRef)
          } catch (error) {
            console.error('Error deleting event:', error)
          }
        },
      },
    ])
  }

  useEffect(() => {
    if (!currentUser) return

    const eventsRef = collection(db, 'events', currentUser.uid, 'userEvents')

    const unsubscribe = onSnapshot(eventsRef, (querySnapshot) => {
      const fetchedItems: {
        [key: string]: { id: string; name: string; time: string }[]
      } = {}

      querySnapshot.forEach((doc) => {
        const event = doc.data()
        const eventDate = event.date

        if (!fetchedItems[eventDate]) {
          fetchedItems[eventDate] = []
        }

        fetchedItems[eventDate].push({
          id: doc.id,
          name: event.name,
          time: event.time,
        })
      })

      setItems(fetchedItems) // ✅ This will now update in real time
    })

    return () => unsubscribe() // Cleanup function
  }, [currentUser])

  return (
    <View style={styles.container}>
      <View className="flex flex-col gap-2 justify-center items-center px-10 m-5 ">
        <View className="flex flex-col gap-2 w-full">
          <Text>{new Date(selectedDate).toDateString()} </Text>
          <TextInput
            //   style={styles.input}
            className="w-full p-2 border border-slate-200 rounded-lg"
            placeholder="Add Task"
            value={newEvent}
            onChangeText={setNewEvent}
          />
        </View>

        <TouchableOpacity
          // className={`${!newEvent ? 'bg-green-300' : 'bg-green-400'} w-full text-center p-3 rounded-lg `}
          className={`${!newEvent ? 'bg-blue-300' : 'bg-blue-400'} shadow-[0_4px_10px_rgba(0,0,0,0.8)] shadow-black px-10 py-3 w-full rounded-lg text-center justify-center items-center `}
          onPress={event.id ? handleUpdateSubmit : handleAddSubmit}
          disabled={isLoading || !newEvent}
        >
          <Text className="text-white text-center">
            {event.id
              ? isLoading
                ? 'Updating'
                : 'Update'
              : isLoading
                ? 'Adding'
                : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>

      <Agenda
        items={items}
        // renderItem={renderItem}
        onRefresh={() => console.log('Refreshed!')}
        onDayPress={(day: any) => setSelectedDate(day.dateString)}
        renderItem={(item: DocumentData) => (
          <View style={styles.item}>
            <View className="flex flex-row justify-between ">
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemTime}>{item.time}</Text>
              </View>
              <View>
                <TouchableOpacity
                  onPress={() => {
                    setEvent(item)
                    setNewEvent(item.name)
                  }}
                >
                  <Text className="text-green-400">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text className="text-red-400">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        renderEmptyData={() => (
          <View style={styles.emptyItem}>
            <Text>No events for this day!</Text>
          </View>
        )}
        theme={{
          selectedDayBackgroundColor: '#7dc9d6',
          todayTextColor: '#7dc9d6',
          agendaKnobColor: '#7dc9d6',
          dotColor: '#7dc9d6',
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  item: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemTime: {
    fontSize: 14,
    color: '#555',
  },
  emptyItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
  },
  addEventContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#50C878',
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
})

export default App
