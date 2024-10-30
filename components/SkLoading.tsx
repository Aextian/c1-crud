// import { LinearGradient } from 'expo-linear-gradient'

import { View } from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

const SkLoading = () => {
  return (
    <SkeletonPlaceholder>
      <View style={{ width: '100%', height: 200 }} />
      <View style={{ width: '100%', height: 20, marginTop: 10 }} />
      <View style={{ width: '100%', height: 20, marginTop: 10 }} />
    </SkeletonPlaceholder>

    // <SkeletonLoading background={'#adadad'} highlight={'#ffffff'}>
    //   <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
    //     <View
    //       style={{
    //         width: 100,
    //         height: 100,
    //         backgroundColor: '#adadad',
    //         borderRadius: 10,
    //       }}
    //     />

    //     <View style={{ flex: 1, marginLeft: 10 }}>
    //       <View
    //         style={{
    //           backgroundColor: '#adadad',
    //           width: '50%',
    //           height: 10,
    //           marginBottom: 3,
    //           borderRadius: 5,
    //         }}
    //       />
    //       <View
    //         style={{
    //           backgroundColor: '#adadad',
    //           width: '20%',
    //           height: 8,
    //           borderRadius: 5,
    //         }}
    //       />
    //       <View
    //         style={{
    //           backgroundColor: '#adadad',
    //           width: '15%',
    //           height: 8,
    //           borderRadius: 5,
    //           marginTop: 3,
    //         }}
    //       />
    //     </View>
    //   </View>
    // </SkeletonLoading>
  )
}

export default SkLoading
