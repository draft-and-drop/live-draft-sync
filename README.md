# Live Draft Sync

![Live Draft Sync Demo](assets/recording.gif)

Live Draft Sync is a fantasy football draft tool that connects a Chrome extension with a Nuxt web application to track Sleeper draft activity and update player rankings in real time.

## Features

- Monitor live Sleeper fantasy football drafts
- Detect draft-board changes through a Chrome extension
- Synchronize draft selections with a Nuxt web application
- Display live player rankings and draft status
- Map player identifiers across multiple fantasy football data sources
- Support external ranking and player-data integrations

## Tech Stack

- Nuxt/Vue
- TypeScript
- Tailwind CSS
- daisyUI
- Chrome Extensions API

## Project Structure

```text
live-draft-sync/
├── ff-draft-optimizer/        # Nuxt/Vue web application
├── sleeper-draft-extension/   # Chrome extension for monitoring Sleeper drafts
└── .github/workflows/         
```