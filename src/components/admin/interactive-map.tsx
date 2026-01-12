'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ['places'];

type InteractiveMapProps = {
    origin: string;
    destination: string;
    waypointsInput: string;
    onWaypointsChanged: (newWaypoints: string) => void;
};

export default function InteractiveMap({ origin, destination, waypointsInput, onWaypointsChanged }: InteractiveMapProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
        libraries
    });

    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

    // Memoize options
    const mapOptions = useMemo(() => ({
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
    }), []);

    const rendererOptions = useMemo(() => ({
        draggable: true,
    }), []);

    // 1. Fetch Route from API (Standard Source of Truth)
    // This runs whenever the Props (Origin/Dest/Waypoints) change.
    // This ensures the map always reflects the "official" state of the data.
    useEffect(() => {
        if (!isLoaded || !origin || !destination) return;

        const service = new google.maps.DirectionsService();

        // Parse waypoints
        const waypointsArr: google.maps.DirectionsWaypoint[] = waypointsInput
            ? waypointsInput.split(';')
                .map(p => p.trim())
                .filter(p => p !== '')
                .map(p => ({ location: p, stopover: true }))
            : [];

        service.route(
            {
                origin: origin,
                destination: destination,
                waypoints: waypointsArr,
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === google.maps.DirectionsStatus.OK && result) {
                    setDirections(result);
                } else {
                    console.error(`Google Maps Directions Error: ${status}`);
                }
            }
        );
    }, [isLoaded, origin, destination, waypointsInput]);

    // 2. Handle User Drag Interaction
    const onDirectionsChanged = useCallback(() => {
        // Guard: renderer must exist
        if (!rendererRef.current) return;

        const result = rendererRef.current.getDirections();
        if (!result || !result.routes?.[0]) return;

        const route = result.routes[0];
        const legs = route.legs;
        const newPoints: string[] = [];

        if (legs) {
            legs.forEach((leg, index) => {
                const isLastLeg = index === legs.length - 1;

                // 1. Add via_waypoints (dragged points that are not full stopovers yet)
                if (leg.via_waypoints && leg.via_waypoints.length > 0) {
                    leg.via_waypoints.forEach((via: any) => {
                        // via is directly a LatLng object in DirectionsLeg
                        const lat = typeof via.lat === 'function' ? via.lat() : via.lat;
                        const lng = typeof via.lng === 'function' ? via.lng() : via.lng;
                        if (lat && lng) {
                            newPoints.push(`${Number(lat).toFixed(5)},${Number(lng).toFixed(5)}`);
                        }
                    });
                }

                // 2. Add end_location (full stopovers), BUT skip the very last one (Destination)
                if (!isLastLeg) {
                    const point = leg.end_location;
                    newPoints.push(`${point.lat().toFixed(5)},${point.lng().toFixed(5)}`);
                }
            });
        }

        const newString = newPoints.join(';');

        // Bubble up to parent
        if (newString !== waypointsInput) {
            onWaypointsChanged(newString);
        }
    }, [waypointsInput, onWaypointsChanged]);

    if (loadError) return <div className="p-4 bg-red-50 text-red-500 rounded-xl border border-red-200 text-sm">Lỗi tải bản đồ. Vui lòng kiểm tra API Key.</div>;
    if (!isLoaded) return <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 rounded-xl">Đang tải bản đồ...</div>;

    return (
        <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={{ lat: 21.0285, lng: 105.8542 }} // Default Hanoi
            zoom={10}
            options={mapOptions}
        >
            {directions && (
                <DirectionsRenderer
                    directions={directions}
                    options={rendererOptions}
                    onLoad={(renderer) => { rendererRef.current = renderer; }}
                    onDirectionsChanged={onDirectionsChanged}
                />
            )}
        </GoogleMap>
    );
}
