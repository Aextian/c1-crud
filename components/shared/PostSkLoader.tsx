import SkeletonLoading from 'expo-skeleton-loading'
import React from 'react'
import { View } from 'react-native'

const PostSkLoader = () => {
  const arrayLists = Array.from({ length: 3 }) // Adjust the length as needed
  return (
    <>
      {arrayLists.map((_, index) => (
        <SkeletonLoading
          key={index}
          background={'#adadad'}
          highlight={'#ffffff'}
        >
          <View className="flex flex-row justify-start items-start gap-5  p-4 ">
            <View
              style={{
                width: 50,
                height: 50,
                backgroundColor: '#adadad',
                borderRadius: 100,
              }}
            />
            <View className="flex flex-col gap-2">
              <View
                style={{
                  width: 200,
                  height: 20,
                  backgroundColor: '#adadad',
                  borderRadius: 20,
                }}
              />
              <View
                style={{
                  width: 120,
                  height: 20,
                  backgroundColor: '#adadad',
                  borderRadius: 20,
                }}
              />

              <View
                style={{
                  width: 300,
                  height: 200,
                  backgroundColor: '#adadad',
                  borderRadius: 20,
                }}
              />
            </View>
          </View>
        </SkeletonLoading>
      ))}
    </>
  )
}

export default PostSkLoader
