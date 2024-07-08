# zombs-session-saver
Multi-threaded Session Saver for the game zombs.io with APIs availble. <br>
**A work in progress!** 
- Client now integrated into [Sun:Raise](https://greasyfork.org/en/scripts/467381-sun-raise-zombs-io)!
- A client script for testing is available now! More polished and customized client script is coming down the road.

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
**Implementation for Sun:Raise**:
- You can create a new session by scrolling down to the bottom of your server selection box and choose "New Session". A prompt will appear and you will need to type the ID of the server you want to have a session in (case-sensitive)
- Wait a little bit for the session to be created, then you would be able to see a new option to choose. [Example image](https://github.com/AyuBloom/zombs-session-saver/assets/85625843/7d1613ae-b05b-4086-9144-5f2bac7b5a52)
- Select the option, and press Play!

## Forwarding your local sessions
**Caution:** current clients **have not yet supported endpoints other than localhost**. You will have to modify the client to get this working.
### ngrok
Since forwarding TCP connections **now requires a credit/debit card**, this option might not be viable for some, but **it is still free**.
- First, set up ngrok ([guide here](https://dashboard.ngrok.com/get-started/setup/)), then set up your billing methods ([in your dashboard](https://dashboard.ngrok.com/billing)).
- Find your ngrok.yml file for ngrok ([guide here](https://ngrok.com/docs/agent/config/)), open it in a text editor, then add this to your ngrok configuration file:
```yml
tunnels:
  first:
    addr: <YOUR_SESSION_ADDRESS>      # Your session address can be found in your config.json file of your session saver server
    proto: http    
  second:
    addr: <YOUR_SESSION_ADDRESS + 1>  # The address above, but plus one (eg. 727 -> 728)
    proto: http
```
Save the file, and now you can forward your traffic by doing:
```
ngrok start --all
```

