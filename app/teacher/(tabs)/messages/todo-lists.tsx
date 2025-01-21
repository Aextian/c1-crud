import { auth } from '@/config'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Stack } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  FlatList,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

interface ITask {
  id: string
  title: string
}
const TodoLists = () => {
  useHideTabBarOnFocus()

  const [task, setTask] = useState('')
  const [tasks, setTasks] = useState<ITask[]>([])

  const currentUser = auth?.currentUser

  // Load tasks from AsyncStorage when the app loads
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem(
          `task_${currentUser?.uid}`,
        )
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks))
        }
      } catch (error) {
        console.error('Error loading tasks:', error)
      }
    }

    loadTasks()
  }, [])

  // Save tasks to AsyncStorage whenever tasks change
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem(
          `task_${currentUser?.uid}`,
          JSON.stringify(tasks),
        )
      } catch (error) {
        console.error('Error saving tasks:', error)
      }
    }

    saveTasks()
  }, [tasks])

  const addTask = () => {
    if (task.trim()) {
      setTasks([...tasks, { id: Date.now().toString(), title: task }])
      setTask('')
    } else {
      Alert.alert('Empty Task', 'Please enter a task before adding!')
    }
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((item) => item.id !== id))
  }

  return (
    <SafeAreaView className="flex flex-col gap-5 px-5 mt-5">
      <Stack.Screen
        options={{
          headerTitle: 'Todo Lists',
          presentation: 'modal',
        }}
      />
      <View className="flex flex-col gap-2">
        <TextInput
          placeholder="Enter a task"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity
          className="bg-green-400 p-2 rounded text-center"
          onPress={addTask}
        >
          <Text className="text-white text-center text-lg">Add Task</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex mt-5 flex-row justify-between">
            <Text>{item.title}</Text>
            <TouchableOpacity
              className="bg-red-400 p-2 rounded"
              onPress={() => deleteTask(item.id)}
            >
              <Text className="text-white">Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

export default TodoLists
