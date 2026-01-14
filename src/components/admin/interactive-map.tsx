'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ['places'];

type InteractiveMapProps = {
    origin: string;
    destination: string;
    waypointsInput: string;
    onWaypointsChanged: (newWaypoints: string) => void;
    ignoreDestinationForRoute?: boolean; // New prop to decouple Form Destination from Map Route
};

export default function InteractiveMap({ origin, destination, waypointsInput, onWaypointsChanged, ignoreDestinationForRoute = false }: InteractiveMapProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
        libraries
    });

    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
    const lastDerivedWaypointsRef = useRef<string>(waypointsInput);

    // Memoize options
    // Memoize options
    const mapOptions = useMemo(() => ({
        streetViewControl: false,
        mapTypeControl: true, // Show Map Type
        fullscreenControl: true, // Show Fullscreen
        zoomControl: true, // Show Zoom
    }), []);

    const rendererOptions = useMemo(() => ({
        draggable: true,
    }), []);

    // 1. Fetch Route from API (Standard Source of Truth)
    useEffect(() => {
        if (!isLoaded || !origin || !destination) return;

        // SKIP if the waypoints prop matches what we just calculated/dragged ourselves
        // BUT ONLY if we already have a calculated route (directions).
        // If directions is null (initial load), we MUST fetch.
        if (directions && waypointsInput === lastDerivedWaypointsRef.current) {
            return;
        }

        // Debounce API calls to prevent "jumping" and rate limits
        const timeoutId = setTimeout(() => {
            let effectiveDestination = ignoreDestinationForRoute ? '' : destination;
            let effectiveWaypointsStr = waypointsInput;

            if (ignoreDestinationForRoute && waypointsInput && waypointsInput.trim().length > 0) {
                const parts = waypointsInput.split(';').map(p => p.trim()).filter(p => p !== '');
                if (parts.length > 0) {
                    effectiveDestination = parts[parts.length - 1];
                    effectiveWaypointsStr = parts.slice(0, parts.length - 1).join(';');
                }
            }

            if (!effectiveDestination) {
                setDirections(null);
                return;
            }

            const service = new google.maps.DirectionsService();

            let waypointsArr: google.maps.DirectionsWaypoint[] = effectiveWaypointsStr
                ? effectiveWaypointsStr.split(';')
                    .map(p => p.trim())
                    .filter(p => p !== '')
                    .map(p => ({ location: p, stopover: true }))
                : [];

            if (waypointsArr.length > 25) {
                const step = Math.ceil(waypointsArr.length / 25);
                waypointsArr = waypointsArr.filter((_, index) => index % step === 0).slice(0, 25);
            }

            service.route(
                {
                    origin: origin,
                    destination: effectiveDestination,
                    waypoints: waypointsArr,
                    travelMode: google.maps.TravelMode.DRIVING,
                    optimizeWaypoints: false
                },
                (result, status) => {
                    if (status === google.maps.DirectionsStatus.OK && result) {
                        setDirections(result);

                        if (result.routes && result.routes[0] && result.routes[0].legs) {
                            const route = result.routes[0];
                            const legs = route.legs;
                            const newPoints: string[] = [];

                            legs.forEach((leg, index) => {
                                if (leg.via_waypoints && leg.via_waypoints.length > 0) {
                                    leg.via_waypoints.forEach((via: any) => {
                                        const lat = typeof via.lat === 'function' ? via.lat() : via.lat;
                                        const lng = typeof via.lng === 'function' ? via.lng() : via.lng;
                                        if (lat && lng) newPoints.push(`${Number(lat).toFixed(5)},${Number(lng).toFixed(5)}`);
                                    });
                                }
                                const point = leg.end_location;
                                newPoints.push(`${point.lat().toFixed(5)},${point.lng().toFixed(5)}`);
                            });

                            const newString = newPoints.join(';');
                            // Update Ref so next render doesn't trigger loop
                            lastDerivedWaypointsRef.current = newString;

                            if (newString !== effectiveWaypointsStr) {
                                onWaypointsChanged(newString);
                            }
                        }
                    } else {
                        console.error(`Google Maps Directions Error: ${status}`);
                    }
                }
            );
        }, 800);

        return () => clearTimeout(timeoutId);

    }, [isLoaded, origin, destination, waypointsInput, ignoreDestinationForRoute, onWaypointsChanged]);

    // 2. Handle User Drag Interaction
    const onDirectionsChanged = useCallback(() => {
        if (!rendererRef.current) return;

        const result = rendererRef.current.getDirections();
        if (!result || !result.routes?.[0]) return;

        const route = result.routes[0];
        const legs = route.legs;
        const newPoints: string[] = [];

        if (legs) {
            legs.forEach((leg, index) => {
                if (leg.via_waypoints && leg.via_waypoints.length > 0) {
                    leg.via_waypoints.forEach((via: any) => {
                        const lat = typeof via.lat === 'function' ? via.lat() : via.lat;
                        const lng = typeof via.lng === 'function' ? via.lng() : via.lng;
                        if (lat && lng) {
                            newPoints.push(`${Number(lat).toFixed(5)},${Number(lng).toFixed(5)}`);
                        }
                    });
                }
                const point = leg.end_location;
                newPoints.push(`${point.lat().toFixed(5)},${point.lng().toFixed(5)}`);
            });
        }

        const newString = newPoints.join(';');

        // Update Ref to signal that this visual state is intentional and shouldn't trigger a re-fetch
        lastDerivedWaypointsRef.current = newString;

        if (newString !== waypointsInput) {
            onWaypointsChanged(newString);
        }
    }, [waypointsInput, onWaypointsChanged, ignoreDestinationForRoute]);

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
