import { LoadScript, GoogleMap } from "@react-google-maps/api";
import type { Libraries } from "@react-google-maps/api";

const LIBRARIES: Libraries = ["places", "marker"]; // ثابت ومطابق للنوع

export default function Map() {
  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}
      libraries={LIBRARIES}
    >
      <GoogleMap mapContainerStyle={{ width: "100%", height: 400 }} />
    </LoadScript>
  );
}
