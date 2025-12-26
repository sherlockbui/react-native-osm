# react-native-osm

[![npm version](https://badge.fury.io/js/react-native-osm.svg)](https://www.npmjs.com/package/react-native-osm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Cross-platform map component for React Native that automatically uses the best map solution for each platform:

- **iOS**: Apple Maps via `react-native-maps` (native performance, no API key required)
- **Android**: OpenStreetMap (OSM) via `react-native-leaflet-view` (no Google Maps API key required)

## Why use this library?

| Feature | react-native-osm | react-native-maps |
|---------|------------------|-------------------|
| iOS Support | ✅ Apple Maps | ✅ Apple/Google Maps |
| Android Support | ✅ OpenStreetMap | ✅ Google Maps only |
| Google API Key Required | ❌ No | ✅ Yes (Android) |
| Free for Commercial Use | ✅ Yes | ⚠️ Depends on usage |
| Offline Support | ✅ OSM tiles cacheable | ❌ Limited |

## Installation

### Step 1: Install the package

```bash
yarn add react-native-osm
```

### Step 2: Install peer dependencies (required)

```bash
yarn add react-native-maps react-native-leaflet-view react-native-webview expo-asset expo-file-system
```

### One-liner (alternative)

```bash
yarn add react-native-osm react-native-maps react-native-leaflet-view react-native-webview expo-asset expo-file-system
```

> ⚠️ **Important**: Peer dependencies are NOT installed automatically. You must install them manually as shown above.

### Step 3: iOS Setup (if using Expo)

No additional setup required for Expo projects.

### Step 4: Android Setup

For Android, you need to rebuild the native code:

```bash
# For Expo projects
npx expo prebuild --clean

# For bare React Native projects
cd android && ./gradlew clean && cd ..
```

## Quick Start

```jsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import PlatformMapView, { Marker, Callout } from 'react-native-osm';

const App = () => {
  return (
    <View style={styles.container}>
      <PlatformMapView
        style={styles.map}
        region={{
          latitude: 21.0285,
          longitude: 105.8542,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        zoomEnabled={true}
      >
        <Marker
          coordinate={{ latitude: 21.0285, longitude: 105.8542 }}
          title="Hanoi"
          description="Capital of Vietnam"
        />
      </PlatformMapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default App;
```

## API Reference

### PlatformMapView Props

#### Common Props (both platforms)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `style` | `ViewStyle` | - | Style for the map container |
| `region` | `Region` | - | The region to display (see Region type below) |
| `markers` | `MarkerProps[]` | `[]` | Array of markers (alternative to using Marker children) |
| `onRegionChange` | `(region: Region) => void` | - | Called continuously while the region is changing |
| `onRegionChangeComplete` | `(region: Region) => void` | - | Called when the region change is complete |
| `showsUserLocation` | `boolean` | `false` | Show the user's current location on the map |
| `followsUserLocation` | `boolean` | `false` | Camera follows user's location |
| `zoomEnabled` | `boolean` | `true` | Enable zoom gestures |
| `zoomControlEnabled` | `boolean` | `true` | Show zoom controls (Android only) |
| `onMarkerPress` | `(marker: MarkerProps) => void` | - | Called when a marker is pressed |

#### iOS-specific Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `provider` | `'google' \| 'default'` | `'default'` | Map provider. Use `PROVIDER_DEFAULT` for Apple Maps |

#### Android-specific Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mapCenterPosition` | `{ lat: number, lng: number }` | - | Alternative way to set center position for Leaflet |
| `zoom` | `number` | `16` | Zoom level (1-18). Higher = more zoomed in |

### Region Type

```typescript
interface Region {
  latitude: number;      // Center latitude
  longitude: number;     // Center longitude
  latitudeDelta: number; // Latitude span (smaller = more zoomed)
  longitudeDelta: number; // Longitude span (smaller = more zoomed)
}
```

### Marker Component

```jsx
<Marker
  coordinate={{ latitude: 21.0285, longitude: 105.8542 }}
  title="Location Title"
  description="Location description"
  onPress={() => console.log('Marker pressed')}
>
  {/* Optional: Custom marker view */}
  <View style={styles.customMarker}>
    <Text>📍</Text>
  </View>
</Marker>
```

#### Marker Props

| Prop | Type | Description |
|------|------|-------------|
| `coordinate` | `{ latitude: number, longitude: number }` | **Required.** Marker position |
| `title` | `string` | Title shown in callout |
| `description` | `string` | Description shown in callout |
| `onPress` | `() => void` | Called when marker is pressed |
| `children` | `ReactNode` | Custom marker content |

### Callout Component

```jsx
<Marker coordinate={{ latitude: 21.0285, longitude: 105.8542 }}>
  <Callout tooltip onPress={() => console.log('Callout pressed')}>
    <View style={styles.callout}>
      <Text style={styles.calloutTitle}>Custom Callout</Text>
      <Text>This is a custom callout view</Text>
    </View>
  </Callout>
</Marker>
```

#### Callout Props

| Prop | Type | Description |
|------|------|-------------|
| `tooltip` | `boolean` | If true, renders custom view instead of default bubble |
| `onPress` | `() => void` | Called when callout is pressed |
| `children` | `ReactNode` | Custom callout content |

## Examples

### Multiple Markers

```jsx
const markers = [
  { id: 1, coordinate: { latitude: 21.0285, longitude: 105.8542 }, title: 'Hanoi' },
  { id: 2, coordinate: { latitude: 10.8231, longitude: 106.6297 }, title: 'Ho Chi Minh City' },
  { id: 3, coordinate: { latitude: 16.0544, longitude: 108.0717 }, title: 'Da Nang' },
];

<PlatformMapView style={{ flex: 1 }} region={...}>
  {markers.map((marker) => (
    <Marker
      key={marker.id}
      coordinate={marker.coordinate}
      title={marker.title}
      onPress={() => console.log(`Pressed: ${marker.title}`)}
    />
  ))}
</PlatformMapView>
```

### With Custom Callout

```jsx
<Marker coordinate={{ latitude: 21.0285, longitude: 105.8542 }}>
  <Callout tooltip onPress={() => navigation.navigate('Details')}>
    <View style={styles.calloutContainer}>
      <Text style={styles.calloutTitle}>Ha Noi Store</Text>
      <Text style={styles.calloutText}>123 Main Street</Text>
      <TouchableOpacity style={styles.calloutButton}>
        <Text style={styles.buttonText}>View Details →</Text>
      </TouchableOpacity>
    </View>
  </Callout>
</Marker>
```

### Controlled Region

```jsx
const [region, setRegion] = useState({
  latitude: 21.0285,
  longitude: 105.8542,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
});

<PlatformMapView
  style={{ flex: 1 }}
  region={region}
  onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
/>
```

## Platform Differences

### iOS Behavior
- Uses native Apple Maps (default) or Google Maps
- Full support for all react-native-maps features
- Smooth animations and native performance

### Android Behavior
- Uses OpenStreetMap rendered via Leaflet.js in a WebView
- Markers are rendered as emoji icons (📍) by default
- Custom marker views have limited support
- Map loads HTML content on first render (shows loading indicator)

## Troubleshooting

### Map not showing on Android

1. Make sure you've rebuilt the native code:
   ```bash
   npx expo prebuild --clean
   ```

2. Check that `react-native-webview` is properly installed

3. Verify the HTML file is bundled correctly in the assets

### "Unable to load map HTML file" error on Android

This usually means the leaflet.html asset wasn't bundled. Try:

```bash
# Clear cache and rebuild
npx expo start --clear
```

### Markers not clickable on Android

On Android (Leaflet), marker clicks are handled via WebView messages. Make sure:
- Your `onPress` handler is defined on the Marker
- Or use `onMarkerPress` prop on PlatformMapView

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

## License

MIT © sherlockbui

## Changelog

### 1.0.0
- Initial release
- iOS: Apple Maps support via react-native-maps
- Android: OpenStreetMap support via react-native-leaflet-view
- Marker and Callout components
- TypeScript support
