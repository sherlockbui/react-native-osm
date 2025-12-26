import React, { useEffect, useState, useRef, Children } from 'react';
import { Platform, ActivityIndicator, Alert, View } from 'react-native';
import MapView, {
    PROVIDER_GOOGLE,
    PROVIDER_DEFAULT,
    Marker,
    Callout,
} from 'react-native-maps';
import { LeafletView } from 'react-native-leaflet-view';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Platform-specific MapView component
 * - Android: Uses react-native-leaflet-view (Leaflet/OSM)
 * - iOS: Uses react-native-maps (Apple Maps)
 */
const PlatformMapView = ({
    // Common props
    style,
    region,
    markers = [],
    onRegionChange,
    onRegionChangeComplete,
    showsUserLocation = false,
    followsUserLocation = false,
    zoomEnabled = true,
    zoomControlEnabled = true,
    // iOS-specific props (react-native-maps)
    provider,
    // Android-specific props (leaflet)
    mapCenterPosition,
    zoom,
    // Callbacks
    onMarkerPress,
    // Ref
    mapRef,
    children,
    ...otherProps
}) => {
    // All hooks must be declared at the top, before any early returns
    const [webViewContent, setWebViewContent] = useState(null);
    const [loading, setLoading] = useState(Platform.OS === 'android');
    const originalMarkersRef = useRef({});

    // Load HTML for Android Leaflet
    useEffect(() => {
        if (Platform.OS === 'android') {
            const loadHtml = async () => {
                try {
                    console.log('[PlatformMapView] Loading HTML file...');

                    // Method 1: Try loading from assets folder
                    let htmlPath;
                    try {
                        htmlPath = require('../assets/leaflet.html');
                        console.log(
                            '[PlatformMapView] HTML path resolved from assets:',
                            htmlPath,
                        );
                    } catch (requireError) {
                        console.warn(
                            '[PlatformMapView] Could not require from assets, trying node_modules:',
                            requireError,
                        );
                        // Method 2: Try loading from node_modules
                        try {
                            htmlPath = require('react-native-leaflet-view/android/src/main/assets/leaflet.html');
                            console.log(
                                '[PlatformMapView] HTML path resolved from node_modules:',
                                htmlPath,
                            );
                        } catch (nodeModulesError) {
                            throw new Error(
                                'Could not find HTML file in assets or node_modules',
                            );
                        }
                    }

                    const asset = Asset.fromModule(htmlPath);
                    console.log('[PlatformMapView] Asset created:', {
                        uri: asset.uri,
                        name: asset.name,
                    });

                    await asset.downloadAsync();
                    console.log('[PlatformMapView] Asset downloaded:', {
                        localUri: asset.localUri,
                        uri: asset.uri,
                        downloaded: asset.downloaded,
                    });

                    // Get the local URI - prefer localUri for downloaded assets
                    const uri = asset.localUri || asset.uri;
                    if (!uri) {
                        throw new Error('Asset URI is not available after download');
                    }

                    console.log('[PlatformMapView] Reading HTML from URI:', uri);
                    // Read the HTML content
                    const htmlContent = await FileSystem.readAsStringAsync(uri);
                    console.log(
                        '[PlatformMapView] HTML content loaded, length:',
                        htmlContent?.length,
                    );

                    if (!htmlContent || htmlContent.length === 0) {
                        throw new Error('HTML content is empty after reading');
                    }

                    setWebViewContent(htmlContent);
                    setLoading(false);
                    console.log('[PlatformMapView] HTML loaded successfully!');
                } catch (error) {
                    console.error('[PlatformMapView] Error loading HTML:', error);
                    // Safely stringify error without circular references
                    const errorInfo = {
                        message: error?.message || 'Unknown error',
                        name: error?.name || 'Error',
                        stack: error?.stack || 'No stack trace',
                    };
                    console.error('[PlatformMapView] Error details:', errorInfo);

                    // Show more detailed error
                    const errorMessage = error?.message || 'Unknown error';
                    Alert.alert(
                        'Error loading HTML',
                        `Unable to load map HTML file.\n\nError: ${errorMessage}\n\nPlease check console for more details.`,
                        [{ text: 'OK' }],
                    );
                    setLoading(false);
                }
            };
            loadHtml();
        }
    }, []);

    // Extract markers from children (Marker components)
    const extractMarkersFromChildren = childrenArray => {
        const extractedMarkers = [];
        React.Children.forEach(childrenArray, (child, index) => {
            if (child && child.type === Marker) {
                const marker = {
                    coordinate: child.props.coordinate,
                    title: child.props.title,
                    description: child.props.description,
                    onPress: child.props.onPress,
                    children: child.props.children,
                    callout:
                        child.props.children?.props?.type === Callout
                            ? {
                                tooltip: child.props.children.props.tooltip,
                                children: child.props.children.props.children,
                                onPress: child.props.children.props.onPress,
                            }
                            : null,
                };
                extractedMarkers.push(marker);
            }
        });
        return extractedMarkers;
    };

    // Combine markers from props and children
    const allMarkers =
        markers.length > 0
            ? markers
            : extractMarkersFromChildren(Children.toArray(children));

    // iOS: Use react-native-maps
    if (Platform.OS === 'ios') {
        return (
            <MapView
                ref={mapRef}
                style={style}
                provider={provider || PROVIDER_DEFAULT}
                region={region}
                showsUserLocation={showsUserLocation}
                followsUserLocation={followsUserLocation}
                zoomEnabled={zoomEnabled}
                zoomControlEnabled={zoomControlEnabled}
                onRegionChange={onRegionChange}
                onRegionChangeComplete={onRegionChangeComplete}
                {...otherProps}>
                {children}
            </MapView>
        );
    }

    // Android: Use react-native-leaflet-view
    if (loading || !webViewContent) {
        return (
            <View style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    // Convert markers to Leaflet format
    const leafletMarkers = allMarkers
        .filter(marker => {
            const lat = marker.latitude || marker.coordinate?.latitude;
            const lng = marker.longitude || marker.coordinate?.longitude;
            return lat != null && lng != null && lat !== 0 && lng !== 0;
        })
        .map((marker, index) => {
            const lat = marker.latitude || marker.coordinate?.latitude || 0;
            const lng = marker.longitude || marker.coordinate?.longitude || 0;
            const markerId = `marker-${index}`;

            // Store original marker separately (only store necessary data, not the whole object)
            originalMarkersRef.current[markerId] = {
                onPress: marker.onPress,
                callout: marker.callout
                    ? {
                        onPress: marker.callout.onPress,
                    }
                    : null,
                title: marker.title,
                description: marker.description,
            };

            return {
                id: markerId,
                position: { lat, lng },
                icon: '📍', // Default icon, can be customized
                size: [32, 32],
                title: marker.title || '',
            };
        });

    // Convert region to mapCenterPosition
    const centerPosition = mapCenterPosition ||
        (region
            ? {
                lat: region.latitude || 0,
                lng: region.longitude || 0,
            }
            : { lat: 0, lng: 0 });

    // Default zoom for Android: 16 (good for city/street level view)
    // If zoom prop is provided, use it
    // Otherwise, calculate from region.latitudeDelta, or use default 16
    const DEFAULT_ANDROID_ZOOM = 16;
    const leafletZoom =
        zoom !== undefined
            ? zoom
            : region?.latitudeDelta
                ? Math.log2(360 / region.latitudeDelta)
                : DEFAULT_ANDROID_ZOOM;

    return (
        <View style={[style, { overflow: 'hidden', position: 'relative' }]}>
            <LeafletView
                source={webViewContent ? { html: webViewContent } : undefined}
                style={{ flex: 1, backgroundColor: '#f0f0f0' }}
                mapCenterPosition={centerPosition}
                zoom={leafletZoom}
                mapMarkers={leafletMarkers}
                zoomControl={zoomControlEnabled}
                attributionControl={true}
                onMessageReceived={message => {
                    try {
                        // Handle marker click
                        if (message?.event === 'onMapMarkerClicked') {
                            const markerId = message?.payload?.markerId;
                            if (markerId && originalMarkersRef.current[markerId]) {
                                const originalMarker = originalMarkersRef.current[markerId];
                                if (originalMarker.onPress) {
                                    originalMarker.onPress();
                                } else if (originalMarker.callout?.onPress) {
                                    originalMarker.callout.onPress();
                                } else if (onMarkerPress) {
                                    onMarkerPress(originalMarker);
                                }
                            }
                        }
                        // Handle map move
                        if (message?.event === 'onMapMoveEnd' && onRegionChangeComplete) {
                            const { lat, lng } = message?.payload || {};
                            if (lat && lng) {
                                onRegionChangeComplete({
                                    latitude: lat,
                                    longitude: lng,
                                    latitudeDelta: region?.latitudeDelta || 0.07,
                                    longitudeDelta: region?.longitudeDelta || 0.07,
                                });
                            }
                        }
                    } catch (error) {
                        console.error(
                            '[PlatformMapView] Error handling LeafletView message:',
                            error?.message || error,
                        );
                    }
                }}
                {...otherProps}
            />
        </View>
    );
};

export default PlatformMapView;
export { Marker, Callout, PROVIDER_GOOGLE, PROVIDER_DEFAULT };
