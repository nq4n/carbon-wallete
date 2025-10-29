
import { LoadScript, GoogleMap } from "@react-google-maps/api";

const LIBRARIES = ["places", "marker"] as const;

export default function Map() {
  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}
      libraries={LIBRARIES}
    >
      <GoogleMap
        center={{ lat: 23.5880, lng: 58.3829 }}
        zoom={12}
        mapContainerStyle={{ width: "100%", height: "400px" }}
      />
    </LoadScript>
  );
}
