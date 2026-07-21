// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// Metro's default assetExts covers otf/ttf but not woff2. The web build loads
// the Ember Modern faces as woff2 (browsers' OpenType sanitizer rejects the
// raw OTFs), so the extension has to be bundleable.
if (!config.resolver.assetExts.includes('woff2')) {
  config.resolver.assetExts.push('woff2')
}

module.exports = config
