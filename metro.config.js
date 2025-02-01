const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const config = getDefaultConfig(__dirname)

config.resolver.assetExts.push('tflite')

// NOTE: Update this to include the paths to all of your component files.

module.exports = withNativeWind(config, { input: './global.css' })
