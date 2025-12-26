# Changelog - react-native-osm

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-26

### Added
- Initial release
- **iOS Support**: Apple Maps via `react-native-maps`
- **Android Support**: OpenStreetMap (OSM) via `react-native-leaflet-view`
- `PlatformMapView` component with automatic platform detection
- `Marker` component support for both platforms
- `Callout` component support for both platforms
- TypeScript type definitions
- Full documentation and examples

### Features
- No Google Maps API key required on Android
- Automatic marker conversion between platforms
- Event handling for both platforms (onRegionChange, onMarkerPress, etc.)
- Loading indicator while Leaflet HTML loads on Android

## [Unreleased]

### Planned
- Custom marker icons support for Android
- Polyline and Polygon support
- Map snapshot/screenshot functionality
- Offline tile support configuration
