import {describe, it, expect} from "vitest";
import {validatePrompt} from "./index";
import {ValidationError} from "./errors";

describe("validatePrompt Function", () => {
  it("should return null for a valid, non-empty prompt within the length limit", () => {
    const validPrompt = "Tell me a joke.";
    expect(validatePrompt(validPrompt)).toBeNull();
  });

  it("should throw ValidationError for an empty string prompt", () => {
    const emptyPrompt = "";
    expect(() => validatePrompt(emptyPrompt)).toThrowError(ValidationError);
    expect(() => validatePrompt(emptyPrompt)).toThrowError("Prompt is required in the request body.");
  });

  it("should return null for a prompt that is exactly 2000 characters long", () => {
    const boundaryPrompt = "a".repeat(2000);
    expect(validatePrompt(boundaryPrompt)).toBeNull();
  });

  it("should throw ValidationError for a prompt longer than 2000 characters", () => {
    const longPrompt = "a".repeat(2001);
    expect(() => validatePrompt(longPrompt)).toThrowError(ValidationError);
    expect(() => validatePrompt(longPrompt)).toThrowError("Prompt must not exceed 2000 characters.");
  });

  it("should allow prompts with special characters if within length limit", () => {
    const specialCharPrompt = "!@#$%^&*()_+=-`~[]{};':\",./<>? ";
    expect(validatePrompt(specialCharPrompt)).toBeNull();
  });
});
