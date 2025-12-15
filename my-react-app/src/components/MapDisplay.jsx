import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";
import { useMemo } from "react";
import {
    GOOGLE_MAPS_API_KEY,
    libraries,
    mapContainerStyle
} from "../googleMaps";

function MapDisplay({ location, isEditable = false }) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries
    });

    const center = useMemo(() => {
        if (!location?.latitude || !location?.longitude) {
            return null;
        }
        const lat = parseFloat(location.latitude);
        const lng = parseFloat(location.longitude);

        if (isNaN(lat) || isNaN(lng)) {
            return null;
        }

        return { lat, lng };
    }, [location?.latitude, location?.longitude]);

    const mapOptions = useMemo(() => ({
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        draggable: isEditable,
        scrollwheel: isEditable,
        gestureHandling: isEditable ? 'greedy' : 'none'
    }), [isEditable]);

    if (!center) {
        return <p className="no-location">No location available</p>;
    }

    if (loadError) {
        return <div className="map-error">Error loading maps</div>;
    }

    if (!isLoaded) {
        return <div className="map-loading">Loading maps...</div>;
    }

    const displayAddress = location?.address || `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`;

    return (
        <div className="map-display">
            <p className="location-address">
                <strong>📍 Address:</strong> {displayAddress}
            </p>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={15}
                options={mapOptions}
            >
                <MarkerF position={center} />
            </GoogleMap>
        </div>
    );
}

export default MapDisplay;
