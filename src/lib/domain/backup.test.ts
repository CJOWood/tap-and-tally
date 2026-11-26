import { expect, it } from "vitest";
import { readData } from "./backup";

it("defaults older classes to initials and preserves saved Room names per class", () => {
  const lastShown = {
    view: "room",
    roomLayoutId: "room",
    gridOrder: "first-asc",
    customOrder: [],
  };
  const classes = [
    { id: "legacy", view: "room", roomLayoutId: "room" },
    { id: "older", lastShown },
    {
      id: "customized",
      lastShown: { ...lastShown, roomNameDisplay: "first-last" },
    },
  ];
  const data = readData(JSON.stringify({ classes }));
  expect(data?.classes.map((cls) => cls.lastShown.roomNameDisplay)).toEqual([
    "initials",
    "initials",
    "first-last",
  ]);
  expect(data?.classes[1].lastShown).toMatchObject(lastShown);
});
