# ZokaDictionary
A dictionary web server and client for the Zokazeba Conlang.

## Setup
To set up and start the web server, follow these steps.
1. Go to the folder that this README is in.
2. Create a folder named "data".
3. In the "security" folder, create a file named "key.txt" containing a random password-like text. This will be the secret key that authorised clients may use to edit your dictionary's data.
4. In the file "server.js", change the "port" constant to whatever TCP port you want the server to listen on.
5. Run "npm install".
6. Run "node app.js".
