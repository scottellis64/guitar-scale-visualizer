# Fret Stop

Aims to be an all-in-one guitar learning and resource center.

## Research these resources

- [ytdlp-nodejs](https://github.com/iqbal-rashed/ytdlp-nodejs)
- tutorial for building a full stack streaming app on [Medium](https://medium.com/@phuongnamle0411/create-a-full-stack-streaming-app-using-react-node-js-and-mongodb-a-step-by-step-guide-9024dedb6f53)


## Server Module Setup

Each server module needs to have the following features in order to participate in the fret-stop ecosystem:
- Provides a Dockerfile that builds itself in production and development mode
   * In development mode, the source code of the project is copied to the docker container and built with yarn just as it is done locally
   * The server module's api endpoint port is exposed (common to both production and development)
   * A debug port is also exposed so that on the local system VSCode is able to connect remotely to running application, set breakpoints, etc
      * The module has a nodemon.json that is responsible for starting the application in debug mode
      * package.json has a dev script: "dev": "nodemon --config nodemon.json"
      * At the root of the project there is .env.development, that contains all of the development values to inject into the environment of both the build and the runtime environment.  There is .env for production, but the focus now is on development.
      * There are several challenges in making these environment variables available in all of the required contexts
         * When starting a development build, there is a script in /scripts called docker-compose-dev.sh, which has this content: docker-compose --env-file .env.development -f docker-compose.yml -f docker-compose-dev.yml "$@" 
         * The reason for --env-file .env.development
            * You will notice that some of the service definitions in docker-compose-*.yml have a env_file block that repeats this same information.  
               * passing into the build from the command line makes anything in the .env.development available to the docker build itself
               * todo

## Topology

I'd like for this architecture to be a composite of backend services and web subcomponents all
mixed together.

Look into this [stackexchange](https://stackoverflow.com/questions/47416277/serving-multiple-react-apps-with-client-side-routing-in-express) post that talks about using 
"Express Vhost Package".  




## Development

- Client runs on http://localhost:5173
- Server runs on http://localhost:3001
- LocalStack runs on http://localhost:4566 (AWS API endpoints)
- LocalStack Web UI is available through Docker Desktop extension at app.localstack.cloud

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

## Future direction and research

### Microservices architecture

At some point in the near future, all of this will be deployed to the cloud and assigned to a 
domain.  For now I am still iterating over all the POCs to provide a minimum viable product.

This will be deployed on AWS and to my way of thinking today this will involve combining AWS with
Docker in a microservices architecture/layout.  

We have clear delineations of functionality, but only a few at the start.  However, thinking ahead,
this can be a pluggable suite of products and services.  Currently these services are implemented or are in the works:

- Client - the web application 
- server - generic name that will change once there are a variety of services.  The server is a rest api that uses MongoDB.  Mongo so far has collections for:
   * users
   * saved videos from youtube and facebook
Mongo will have in the future:
   * all application state such as
      - learning pages for lack of a better term.  Learning pages are essentially like evernote notes, which can contain any combination of widgets, videos and audio recordings, tablatures, etc.  
      - Folders to organize resources into a hierarchy
      - Tags - tags can be applied to any entity
         * examples - genre:bluegress, riff:key-of-g,starts-on-1,ends-on-5,all-major,major-blues,all-pentatonic
- ffmpeg_server - this server provides media conversion services.  
   * this server is standalone and doesn't have a database or any other connected services
   * on this is installed a simple rest api that other services call call to perform conversions and media acquisition from various online sites such as youtube, facebook and many others that aren't implemented yet.  

In the future, another service to provide is one for audio stem separation

Services can be added and rendered in the UI. 

That's the rough plan anyway.

This plays nicely with the concept of a microservices architecture.  Instead of having one backend service that grows over time with more and more dependencies that can potentially conflict with one another, have several individual services makes sense.  Adding more has no impact on the others.

To make this all happen requires a technology stack that provides features such as:
- service discovery
- logging
- load balancing
- health monitoring

There are others. 

How best to do this?  That's the question.  So here are some links to start researching:
- [Hydra](https://blog.risingstack.com/deploying-node-js-microservices-to-aws-using-docker/) This article advocates for using Hydra, which appears to provide for everything needed to deploy NodeJS microservices.  Is it overkill?  
- [Here](https://thelinuxcode.com/how-to-build-a-serverless-node-js-microservice-on-aws-lambda/) is an article on how to use AWS Lambdas, which talks about an API Gateway that handles service discovery.  It also pushes DynamoDB.  Maybe this can replace Mongo, not sure.  But [here](https://www.mongodb.com/developer/products/atlas/serverless-development-lambda-atlas/) is an article that details how to use Mongo with AWS Lambda.
- [Another](https://medium.com/@randika/serverless-microservices-with-node-js-and-aws-lambda-build-deploy-34a8c3d80e41xx) AWS Lambda/DynamoDB how to
- No AWS, but all about Node [microservices](https://dev.to/abeinevincent/how-to-build-deploy-scalable-microservices-with-nodejs-typescript-and-docker-a-comprehesive-guide-2bcc)
      

*VS Code Editor Keyboard Shortcuts*  

| Shortcut  | Description                                        |
|-----------|----------------------------------------------------|
| cmd-enter | Start a new line without breaking the current line |
 

