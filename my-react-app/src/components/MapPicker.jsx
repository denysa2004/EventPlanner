import { useState, useCallback, useRef, useEffect } from "react";
import {
    GoogleMap,
    useLoadScript,
    Marker,
    Autocomplete
} from "@react-google-maps/api";
import {
    GOOGLE_MAPS_API_KEY,
    libraries,
    defaultCenter,
    mapContainerStyle
} from "../googleMaps";

function MapPicker({ value, onChange, disabled = false }) {
    const [marker, setMarker] = useState(
        value?.latitude && value?.longitude
            ? { lat: value.latitude, lng: value.longitude }
            : null
    );
    const [address, setAddress] = useState(value?.address || "");
    const autocompleteRef = useRef(null);
    const mapRef = useRef(null);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries
    });

    useEffect(() => {
        if (value?.latitude && value?.longitude) {
            setMarker({ lat: value.latitude, lng: value.longitude });
            setAddress(value.address || "");
        }
    }, [value]);

    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    const onPlaceChanged = useCallback(() => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();

            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const formattedAddress = place.formatted_address || place.name || "";

                const newLocation = {
                    latitude: lat,
                    longitude: lng,
                    address: formattedAddress
                };

                setMarker({ lat, lng });
                setAddress(formattedAddress);

                if (mapRef.current) {
                    mapRef.current.panTo({ lat, lng });
                    mapRef.current.setZoom(15);
                }

                onChange(newLocation);
            }
        }
    }, [onChange]);

    const onMarkerDragEnd = useCallback(
        async (e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            setMarker({ lat, lng });

            // Reverse geocode to get address
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === "OK" && results[0]) {
                    const formattedAddress = results[0].formatted_address;
                    setAddress(formattedAddress);

                    onChange({
                        latitude: lat,
                        longitude: lng,
                        address: formattedAddress
                    });
                } else {
                    onChange({
                        latitude: lat,
                        longitude: lng,
                        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
                    });
                }
            });
        },
        [onChange]
    );

    const onMapClick = useCallback(
        (e) => {
            if (disabled) return;

            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            setMarker({ lat, lng });

            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === "OK" && results[0]) {
                    const formattedAddress = results[0].formatted_address;
                    setAddress(formattedAddress);

                    onChange({
                        latitude: lat,
                        longitude: lng,
                        address: formattedAddress
                    });
                } else {
                    onChange({
                        latitude: lat,
                        longitude: lng,
                        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
                    });
                }
            });
        },
        [disabled, onChange]
    );

    if (loadError) {
        return <div className="map-error">Error loading maps</div>;
    }

    if (!isLoaded) {
        return <div className="map-loading">Loading maps...</div>;
    }

    return (
        <div className="map-picker">
            <Autocomplete
                onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                onPlaceChanged={onPlaceChanged}
            >
                <input
                    type="text"
                    placeholder="Search for a location..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={disabled}
                    className="location-search-input"
                />
            </Autocomplete>

            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={marker || defaultCenter}
                zoom={marker ? 15 : 10}
                onLoad={onMapLoad}
                onClick={onMapClick}
                options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false
                }}
            >
                {marker && (
                    <Marker
                        position={marker}
                        draggable={!disabled}
                        onDragEnd={onMarkerDragEnd}
                    />
                )}
            </GoogleMap>

            {marker && (
                <p className="selected-location">
                    Selected: {address || `${marker.lat.toFixed(6)}, ${marker.lng.toFixed(6)}`}
                </p>
            )}
        </div>
    );
}

export default MapPicker;
