import { auth, db } from '@/config'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import { DocumentData, addDoc, collection, getDocs } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Agenda } from 'react-native-calendars'

const App = () => {
  const [items, setItems] = useState<DocumentData>({})
  useHideTabBarOnFocus()

  const dateToday = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(dateToday)
  const [newEvent, setNewEvent] = useState('')
  const currentUser = auth?.currentUser

  // Add new event to Firestore and update the local state
  const addEvent = async () => {
    if (!currentUser || newEvent.trim() === '') return

    try {
      // Save event data to Firestore
      const eventRef = await addDoc(
        collection(db, 'events', currentUser?.uid, 'userEvents'),
        {
          date: selectedDate,
          name: newEvent,
          time: 'All Day', // You can include an input for the event time as well
        },
      )

      // Update local state to reflect the new event
      setItems((prevItems) => {
        const updatedItems = { ...prevItems }
        if (updatedItems[selectedDate]) {
          updatedItems[selectedDate].push({ name: newEvent, time: 'All Day' })
        } else {
          updatedItems[selectedDate] = [{ name: newEvent, time: 'All Day' }]
        }
        return updatedItems
      })

      // Clear the input field after saving the event
      setNewEvent('')
    } catch (error) {
      console.error('Error adding event: ', error)
    }
  }

  //   functio to get all events from firebase

  useEffect(() => {
    const fetchEvents = async () => {
      if (!currentUser) return

      try {
        const querySnapshot = await getDocs(
          collection(db, 'events', currentUser?.uid, 'userEvents'),
        )
        const fetchedItems: {
          [key: string]: { name: string; time: string }[]
        } = {}

        querySnapshot.forEach((doc) => {
          const event = doc.data()
          const eventDate = event.date

          if (!fetchedItems[eventDate]) {
            fetchedItems[eventDate] = []
          }

          fetchedItems[eventDate].push({ name: event.name, time: event.time })
        })

        setItems(fetchedItems) // Update the state with the fetched events
      } catch (error) {
        console.error('Error fetching events: ', error)
      }
    }

    fetchEvents() // Call the function to fetch events
  }, [selectedDate, currentUser]) // Re-fetch when selectedDate or currentUser changes

  const renderItem = (item: { name: string; time: string }) => (
    <View style={styles.item}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemTime}>{item.time}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <View className="flex flex-col gap-2 justify-center items-center px-10 m-5 ">
        <View className="flex flex-col gap-2 w-full">
          <Text>{new Date(selectedDate).toDateString()} </Text>
          <TextInput
            //   style={styles.input}
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Add Event and Task"
            value={newEvent}
            onChangeText={setNewEvent}
          />
        </View>

        <TouchableOpacity
          className="bg-green-400 w-full text-center p-3 rounded-lg "
          onPress={addEvent}
        >
          <Text className="text-white text-center">Add</Text>
        </TouchableOpacity>
      </View>

      <Agenda
        items={items}
        renderItem={renderItem}
        selected={selectedDate}
        onRefresh={() => console.log('Refreshed!')}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        renderEmptyData={() => (
          <View style={styles.emptyItem}>
            <Text>No events for this day!</Text>
          </View>
        )}
        theme={{
          selectedDayBackgroundColor: '#50C878',
          todayTextColor: '#FF6347',
          agendaKnobColor: '#50C878',
          dotColor: '#50C878',
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
