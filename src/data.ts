import type { Room } from "./types";

export const ROOMS: Room[] = [
  {
    id: "a101",
    name: "Room A101",
    building: "Arts Building",
    capacity: 30,
    blocked: false,
    bookings: [
      { start: 600, end: 660, label: "Intro to Linguistics" },
      { start: 840, end: 900, label: "Faculty Meeting" },
    ],
  },
  {
    id: "b202",
    name: "Lab B202",
    building: "Science Block",
    capacity: 24,
    blocked: false,
    bookings: [
      { start: 510, end: 570, label: "Chemistry Lab Session" },
      { start: 780, end: 870, label: "Robotics Workshop" },
    ],
  },
  {
    id: "c305",
    name: "Room C305",
    building: "Humanities Wing",
    capacity: 18,
    blocked: true,
    blockedReason: "Floor maintenance scheduled.",
    bookings: [
      { start: 720, end: 780, label: "Philosophy Seminar" },
    ],
  },
  {
    id: "d110",
    name: "Auditorium D110",
    building: "Main Hall",
    capacity: 120,
    blocked: false,
    bookings: [
      { start: 900, end: 1020, label: "Guest Lecture: Climate Futures" },
      { start: 1140, end: 1200, label: "Film Society Screening" },
    ],
  },
];
