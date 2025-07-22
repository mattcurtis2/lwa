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

        // Create custom green marker icon to match company colors
        const customIcon = L.divIcon({
          html: `
            <div style="
              background-color: hsl(147 26% 33%);
              width: 25px;
              height: 25px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 8px;
                height: 8px;
                background-color: white;
                border-radius: 50%;
                transform: rotate(45deg);
              "></div>
            </div>
          `,
          className: 'custom-marker',
          iconSize: [25, 25],
          iconAnchor: [12, 24],
          popupAnchor: [1, -24]
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

        // Add markers with custom styling
        locations.forEach((location) => {
          const marker = L.marker([location.lat, location.lng], { icon: customIcon }).addTo(map);
          
          const popupContent = `
            <div style="
              padding: 12px;
              font-family: Inter, sans-serif;
              border-radius: 8px;
              background: white;
              border-top: 3px solid hsl(147 26% 33%);
            ">
              <h4 style="
                margin: 0 0 10px 0;
                font-weight: 600;
                color: hsl(147 26% 33%);
                font-size: 14px;
              ">${location.city}, ${location.state}</h4>
              <div style="margin-bottom: 10px;">
                ${location.puppies.map(puppy => 
                  `<div style="
                    margin: 4px 0;
                    padding: 2px 0;
                    color: #374151;
                    font-size: 13px;
                  "><strong style="color: hsl(147 26% 33%);">${puppy.name}</strong> ${puppy.gender ? `<span style="color: #6b7280;">(${puppy.gender})</span>` : ''}</div>`
                ).join('')}
              </div>
              <p style="
                margin: 0;
                font-size: 11px;
                color: #9ca3af;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              ">
                ${location.count} ${location.count === 1 ? 'puppy' : 'puppies'}
              </p>
            </div>
          `;
          
          marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup'
          });
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
      <div 
        className="flex items-center justify-between p-4 rounded-lg"
        style={{ 
          background: 'linear-gradient(135deg, hsl(147 26% 33% / 0.1) 0%, hsl(147 26% 33% / 0.05) 100%)',
          border: '1px solid hsl(147 26% 33% / 0.2)'
        }}
      >
        <h3 className="text-lg font-semibold" style={{ color: 'hsl(147 26% 33%)' }}>
          Puppy Placement Map
        </h3>
        <p className="text-sm text-muted-foreground">
          {placedPuppies.length} {placedPuppies.length === 1 ? 'puppy' : 'puppies'} in {locations.length} {locations.length === 1 ? 'location' : 'locations'}
        </p>
      </div>
      
      <div 
        ref={mapRef}
        className="h-96 rounded-lg bg-muted/20"
        style={{ 
          height: '384px', 
          minHeight: '384px',
          border: '2px solid hsl(147 26% 33%)',
          boxShadow: '0 4px 12px rgba(147, 84, 84, 0.1)'
        }}
      />
      
      {isMapReady && (
        <div className="text-xs text-muted-foreground">
          Click on markers to see puppy details for each location.
        </div>
      )}
    </div>
  );
}