# zombs-session-saver
Multi-threaded Session Saver for the game zombs.io with APIs availble. <br>
**A work in progress!** A client script for testing is available now! More polished and customized client script is coming down the road.

## Features
Creating sockets that can be accessed via your web zombs.io client and can still be kept alive after you have finished your session. That's what Session Saver is all about!

## Special Features(?)
- Every socket is independent thread-wise!
- Fetching available sockets, creating and deleting sockets are done through APIs!

## How to install
Simply clone the project by downloading the .zip file or through releases (coming soon!) <br>
Make sure you have installed [Node.js](https://nodejs.org/en/download/prebuilt-installer). <br>
To install necessary dependencies:
```
npm i 
```
To run:
```
node .
```

## Customizing your settings
You can change your preferred settings on the server with `config.json`! Currently supported parameters:
- `port`: Your default session access port. The API port will be availble at `port + 1`.
- `connectionTimeout`: Sets how long your client should wait for verification and validation before disconnecting.
- `password`: Your verification code.
- `sessionLimit`: Sets how many sockets can be held at once. (currently unused)

## Integration
Since I am also the developer of Sun:Raise, this Session Saver package will be added to the script in the future. Stay tuned!
