# MsBuilder language support


## Functionality

This Language Server works for MsBuilder script file. It has the following language features:
- Completions

- Diagnosing script syntax errors (Not finished yet)

![image](https://github.com/HUANG-weiqin/MsBuilder-Checker/blob/main/img/command.png)
![image](https://github.com/HUANG-weiqin/MsBuilder-Checker/blob/main/img/closeName.png)
![image](https://github.com/HUANG-weiqin/MsBuilder-Checker/blob/main/img/errokey.png)
![image](https://github.com/HUANG-weiqin/MsBuilder-Checker/blob/main/img/not-same-name.png)


## Structure

```
.
├── client // Language Client
│   ├── src
│   │   ├── test // End to End tests for Language Client / Server
│   │   └── extension.ts // Language Client entry point
├── package.json // The extension manifest.
└── server // Language Server
    └── src
        └── server.ts // Language Server entry point
        └── analyser.ts // AST Syntax checking module
```

## Running the Sample

- Run `npm install` in this folder. This installs all necessary npm modules in both the client and server folder
- Open VS Code on this folder.
- Press Ctrl+Shift+B to start compiling the client and server 
- Switch to the Run and Debug View in the Sidebar (Ctrl+Shift+D).
- Select `Launch Client` from the drop down (if it is not already).
- Press ▷ to run the launch config (F5).
- In the instance of VSCode, open a document with '.xml'.
- Ctrl+Shift+B and Type into a command "CheckMsBuilderXML" to activate this plugin for Msbuilder script

