# Cards Agains tHumanity - Server
CS375 Final Project

# NOTES
1. Make sure to pull before working: 
``` bash 
git pull
```
2. If changes you're making are **dependent** on other files, create a branch and do pull request:
``` bash
git branch [branch_name]
git checkout [branch_name]
```

# Setup Server
We are using [Socket.io](https://socket.io/). Which enables us to send messages between clients and server in real-time. The idea is that based on those messages the client/server can acts accordingly.

**Examples**: *The client sends "START GAME" message and the server begins dealing the card.*

``` bash
cd serverCAH
npm install
npm start
```