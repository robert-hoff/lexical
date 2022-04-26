# Modified `lexical-playground` package to work with `.NET Lexical`

Modified version of the [Lexical editor](https://github.com/facebook/lexical) with changes in the `lexical-playground` package meant to work with my `.NET Lexical Html Editor` (https://github.com/robert-hoff/dot-net-lexical), the idea is to achieve HTML or rich text editing in local applications developed in Visual Studio / C#. The .NET environment and Lexical are set up to communicate with Javascript and  JSON, which C# is able to execute through the [WebView2](https://docs.microsoft.com/en-us/dotnet/api/microsoft.web.webview2.winforms.webview2?view=webview2-dotnet-1.0.1185.39) control. The project is in early development and lacks functionality but there is a working demo out, you can check it out here <a href="https://files.codecreation.dev/net-lexical-demo.mp4" rel=".NET Lexical video"><ins>video</ins></a>

<table align=center><tr><td><p align="center" style="border: 1px solid blue"><a href="https://files.codecreation.dev/net-lexical-demo.mp4" target="_blank" rel=".NET Lexical video"><img src="https://files.codecreation.dev/files/video-thumbnail.png" alt="" /></a></p></td></tr></table>

For best experience it's a good idea to build both part. The Lexical package will build in two commands and the .NET in one (_we believe_).

## Test service

This test server https://net-lexical.codecreation.dev/ is hosting the Lexical part and is suitable for running the .NET part against. The server is almost identical to the [Lexical Playground demo](https://playground.lexical.dev/), just all the visible interface has been removed.

## Issuing editor instructions

Editing functionality is provided by Javascript functions and is how the .NET messaging is solved. While viewing the  <a href="https://net-lexical.codecreation.dev/"><ins>server</ins></a> commands can also be issued manually by typing them in the browser console <kbd>Ctrl</kbd>+<kbd>J</kbd>. The commands will all do the same as if you had clicked the corresponding button.

    document.formatBold()           document.formatQuote()
    document.formatItalic()         document.formatCodeBlock()
    document.formatUnderline()      document.toggleLink()
    document.formatParagraph()      document.tableButtonRef.current.click()
    document.formatHeading1()       document.imageButtonRef.current.click()
    document.formatHeading2()       document.equationButtonRef.current.click()


## Building

To build the Lexical server download `node.js v16.14.2` or higher, and `npm >= v8.2.3`, run `npm install` in the root directory, and in `./packages/lexical-playground` run

    npm run dev

This will start a `vite` development server on `localhost:3001`


## Repository changes

The important changes are in the commit `Write button clicks onto the DOM, hide the toolbar`. All the Javascript functions are written into the `ToolbarPlugin.jsx` file and emulate a user clicking the toolbar (there may well be better ways to go about solving this part)



