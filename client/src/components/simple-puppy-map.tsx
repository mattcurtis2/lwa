import { useEffect, useState, useRef, useMemo } from "react";
import { Dog } from "@db/schema";

interface PuppyPlacementMapProps {
  puppies: Dog[];
}

interface PlacementLocation {
  city: string;
  state: string;
  lat: number;
  lng: number;
  puppies: Dog[];
  count: number;
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

export default function SimplePuppyMap({ puppies }: PuppyPlacementMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Filter and memoize placed puppies
  const placedPuppies = useMemo(() => 
    puppies.filter(puppy => puppy.placementCity && puppy.placementState),
    [puppies]
  );

  // Process locations into grouped data
  const locations = useMemo(() => {
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
    return Object.values(locationGroups)
      .map((group) => {
        const key = `${group.city}, ${group.state}`;
        const coords = CITY_COORDINATES[key];
        
        if (coords) {
          return {
            city: group.city,
            state: group.state,
            lat: coords.lat,
            lng: coords.lng,
            puppies: group.puppies,
            count: group.puppies.length
          };
        }
        return null;
      })
      .filter((loc): loc is PlacementLocation => loc !== null);
  }, [placedPuppies]);

  // Initialize map once
  useEffect(() => {
    let mounted = true;
    
    const initializeMap = async () => {
      if (!mapRef.current || locations.length === 0 || mapInstance.current) return;

      try {
        // Dynamically import Leaflet
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');

        if (!mounted) return;

        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Calculate center
        const centerLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
        const centerLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;

        // Create map
        const map = L.map(mapRef.current, {
          preferCanvas: true,
          attributionControl: true
        }).setView([centerLat, centerLng], 4);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add markers
        locations.forEach((location) => {
          const marker = L.marker([location.lat, location.lng]).addTo(map);
          
          const popupContent = `
            <div style="padding: 8px;">
              <h4 style="margin: 0 0 8px 0; font-weight: bold;">${location.city}, ${location.state}</h4>
              <div style="margin-bottom: 8px;">
                ${location.puppies.map(puppy => 
                  `<div style="margin: 2px 0;"><strong>${puppy.name}</strong> ${puppy.gender ? `(${puppy.gender})` : ''}</div>`
                ).join('')}
              </div>
              <p style="margin: 0; font-size: 12px; color: #666;">
                ${location.count} ${location.count === 1 ? 'puppy' : 'puppies'}
              </p>
            </div>
          `;
          
          marker.bindPopup(popupContent);
        });

        mapInstance.current = map;
        setIsMapReady(true);
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    initializeMap();

    return () => {
      mounted = false;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [locations]);

  if (placedPuppies.length === 0) {
    return (
      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          No placement locations have been recorded yet for puppies from past litters.
        </p>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          Placement locations are not available for the coordinate lookup. 
          {placedPuppies.length} {placedPuppies.length === 1 ? 'puppy has' : 'puppies have'} placement cities recorded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Puppy Placement Map</h3>
        <p className="text-sm text-muted-foreground">
          {placedPuppies.length} {placedPuppies.length === 1 ? 'puppy' : 'puppies'} in {locations.length} {locations.length === 1 ? 'location' : 'locations'}
        </p>
      </div>
      
      <div 
        ref={mapRef}
        className="h-96 rounded-lg border bg-muted/20"
        style={{ height: '384px', minHeight: '384px' }}
      />
      
      {isMapReady && (
        <div className="text-xs text-muted-foreground">
          Click on markers to see puppy details for each location.
        </div>
      )}
    </div>
  );
}