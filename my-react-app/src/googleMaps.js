export const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY";

export const libraries = ["places"];

export const defaultCenter = {
    lat: 44.4268,
    lng: 26.1025
};

export const mapContainerStyle = {
    width: "100%",
    height: "300px",
    borderRadius: "8px"
};
