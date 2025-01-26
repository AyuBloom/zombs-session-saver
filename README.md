# zombs-session-saver
Multi-threaded Session Saver for the game zombs.io with APIs available. <br>
**A work in progress!** 
- Client now integrated into [Sun:Raise](https://greasyfork.org/en/scripts/467381-sun-raise-zombs-io)!
- A client script for testing is available now! More polished and customized client script is coming down the road.

## Features
Creating sockets that can be accessed via your web zombs.io client and can still be kept alive after you have finished your session. That's what Session Saver is all about!

## Special Features(?)
- Every socket is independent thread-wise!
- Fetching available sockets, creating and deleting sockets are done through APIs!
- Somewhat customizable settings...

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
- `sessionLimit`: Sets how many sockets can be held at once.
- `debugLevel`: Sets what logs should be shown when the server is running. [`ALL`, `NO_DEBUG`, `IMPORTANT_ONLY`, `ERROR_ONLY`] 

## Integration
**Implementation for Sun:Raise**:
- You can create a new session by scrolling down to the bottom of your server selection box and choose "New Session". A prompt will appear and you will need to type the ID of the server you want to have a session in (case-sensitive)
- Wait a little bit for the session to be created, then you would be able to see a new option to choose. [Example image](https://github.com/AyuBloom/zombs-session-saver/assets/85625843/7d1613ae-b05b-4086-9144-5f2bac7b5a52)
- Select the option, and press Play!

## Forwarding your local sessions
**Important:**
- Current clients made by me **have not yet supported endpoints other than localhost**. You will have to modify the client(s) to get this working.
- `<YOUR_SESSION_ADDRESS>` is your WebSocket server port, `<YOUR_SESSION_ADDRESS + 1>` is your API endpoint port - it is the WebSocket server port plus one. Please change it accordingly to your settings in the `config.json` file. 
### serveo
**Note:** serveo.net regularly goes down, if anything, it is not reliable for tunnels as a service.
- Open Terminal, then type in:
```
ssh -R 80:localhost:<YOUR_SESSION_ADDRESS> serveo.net
```
- Open another terminal tab, then type in:
```
ssh -R 80:localhost:<YOUR_SESSION_ADDRESS + 1> serveo.net
```
You can make multiple tunnels at once with just one command, but it'll give you two urls that you will have to verify yourself which one is which.
```
ssh -R 80:localhost:<YOUR_SESSION_ADDRESS> -R 80:localhost:<YOUR_SESSION_ADDRESS + 1> serveo.net
```
### ngrok
- First, set up ngrok ([guide here](https://dashboard.ngrok.com/get-started/setup/)).
- Find your ngrok.yml file for ngrok ([guide here](https://ngrok.com/docs/agent/config/)), open it in a text editor, then add this to your ngrok configuration file:
```yml
tunnels:
  first:
    addr: <YOUR_SESSION_ADDRESS>      
    proto: http    
  second:
    addr: <YOUR_SESSION_ADDRESS + 1> 
    proto: http
```
- Save the file, and now you can forward your traffic by doing:
```
ngrok start --all
```
Before you could access the tunnel, please **verify** the addresses by going on your browser and typing the address in, afterwards you'll see the ngrok warning page and click on the highlighted button.
