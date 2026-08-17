import {
  parseOptionalDecimal,
  parseOptionalText,
  parseJsonField,
  buildDogWriteData,
} from "../server/helpers";

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(parseOptionalDecimal(null) === null, "null decimal should be null");
assert(parseOptionalDecimal("") === null, "empty decimal should be null");
assert(parseOptionalDecimal("NaN") === null, "NaN decimal should be null");
assert(parseOptionalDecimal(Number.NaN) === null, "numeric NaN should be null");
assert(parseOptionalDecimal("27.5") === "27.5", "valid decimal should stringify");
assert(parseOptionalText(null) === null, "null price should be null");
assert(parseOptionalText(1500) === "1500", "numeric price should stringify");
assert(Array.isArray(parseJsonField("[object Object]", [])), "invalid JSON should fall back");
assert(Array.isArray(parseJsonField({ url: "x" }, []) ) === false, "object JSON field should pass through");

const update = buildDogWriteData({
  name: "Austen",
  gender: "female",
  birthDate: "2023-01-06",
  price: null,
  height: null,
  weight: 84,
  display: true,
  mother: { id: 1, name: "Should not persist" },
  media: [{ url: "ignore-me" }],
});

assert(update.price === null, "dog price null stays null");
assert(update.height === null, "dog height null stays null");
assert(update.weight === "84", "dog weight is parsed");
assert(!("mother" in update), "nested mother must be stripped");
assert(!("media" in update), "media must be stripped");

console.log("API helper smoke checks passed");
