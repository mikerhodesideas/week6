#!/usr/bin/env node

const { execSync } = require("child_process");

// Play sound when Claude completes a task
// Using Glass sound from system sounds
try {
  if (process.platform === "darwin") {
    execSync("afplay /System/Library/Sounds/Glass.aiff");
  }
} catch (error) {
  // Silently fail if sound can't be played
}