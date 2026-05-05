import { mergeEnvMaps, getCommonKeys, getIncompleteKeys } from "./merger";

describe("mergeEnvMaps", () => {
  const alpha = { DB_HOST: "localhost", DB_PORT: "5432", SECRET: "abc" };
  const beta = { DB_HOST: "prod.db", DB_PORT: "5432", API_KEY: "xyz" };

  it("includes all keys from all sources", () => {
    const result = mergeEnvMaps({ alpha, beta });
    expect(result.keys).toEqual(["API_KEY", "DB_HOST", "DB_PORT", "SECRET"]);
  });

  it("lists sources correctly", () => {
    const result = mergeEnvMaps({ alpha, beta });
    expect(result.sources).toEqual(["alpha", "beta"]);
  });

  it("maps values per source for shared keys", () => {
    const result = mergeEnvMaps({ alpha, beta });
    const dbHost = result.entries.find((e) => e.key === "DB_HOST");
    expect(dbHost?.values["alpha"]).toBe("localhost");
    expect(dbHost?.values["beta"]).toBe("prod.db");
  });

  it("sets undefined for keys missing in a source", () => {
    const result = mergeEnvMaps({ alpha, beta });
    const secret = result.entries.find((e) => e.key === "SECRET");
    expect(secret?.values["alpha"]).toBe("abc");
    expect(secret?.values["beta"]).toBeUndefined();
  });

  it("handles a single source", () => {
    const result = mergeEnvMaps({ alpha });
    expect(result.sources).toEqual(["alpha"]);
    expect(result.keys).toEqual(["DB_HOST", "DB_PORT", "SECRET"]);
  });

  it("handles empty maps", () => {
    const result = mergeEnvMaps({ alpha: {}, beta: {} });
    expect(result.keys).toHaveLength(0);
    expect(result.entries).toHaveLength(0);
  });
});

describe("getCommonKeys", () => {
  it("returns keys present in all sources", () => {
    const result = mergeEnvMaps({
      a: { X: "1", Y: "2" },
      b: { X: "1", Z: "3" },
    });
    expect(getCommonKeys(result)).toEqual(["X"]);
  });

  it("returns all keys when all sources share them", () => {
    const result = mergeEnvMaps({
      a: { X: "1" },
      b: { X: "2" },
    });
    expect(getCommonKeys(result)).toEqual(["X"]);
  });
});

describe("getIncompleteKeys", () => {
  it("returns keys missing from at least one source", () => {
    const result = mergeEnvMaps({
      a: { X: "1", Y: "2" },
      b: { X: "1", Z: "3" },
    });
    const incomplete = getIncompleteKeys(result);
    expect(incomplete).toContain("Y");
    expect(incomplete).toContain("Z");
    expect(incomplete).not.toContain("X");
  });

  it("returns empty array when all keys are shared", () => {
    const result = mergeEnvMaps({
      a: { A: "1" },
      b: { A: "2" },
    });
    expect(getIncompleteKeys(result)).toHaveLength(0);
  });
});
