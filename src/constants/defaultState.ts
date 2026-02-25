/**
 * @module constants/defaultState
 * Seed data and initial application state.
 * Separated from the hook so the default data is easy to find and edit.
 */

import type { AppState, Task } from "@/types";
import { DEFAULT_COLUMNS } from "@/constants";

/** Seed tasks for the default "Shrek is Love" project. */
export const SEED_TASKS: Task[] = [
  {
    id: "t1",
    title: "RESCUE PRINCESS FIONA",
    description: "Retrieve the princess from the dragon-guarded tower for Lord Farquaad",
    priority: "High",
    date: "Feb 24",
    dueDate: "2026-02-28",
    columnId: "todo",
    subtasks: [
      { id: "s1a", text: "Cross the rickety bridge over the lava", done: true },
      { id: "s1b", text: "Sneak past the dragon in the keep", done: false },
      { id: "s1c", text: "Find the highest room in the tallest tower", done: false },
    ],
  },
  {
    id: "t2",
    title: "CLEAR THE SWAMP",
    description: "Evict the fairy tale creatures Farquaad dumped on the property",
    priority: "High",
    date: "Feb 24",
    dueDate: "2026-03-01",
    columnId: "todo",
    subtasks: [
      { id: "s2a", text: "Confront Farquaad in Duloc about the deed", done: true },
      { id: "s2b", text: "Complete the quest to earn the swamp back", done: false },
      { id: "s2c", text: "Relocate the Three Bears, Pinocchio & friends", done: false },
    ],
  },
  {
    id: "t3",
    title: "ESCORT FIONA TO DULOC",
    description: "Deliver the princess to Lord Farquaad before sunset each day",
    priority: "Medium",
    date: "Feb 22",
    dueDate: "2026-02-25",
    columnId: "in-progress",
    subtasks: [
      { id: "s3a", text: "Set up camp before nightfall", done: true },
      { id: "s3b", text: "Cook dinner with Donkey by the fire", done: true },
      { id: "s3c", text: "Figure out why Fiona won't travel after dark", done: false },
    ],
  },
  {
    id: "t4",
    title: "CONFRONT LORD FARQUAAD",
    description: "Crash the royal wedding at Duloc cathedral",
    priority: "High",
    date: "Feb 22",
    dueDate: "2026-02-26",
    columnId: "in-progress",
    subtasks: [
      { id: "s4a", text: "Convince Donkey to fly Dragon to Duloc", done: false },
      { id: "s4b", text: "Reach the cathedral before 'I do'", done: false },
    ],
  },
  {
    id: "t5",
    title: "SURVIVE THE DRAGON'S KEEP",
    description: "Navigate the castle ruins, find Fiona, escape with Donkey alive",
    priority: "Low",
    date: "Feb 21",
    dueDate: "2026-02-20",
    columnId: "done",
    subtasks: [
      { id: "s5a", text: "Donkey distracts the dragon", done: true },
      { id: "s5b", text: "Slide down the dragon's tail to escape", done: true },
    ],
  },
  {
    id: "t6",
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
    { id: "p1", name: "Shrek is Love", tasks: SEED_TASKS, columns: [...DEFAULT_COLUMNS], backgroundImage: null },
    { id: "p2", name: "Work", tasks: [], columns: [...DEFAULT_COLUMNS], backgroundImage: null },
    { id: "p3", name: "Personal", tasks: [], columns: [...DEFAULT_COLUMNS], backgroundImage: null },
  ],
  activeProjectId: "p1",
  accentColor: "green",
  userInitials: "AP",
  deletedTasks: [],
  deletedProjects: [],
};
