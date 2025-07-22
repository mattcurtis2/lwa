import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Dog } from "@db/schema";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

// Common US city coordinates lookup
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Denver, CO': { lat: 39.7392, lng: -104.9903 },
  'Grand Rapids, MI': { lat: 42.9634, lng: -85.6681 },
  'Austin, TX': { lat: 30.2672, lng: -97.7431 },
  'Portland, OR': { lat: 45.5152, lng: -122.6784 },
  'Nashville, TN': { lat: 36.1627, lng: -86.7816 },
  'Atlanta, GA': { lat: 33.7490, lng: -84.3880 },
  'Seattle, WA': { lat: 47.6062, lng: -122.3321 },
  'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
  'New York, NY': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles, CA': { lat: 34.0522, lng: -118.2437 },
  'Phoenix, AZ': { lat: 33.4484, lng: -112.0740 },
  'Philadelphia, PA': { lat: 39.9526, lng: -75.1652 },
  'San Antonio, TX': { lat: 29.4241, lng: -98.4936 },
  'San Diego, CA': { lat: 32.7157, lng: -117.1611 },
  'Dallas, TX': { lat: 32.7767, lng: -96.7970 },
  'Houston, TX': { lat: 29.7604, lng: -95.3698 },
};

export default function PuppyPlacementMap({ puppies }: PuppyPlacementMapProps) {
  const [locations, setLocations] = useState<PlacementLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter puppies that have placement locations
  const placedPuppies = puppies.filter(
    puppy => puppy.placementCity && puppy.placementState
  );

  useEffect(() => {
    const processLocations = () => {
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

      // Convert to locations with coordinates
      const processedLocations: PlacementLocation[] = [];
      
      Object.values(locationGroups).forEach((group) => {
        const key = `${group.city}, ${group.state}`;
        const coords = CITY_COORDINATES[key];
        
        if (coords) {
          processedLocations.push({
            city: group.city,
            state: group.state,
            lat: coords.lat,
            lng: coords.lng,
            puppies: group.puppies
          });
        } else {
          // For cities not in our lookup, try to approximate based on state
          console.warn(`No coordinates found for ${key}`);
        }
      });
      
      setLocations(processedLocations);
      setIsLoading(false);
    };

    if (placedPuppies.length > 0) {
      processLocations();
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
      
      <div className="h-96 rounded-lg overflow-hidden border" style={{ minHeight: '384px' }}>
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={4}
          style={{ height: "384px", width: "100%", minHeight: "384px" }}
          className="z-0"
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