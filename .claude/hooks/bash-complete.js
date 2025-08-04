#!/usr/bin/env node

const { execSync } = require("child_process");

// Play sound when bash command completes
// Using Tink sound from system sounds
try {
  if (process.platform === "darwin") {
    execSync("afplay /System/Library/Sounds/Tink.aiff");
  }
} catch (error) {
  // Silently fail if sound can't be played
}