/**
 * @module constants/defaultState
 * Seed data and initial application state.
 * Separated from the hook so the default data is easy to find and edit.
 *
 * IDs use deterministic UUIDs (v4 format) so they are compatible with
 * the Supabase database schema. These get remapped to fresh UUIDs during
 * migration if needed.
 */

import type { AppState, Task } from "@/types";
import { DEFAULT_COLUMNS } from "@/constants";

/** Seed tasks for the default "Shrek is Love" project. */
export const SEED_TASKS: Task[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    title: "RESCUE PRINCESS FIONA",
    description: "Retrieve the princess from the dragon-guarded tower for Lord Farquaad",
    priority: "High",
    date: "Feb 24",
    dueDate: "2026-02-28",
    columnId: "todo",
    subtasks: [
      { id: "00000000-0000-4000-b000-000000000001", text: "Cross the rickety bridge over the lava", done: true },
      { id: "00000000-0000-4000-b000-000000000002", text: "Sneak past the dragon in the keep", done: false },
      { id: "00000000-0000-4000-b000-000000000003", text: "Find the highest room in the tallest tower", done: false },
    ],
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    title: "CLEAR THE SWAMP",
    description: "Evict the fairy tale creatures Farquaad dumped on the property",
    priority: "High",
    date: "Feb 24",
    dueDate: "2026-03-01",
    columnId: "todo",
    subtasks: [
      { id: "00000000-0000-4000-b000-000000000004", text: "Confront Farquaad in Duloc about the deed", done: true },
      { id: "00000000-0000-4000-b000-000000000005", text: "Complete the quest to earn the swamp back", done: false },
      { id: "00000000-0000-4000-b000-000000000006", text: "Relocate the Three Bears, Pinocchio & friends", done: false },
    ],
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    title: "ESCORT FIONA TO DULOC",
    description: "Deliver the princess to Lord Farquaad before sunset each day",
    priority: "Medium",
    date: "Feb 22",
    dueDate: "2026-02-25",
    columnId: "in-progress",
    subtasks: [
      { id: "00000000-0000-4000-b000-000000000007", text: "Set up camp before nightfall", done: true },
      { id: "00000000-0000-4000-b000-000000000008", text: "Cook dinner with Donkey by the fire", done: true },
      { id: "00000000-0000-4000-b000-000000000009", text: "Figure out why Fiona won't travel after dark", done: false },
    ],
  },
  {
    id: "00000000-0000-4000-a000-000000000004",
    title: "CONFRONT LORD FARQUAAD",
    description: "Crash the royal wedding at Duloc cathedral",
    priority: "High",
    date: "Feb 22",
    dueDate: "2026-02-26",
    columnId: "in-progress",
    subtasks: [
      { id: "00000000-0000-4000-b000-000000000010", text: "Convince Donkey to fly Dragon to Duloc", done: false },
      { id: "00000000-0000-4000-b000-000000000011", text: "Reach the cathedral before 'I do'", done: false },
    ],
  },
  {
    id: "00000000-0000-4000-a000-000000000005",
    title: "SURVIVE THE DRAGON'S KEEP",
    description: "Navigate the castle ruins, find Fiona, escape with Donkey alive",
    priority: "Low",
    date: "Feb 21",
    dueDate: "2026-02-20",
    columnId: "done",
    subtasks: [
      { id: "00000000-0000-4000-b000-000000000012", text: "Donkey distracts the dragon", done: true },
      { id: "00000000-0000-4000-b000-000000000013", text: "Slide down the dragon's tail to escape", done: true },
    ],
  },
  {
    id: "00000000-0000-4000-a000-000000000006",
    title: "TOURNAMENT IN DULOC",
    description: "Win Farquaad's tournament to earn the quest assignment",
    priority: "Medium",
    date: "Feb 21",
    dueDate: "2026-02-19",
    columnId: "done",
    subtasks: [],
  },
];

/** Initial app state used on first load (no localStorage data). */
export const DEFAULT_STATE: AppState = {
  projects: [
    { id: "00000000-0000-4000-a000-000000000101", name: "Shrek is Love", tasks: SEED_TASKS, columns: [...DEFAULT_COLUMNS], backgroundImage: null },
    { id: "00000000-0000-4000-a000-000000000102", name: "Work", tasks: [], columns: [...DEFAULT_COLUMNS], backgroundImage: null },
    { id: "00000000-0000-4000-a000-000000000103", name: "Personal", tasks: [], columns: [...DEFAULT_COLUMNS], backgroundImage: null },
  ],
  activeProjectId: "00000000-0000-4000-a000-000000000101",
  accentColor: "green",
  userInitials: "AP",
  deletedTasks: [],
  deletedProjects: [],
};
