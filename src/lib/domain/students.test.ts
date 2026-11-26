import { describe, expect, it } from "vitest";
import {
  initials,
  moveBefore,
  orderStudents,
  parseRoster,
  roomNameLines,
  shortName,
} from "./students";
import type { Student } from "./types";

const student = (id: string, firstName: string, lastName: string): Student => ({
  id,
  firstName,
  lastName,
});

describe("parseRoster", () => {
  it("reads one student per line, skipping blank lines and extra spaces", () => {
    expect(parseRoster("Maria Elena Gonzalez\n\n  Cher  \nTom   Ng\n")).toEqual(
      [
        { firstName: "Maria", lastName: "Elena Gonzalez" },
        { firstName: "Cher", lastName: "" },
        { firstName: "Tom", lastName: "Ng" },
      ],
    );
  });
});

describe("initials", () => {
  it("uses the first word and the last word", () => {
    expect(initials({ firstName: "Maria", lastName: "Elena Gonzalez" })).toBe(
      "MG",
    );
  });

  it("uses the first two letters of a single name", () => {
    expect(initials({ firstName: "Cher", lastName: "" })).toBe("CH");
  });
});

describe("shortName", () => {
  it("shortens the last name to an initial", () => {
    expect(shortName({ firstName: "Maria", lastName: "Gonzalez" })).toBe(
      "Maria G.",
    );
    expect(shortName({ firstName: "Cher", lastName: "" })).toBe("Cher");
  });
});

describe("roomNameLines", () => {
  const maria = { firstName: "María", lastName: "de León" };

  it("formats each Room View choice and preserves entered spelling", () => {
    expect(roomNameLines(maria, "initials")).toEqual({ primary: "ML" });
    expect(roomNameLines(maria, "initials-first")).toEqual({
      primary: "ML",
      secondary: "María",
    });
    expect(roomNameLines(maria, "initials-last")).toEqual({
      primary: "ML",
      secondary: "de León",
    });
    expect(roomNameLines(maria, "first-last")).toEqual({
      primary: "María",
      secondary: "de León",
    });
  });

  it("omits missing lines and uses the available name in first-last mode", () => {
    const firstOnly = { firstName: "Cher", lastName: "" };
    const lastOnly = { firstName: "", lastName: "Ng" };
    expect(roomNameLines(firstOnly, "initials-last")).toEqual({
      primary: "CH",
    });
    expect(roomNameLines(lastOnly, "initials-first")).toEqual({
      primary: "NG",
    });
    expect(roomNameLines(firstOnly, "first-last")).toEqual({ primary: "Cher" });
    expect(roomNameLines(lastOnly, "first-last")).toEqual({ primary: "Ng" });
  });
});

describe("orderStudents", () => {
  const amy = student("a", "Amy", "Zane");
  const bo = student("b", "Bo", "Young");
  const cy = student("c", "Cy", "Adams");

  it("sorts by first or last name in either direction", () => {
    const ids = (order: Parameters<typeof orderStudents>[1]) =>
      orderStudents([bo, cy, amy], order).map((s) => s.id);
    expect(ids("first-asc")).toEqual(["a", "b", "c"]);
    expect(ids("first-desc")).toEqual(["c", "b", "a"]);
    expect(ids("last-asc")).toEqual(["c", "b", "a"]);
    expect(ids("last-desc")).toEqual(["a", "b", "c"]);
  });

  it("follows a custom order and puts newcomers at the end", () => {
    const ordered = orderStudents([amy, bo, cy], "custom", ["c", "a"]);
    expect(ordered.map((s) => s.id)).toEqual(["c", "a", "b"]);
  });
});

describe("moveBefore", () => {
  it("moves an id to sit just before another", () => {
    expect(moveBefore(["a", "b", "c", "d"], "d", "b")).toEqual([
      "a",
      "d",
      "b",
      "c",
    ]);
    expect(moveBefore(["a", "b", "c"], "a", "c")).toEqual(["b", "a", "c"]);
  });
});
