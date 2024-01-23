# ZokaDictionary
A dictionary web server and client for the Zokazeba Conlang.

## Setup
To set up and start the web server, follow these steps.
1. Go to the folder that this README is in.
2. Create a folder named "data".
3. In the "security" folder, create a file named "key.json" containing a JS object. This object will contain the Ed25519 public keys whose signature your app will trust to modify the dictionary content. For every such key, add an attribute to the JS object. This attribute's name will be the key's raw data in hexadecimal format, its value another JSON object. That sub-object will have an attribute named "publicKey" whose value is again the key in hexadecimal format. You can find an example of this in the file [security/example-keys.json](./security/example-keys.json).
4. Change the contents of the file "port.txt" to whatever TCP port you want the server to listen on.
5. Run "npm install".
6. Run "npm start".
