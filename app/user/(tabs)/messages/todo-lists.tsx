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
  done: boolean
}

const TodoLists = () => {
  useHideTabBarOnFocus()

  const [task, setTask] = useState('')
  const [tasks, setTasks] = useState<ITask[]>([])
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState<string>('')

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
      setTasks([
        ...tasks,
        { id: Date.now().toString(), title: task, done: false },
      ])
      setTask('')
    } else {
      Alert.alert('Empty Task', 'Please enter a task before adding!')
    }
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((item) => item.id !== id))
  }

  const toggleDone = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    )
  }

  const startEditing = (taskId: string, title: string) => {
    setEditingTaskId(taskId)
    setEditingTitle(title)
  }

  const saveEdit = () => {
    if (editingTaskId && editingTitle.trim()) {
      setTasks(
        tasks.map((task) =>
          task.id === editingTaskId ? { ...task, title: editingTitle } : task,
        ),
      )
      setEditingTaskId(null)
      setEditingTitle('')
    }
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

      {/* Edit Task Section */}
      {editingTaskId && (
        <View className="flex flex-row gap-2">
          <TextInput
            value={editingTitle}
            onChangeText={setEditingTitle}
            placeholder="Edit task title"
          />
          <TouchableOpacity
            className="bg-blue-400 p-2 rounded"
            onPress={saveEdit}
          >
            <Text className="text-white">Save</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            className={`${item.done && 'line-through bg-red-100 opacity-50 '}flex mt-5 flex-row justify-between rounded-lg p-2`}
          >
            <Text
              style={{
                textDecorationLine: item.done ? 'line-through' : 'none',
              }}
            >
              {item.title}
            </Text>
            <View className="flex flex-row">
              <TouchableOpacity
                className={`bg-${item.done ? 'gray' : 'green'}-400 p-2 rounded mr-2`}
                onPress={() => toggleDone(item.id)}
              >
                <Text className="text-white">{item.done ? 'Undo' : 'MD'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-red-400 p-2 rounded"
                onPress={() => deleteTask(item.id)}
              >
                <Text className="text-white">Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-400 p-2 rounded ml-2"
                onPress={() => startEditing(item.id, item.title)}
              >
                <Text className="text-white">Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

export default TodoLists
