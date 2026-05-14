"use client";

import { useState, useEffect } from "react";
import { getRoomTypeOptionsAction } from "@/lib/api/ptis/floorSubmission/room-master.action";

/**
 * Custom hook to fetch and manage room type master data
 * @returns {Object} { roomTypes, isLoading, error }
 */
export const useRoomTypeMaster = () => {
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRoomTypes = async () => {
      try {
        setIsLoading(true);
        const result = await getRoomTypeOptionsAction();
        
        if (isMounted) {
          if (result.success && result.data) {
            setRoomTypes(result.data);
          } else {
            setError(result.error || "Failed to load room types");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "An unexpected error occurred");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRoomTypes();

    return () => {
      isMounted = false;
    };
  }, []);

  return { roomTypes, isLoading, error };
};
