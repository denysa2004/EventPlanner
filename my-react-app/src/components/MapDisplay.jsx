import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import {
    GOOGLE_MAPS_API_KEY,
    libraries,
    mapContainerStyle
} from "../googleMaps";

function MapDisplay({ location }) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries
    });

    if (!location?.latitude || !location?.longitude) {
        return <p className="no-location">No location available</p>;
    }

    if (loadError) {
        return <div className="map-error">Error loading maps</div>;
    }

    if (!isLoaded) {
        return <div className="map-loading">Loading maps...</div>;
    }

    const center = {
        lat: location.latitude,
        lng: location.longitude
    };

    return (
        <div className="map-display">
            <p className="location-address">
                <strong>Location:</strong> {location.address}
            </p>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={15}
                options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    draggable: true,
                    scrollwheel: true
                }}
            >
                <Marker position={center} />
            </GoogleMap>
        </div>
    );
}

export default MapDisplay;
