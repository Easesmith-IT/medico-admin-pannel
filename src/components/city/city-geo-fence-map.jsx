"use client";

import { MapContainer, TileLayer, Polygon, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { useRef } from "react";
import FitBounds from "./fit-bounds";
import MapSetView from "./map-set-view";

const CityGeoFenceMap = ({ latitude, longitude, polygon, onChange,polygonCoords }) => {
  const featureGroupRef = useRef(null);

  return (
    <div className="h-[500px] rounded-md border">
      <MapContainer
        center={[latitude, longitude]}
        zoom={12}
        className="h-full w-full"
      >
        <MapSetView latitude={latitude} longitude={longitude} />
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            draw={{
              polygon: polygon.length === 0, // 🔒 allow only once
              rectangle: false,
              circle: false,
              polyline: false,
              marker: false,
              circlemarker: false,
            }}
            edit={{
              edit: polygon.length > 0, // ✏️ allow edit
              remove: polygon.length > 0, // 🗑️ allow delete
            }}
            onCreated={(e) => {
              const latlngs = e.layer.getLatLngs()[0];
              onChange(latlngs.map((p) => [p.lat, p.lng]));
            }}
            onEdited={(e) => {
              const layer = Object.values(e.layers._layers)[0];
              const latlngs = layer.getLatLngs()[0];
              onChange(latlngs.map((p) => [p.lat, p.lng]));
            }}
            onDeleted={() => onChange([])}
          />

          {polygon.length > 0 && <Polygon positions={polygon} />}
          <FitBounds polygonCoords={polygonCoords} />
        </FeatureGroup>
      </MapContainer>
    </div>
  );
};

export default CityGeoFenceMap;
