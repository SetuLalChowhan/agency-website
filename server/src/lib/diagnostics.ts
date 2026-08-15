import mongoose from "mongoose";

export type DbState = "connected" | "disconnected" | "connecting" | "disconnecting" | "error";

export function dbState(): DbState {
  const states: DbState[] = ["disconnected", "connected", "connecting", "disconnecting"];
  return states[mongoose.connection.readyState] ?? "error";
}
