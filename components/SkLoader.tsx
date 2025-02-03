import SkeletonLoading from 'expo-skeleton-loading'
import React from 'react'
import { View } from 'react-native'

const SkUserLoader = () => {
  const arrayLists = Array.from({ length: 10 }) // Adjust the length as needed
  return (
    <>
      {arrayLists.map((_, index) => (
        <SkeletonLoading
          key={index}
          background={'#adadad'}
          highlight={'#ffffff'}
        >
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between',marginTop:10 }}
          >
            <View
              style={{
                width: 50,
                height: 50,
                backgroundColor: '#adadad',
                borderRadius: 100,
              }}
            />

            <View style={{ flex: 1, marginLeft: 10 }}>
              <View
                style={{
                  backgroundColor: '#adadad',
                  width: '80%',
                  height: 15,
                  marginBottom: 3,
                  borderRadius: 5,
                }}
              />
              <View
                style={{
                  backgroundColor: '#adadad',
                  width: '20%',
                  height: 8,
                  borderRadius: 5,
                }}
              />
              <View
                style={{
                  backgroundColor: '#adadad',
                  width: '15%',
                  height: 8,
                  borderRadius: 5,
                  marginTop: 3,
                }}
              />
            </View>
          </View>
        </SkeletonLoading>
      ))}
    </>
  )
}

export default SkUserLoader
