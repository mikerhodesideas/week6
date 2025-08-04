#!/usr/bin/env node

const { execSync } = require("child_process");

// Play notification sound when Claude needs attention
// Using Ping sound from system sounds
try {
  if (process.platform === "darwin") {
    execSync("afplay /System/Library/Sounds/Submarine.aiff");
  }
} catch (error) {
  // Silently fail if sound can't be played
}