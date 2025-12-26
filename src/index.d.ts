import { Component, ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

export interface LatLng {
    latitude: number;
    longitude: number;
}

export interface MapCenterPosition {
    lat: number;
    lng: number;
}

export interface MarkerProps {
    coordinate: LatLng;
    title?: string;
    description?: string;
    onPress?: () => void;
    children?: ReactNode;
}

export interface CalloutProps {
    tooltip?: boolean;
    onPress?: () => void;
    children?: ReactNode;
}

export interface PlatformMapViewProps {
    // Common props
    style?: StyleProp<ViewStyle>;
    region?: Region;
    markers?: MarkerProps[];
    onRegionChange?: (region: Region) => void;
    onRegionChangeComplete?: (region: Region) => void;
    showsUserLocation?: boolean;
    followsUserLocation?: boolean;
    zoomEnabled?: boolean;
    zoomControlEnabled?: boolean;

    // iOS-specific props
    provider?: 'google' | 'default';

    // Android-specific props
    mapCenterPosition?: MapCenterPosition;
    zoom?: number;

    // Callbacks
    onMarkerPress?: (marker: MarkerProps) => void;

    // Children
    children?: ReactNode;
}

export declare const PROVIDER_GOOGLE: string;
export declare const PROVIDER_DEFAULT: string;

export declare class Marker extends Component<MarkerProps> { }
export declare class Callout extends Component<CalloutProps> { }

declare const PlatformMapView: React.FC<PlatformMapViewProps>;

export { PlatformMapView };
export default PlatformMapView;
