import SkeletonLoading from 'expo-skeleton-loading'
import React from 'react'
import { SafeAreaView, View } from 'react-native'

const ProfileSkLoader = () => {
  const arrayLists = Array.from({ length: 2 }) // Adjust the length as needed
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SkeletonLoading
        background={'#adadad'}
        style={{ width: '100%', height: '100%' }}
        highlight={'#ffffff'}
      >
        <View className="flex flex-col items-center mt-10  relative gap-2">
          <View
            style={{
              width: 350,
              height: 200,
              backgroundColor: '#adadad',
              borderRadius: 20,
            }}
          />
          <View
            style={{
              position: 'absolute',
              alignSelf: 'center',
              bottom: 25,
              //   right: 150,
              width: 100,
              height: 100,
              backgroundColor: '#adadad',
              borderRadius: 100,
            }}
          />
          <View
            style={{
              marginTop: 30,
              width: 100,
              height: 25,
              backgroundColor: '#adadad',
              borderRadius: 20,
            }}
          />
        </View>
      </SkeletonLoading>
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
    </SafeAreaView>
  )
}

export default ProfileSkLoader
