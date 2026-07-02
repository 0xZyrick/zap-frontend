import { TORII_URL } from "./dojoConfig";

const ROOM_KEY = "zapfc:pvpRooms:v1";
const ROOM_EVENT = "zapfc:pvpRooms:update";

const readRooms = () => {
  try {
    return JSON.parse(localStorage.getItem(ROOM_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeRooms = (rooms) => {
  try {
    localStorage.setItem(ROOM_KEY, JSON.stringify(rooms));
    window.dispatchEvent(new CustomEvent(ROOM_EVENT));
  } catch {}
};

const cleanCode = (value = "") =>
  String(value).trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);

const makeRoomCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
};

export const createPvpRoom = (host) => {
  const rooms = readRooms();
  let code = makeRoomCode();
  while (rooms[code]) code = makeRoomCode();

  const room = {
    code,
    status: "waiting",
    source: TORII_URL ? "torii-ready-local" : "local",
    host,
    guest: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  rooms[code] = room;
  writeRooms(rooms);
  return room;
};

export const joinPvpRoom = (code, guest) => {
  const roomCode = cleanCode(code);
  const rooms = readRooms();
  const existing = rooms[roomCode];
  if (!existing) return { error: "Room not found. Check the code and try again." };
  if (existing.guest && existing.guest.id !== guest.id) {
    return { error: "That room already has a rival." };
  }

  const room = {
    ...existing,
    guest,
    status: "paired",
    updatedAt: Date.now(),
  };
  rooms[roomCode] = room;
  writeRooms(rooms);
  return { room };
};

export const getPvpRoom = (code) => readRooms()[cleanCode(code)] || null;

export const subscribePvpRooms = (callback) => {
  const handler = () => callback(readRooms());
  window.addEventListener(ROOM_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(ROOM_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
};
