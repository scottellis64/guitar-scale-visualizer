# Guitar App

A guitar application with a React client and Express server.

## Research these resources

- [ytdlp-nodejs](https://github.com/iqbal-rashed/ytdlp-nodejs)
- tutorial for building a full stack streaming app on [Medium](https://medium.com/@phuongnamle0411/create-a-full-stack-streaming-app-using-react-node-js-and-mongodb-a-step-by-step-guide-9024dedb6f53)

## Project Structure

```
.
├── client/           # React frontend application
│   ├── src/         # Client source code
│   ├── public/      # Static assets
│   └── package.json # Client dependencies
├── server/          # Express backend application
│   ├── src/         # Server source code
│   └── package.json # Server dependencies
└── package.json     # Root package.json for managing both client and server
```

## Setup

1. Install dependencies:
   ```bash
   yarn install-all
   ```

2. Start development servers:
   ```bash
   yarn dev
   ```
   This will start both the client (Vite) and server (Express) in development mode.

3. Build for production:
   ```bash
   yarn build
   ```

## Development

- Client runs on http://localhost:5173
- Server runs on http://localhost:3001

## API Endpoints

- GET /api/scales - Returns a list of musical scales

*Guitar Fretboard Visualizer*

This project is inspired by my personal journey into learning how to play guitar.  Everything is available online today for the hungry mind. When I was growing up, your two choices were to either find a guitar instructor or learn from books and magazines, or both.  Now with YouTube, Facebook, Instagram, et al, choices are nearly unlimited.

Some of my learning challenges include:
- How to visualize scales on the fretboard 
- When soloing, where do I go next when the chord changes?  How does the scale I'm playing over now differ from the scale I'm about to switch to?  
- How do I structure my practice routine?  


This last point is the original motivation of this project.  Here is what I do today.

1. I hear a song that I want to learn and play.
2. I find official audio of that song on YouTube and use an online tool to extract the audio from it and save it to a folder on my computer.
3. I'll look for tablature online, but that isn't always available.  Sometimes I find a video from various spots like Facebook or YouTube, and I'll use various tools to download a copy of that video so I can watch it locally using VLC, which can loop a section for me.  But sometimes it's too fast.
4. I use a slow-downer tool like Capo so I can change the speed without changing pitch.  I save the project in the same folder with all my other downloaded artifacts.
5. I'd sometimes I print off empty tabbing templates to write down what I've learned so I can recall it all later, because I will inevitably forget.
6. I move on to another song and months later I dimly recall that I was once working on a song I hear playing, but I've totally forgotten what I had learned before.  I think I still have it on my computer...


So this will eventually be a full blown application that hopefully can do the following:

- Download videos from social media and automatically extract audio
- Can that audio be looped in this application?  Slowed down without losing pitch?
- Can the audio be stem-split so that guitar and vocals can be played separately?  
- How about tablature creation?
- Can the application be taught to listen to the guitar I'm playing and add that to the tablature editor?  It would need to be sensitive enough to discern which fret and string the note was picked from.

There is so much more to choose from.  Ideally this is a platform that has tools that can be plugged in.  

Right now, this is a simple web application that displays a guitar fretboard with the basic ability to render a handful of scales and some scale patterns.  

It's only just begun and the same functionality can be found in other github repos that is further along.  

**Getting Started**

From the root of the project:
```bash
yarn install-all
```

This installs all of your dependencies and makes the application ready to work on.

For development:
```bash
yarn dev
```

To create a production build, run:
```bash
yarn build
```

The build command builds all artifacts in the dist folder.  If you want to run the application in prod mode, you can install _serve_ globally:

```bash
yarn global add serve
```

I'm going from memory on that one.  Here's how to start it up:

```bash
serve -s dist
   ┌───────────────────────────────────────────┐
   │                                           │
   │   Serving!                                │
   │                                           │
   │   - Local:    http://localhost:3000       │
   │   - Network:  http://192.168.1.233:3000   │
   │                                           │
   │   Copied local address to clipboard!      │
   │                                           │
   └───────────────────────────────────────────┘
```

Now look at http://localhost:3000 in your favorite browser.

During devopment, you can work on components in storybook:

```bash
yarn storybook
```

This will bring up the storybook page in your default browser.

And finally, you can run all current jest tests with:

```bash
yarn test
```
Today, that gets you one passing and 3 failing tests.  Testing is often a developer's last priority, including that of yours truly.

Stay tuned!