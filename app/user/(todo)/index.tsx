import { auth } from '@/config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Stack } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  FlatList,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
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

const TodoPage = () => {
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#fff' }}
      className="flex flex-col gap-5 px-5 "
    >
      <ImageBackground
        source={require('../../../assets/images/bgsvg.png')}
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: 0.3,
          },
        ]}
      />
      <Stack.Screen
        options={{
          headerTitle: 'Todo',
          presentation: 'modal',
        }}
      />
      <View className="flex flex-col mt-10 gap-5">
        <TextInput
          placeholder="Enter a task"
          className=" mt-5 rounded-xl text-xl border border-slate-200 bg-slate-50  p-4"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity
          className="bg-blue-400 shadow-[0_4px_10px_rgba(0,0,0,0.8)] shadow-black px-10 py-3 rounded-full flex justify-center items-center gap-5"
          onPress={addTask}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Add Task
          </Text>
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
            className={`${item.done && 'line-through bg-red-100 opacity-50 '} flex mt-5 flex-row justify-between rounded-lg p-2`}
          >
            <Text
              style={{
                textDecorationLine: item.done ? 'line-through' : 'none',
              }}
            >
              {item.title}
            </Text>
            <View className="flex flex-row px-2">
              <TouchableOpacity
                className={`bg-${item.done ? 'green' : 'green'}-400 px-5 py-2  mr-2 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.8)] shadow-black`}
                onPress={() => toggleDone(item.id)}
              >
                <Text className="text-white">{item.done ? 'Undo' : 'MD'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`bg-red-400 px-5 py-2  mr-2 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.8)] shadow-black`}
                onPress={() => deleteTask(item.id)}
              >
                <Text className="text-white">Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`bg-blue-300 px-5 py-2  mr-2 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.8)] shadow-black`}
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

export default TodoPage
