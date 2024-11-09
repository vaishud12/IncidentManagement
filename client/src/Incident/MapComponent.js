import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: -3.745,
  lng: -38.523
};

function MapComponent({ onSelectLocation }) {
  const mapRef = useRef(null);
  const [marker, setMarker] = useState(null);

  const onClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    if (marker) {
      marker.setMap(null);
    }
    const newMarker = new google.maps.marker.AdvancedMarkerElement({
      position: { lat, lng },
      map: mapRef.current,
    });
    setMarker(newMarker);
    onSelectLocation({ lat, lng });
  }, [marker, onSelectLocation]);

  return (
    <LoadScript
      googleMapsApiKey="AIzaSyCaehMCUiTGu_nk4bCXRKhgjPogiX0CbYU"
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={map => (mapRef.current = map)}
        onClick={onClick}
      />
    </LoadScript>
  );
}

export default React.memo(MapComponent);
