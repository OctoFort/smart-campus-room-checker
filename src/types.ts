export interface Booking {
  start: number;
  end: number;
  label: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
  blockedReason?: string;
  bookings: Booking[];
}

export interface AvailabilityResult {
  decision: "available" | "unavailable";
  reasons: string[];
}
