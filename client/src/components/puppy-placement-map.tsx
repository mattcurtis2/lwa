import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Dog } from "@db/schema";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers in React Leaflet
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface PuppyPlacementMapProps {
  puppies: Dog[];
}

interface PlacementLocation {
  city: string;
  state: string;
  lat: number;
  lng: number;
  puppies: Dog[];
}

export default function PuppyPlacementMap({ puppies }: PuppyPlacementMapProps) {
  const [locations, setLocations] = useState<PlacementLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter puppies that have placement locations
  const placedPuppies = puppies.filter(
    puppy => puppy.placementCity && puppy.placementState
  );

  useEffect(() => {
    const fetchCoordinates = async () => {
      setIsLoading(true);
      
      // Group puppies by city/state
      const locationGroups = placedPuppies.reduce((acc, puppy) => {
        const key = `${puppy.placementCity}, ${puppy.placementState}`;
        if (!acc[key]) {
          acc[key] = {
            city: puppy.placementCity!,
            state: puppy.placementState!,
            puppies: []
          };
        }
        acc[key].puppies.push(puppy);
        return acc;
      }, {} as Record<string, { city: string; state: string; puppies: Dog[] }>);

      // Fetch coordinates for each unique location
      const locationPromises = Object.values(locationGroups).map(async (group) => {
        try {
          // Use Nominatim (OpenStreetMap) for geocoding - free and no API key required
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              `${group.city}, ${group.state}, USA`
            )}&limit=1`
          );
          const data = await response.json();
          
          if (data.length > 0) {
            return {
              city: group.city,
              state: group.state,
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
              puppies: group.puppies
            };
          }
        } catch (error) {
          console.warn(`Failed to geocode ${group.city}, ${group.state}:`, error);
        }
        return null;
      });

      const resolvedLocations = await Promise.all(locationPromises);
      const validLocations = resolvedLocations.filter((loc): loc is PlacementLocation => loc !== null);
      
      setLocations(validLocations);
      setIsLoading(false);
    };

    if (placedPuppies.length > 0) {
      fetchCoordinates();
    } else {
      setIsLoading(false);
    }
  }, [placedPuppies]);

  if (placedPuppies.length === 0) {
    return (
      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          No placement locations have been recorded yet for puppies from past litters.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-muted-foreground/20 rounded w-48 mx-auto mb-2"></div>
          <div className="h-3 bg-muted-foreground/20 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Calculate map center based on all locations
  const centerLat = locations.length > 0 
    ? locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length 
    : 39.8283; // Center of USA as fallback
  const centerLng = locations.length > 0 
    ? locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length 
    : -98.5795; // Center of USA as fallback

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Puppy Placement Map</h3>
        <p className="text-sm text-muted-foreground">
          {placedPuppies.length} {placedPuppies.length === 1 ? 'puppy' : 'puppies'} in {locations.length} {locations.length === 1 ? 'location' : 'locations'}
        </p>
      </div>
      
      <div className="h-96 rounded-lg overflow-hidden border">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={4}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map((location, index) => (
            <Marker
              key={`${location.city}-${location.state}-${index}`}
              position={[location.lat, location.lng]}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold mb-2">
                    {location.city}, {location.state}
                  </h4>
                  <div className="space-y-1">
                    {location.puppies.map((puppy) => (
                      <div key={puppy.id} className="text-sm">
                        <span className="font-medium">{puppy.name}</span>
                        {puppy.gender && (
                          <span className="text-muted-foreground ml-2">
                            ({puppy.gender})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {location.puppies.length} {location.puppies.length === 1 ? 'puppy' : 'puppies'}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {locations.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Click on markers to see puppy details for each location.
        </div>
      )}
    </div>
  );
}