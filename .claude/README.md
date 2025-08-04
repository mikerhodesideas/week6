# Claude Code Audio Feedback

Audio feedback hooks for Claude Code using macOS system sounds.

## Setup

Audio feedback is configured through hooks that play sounds when certain events occur:

- **notification.js** - Plays when Claude needs attention (**Ping** sound)
- **bash-complete.js** - Plays when bash commands complete (**Tink** sound)  
- **task-complete.js** - Plays when Claude completes a task (**Glass** sound)

## Configuration

Hooks are configured in `settings.json` using the proper Claude Code format:
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/notification.js"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/bash-complete.js"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/task-complete.js"
          }
        ]
      }
    ]
  }
}
```

## Available System Sounds

macOS includes 14 system sounds you can use:
- Basso.aiff - Deep bass note
- Blow.aiff - Wind/breath sound
- Bottle.aiff - Bottle pop sound
- Frog.aiff - Frog ribbit
- Funk.aiff - Funky beat
- Glass.aiff - **Glass breaking** (task complete)
- Hero.aiff - Triumphant fanfare
- Morse.aiff - Morse code beep
- Ping.aiff - **Sonar ping** 
- Pop.aiff - Quick pop
- Purr.aiff - Cat purring
- Sosumi.aiff - Classic Mac sound
- Submarine.aiff - Submarine sonar (notifications)

## Testing Sounds

Test any system sound manually:
```bash
# Current sounds
afplay /System/Library/Sounds/Ping.aiff
afplay /System/Library/Sounds/Tink.aiff
afplay /System/Library/Sounds/Hero.aiff

# Try other sounds
afplay /System/Library/Sounds/Sosumi.aiff
afplay /System/Library/Sounds/Glass.aiff
```

## Customization

To change sounds, edit the hook files and replace the sound file path:
```javascript
execSync("afplay /System/Library/Sounds/YourChoice.aiff");
```

## Requirements

- macOS (uses `afplay` command)
- Node.js 
- Claude Code with hooks support