const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const config = getDefaultConfig(__dirname)

module.exports = withNativeWind(config, { input: './global.css' })

// const { getDefaultConfig } = require('expo/metro-config')
// const { withNativeWind } = require('nativewind/metro')
// const {
//   resolver: { sourceExts, assetExts },
// } = require('metro-config')

// const config = getDefaultConfig(__dirname)

// module.exports = withNativeWind(config, {
//   input: './global.css',
//   resolver: {
//     assetExts: assetExts.filter((ext) => ext !== 'svg'),
//     sourceExts: [...sourceExts, 'svg'],
//   },
//   transformer: {
//     babelTransformerPath: require.resolve('react-native-svg-transformer'),
//     getTransformOptions: async () => ({
//       transform: {
//         experimentalImportSupport: false,
//         inlineRequires: true,
//       },
//     }),
//   },
// })
