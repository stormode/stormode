# Stormode Terminal

Stormode Terminal is a terminal dependency for <a href="https://github.com/stormode/stormode" target="_blank" rel="noreferrer noopener" >Stormode</a> that can also be used separately.

## Installation

You can install Stormode Terminal using npm or pnpm:

```bash
# npm
npm install stormode-terminal

# pnpm
pnpm add stormode-terminal
```

## Usage

To use Stormode Terminal, start by importing it into your project:

```javascript
// CommonJS
const terminal = require("stormode-terminal");

// ESM
import terminal from "stormode-terminal";
```

Once imported, you can utilize various types of terminals provided by Stormode Terminal:

### Info Terminal

```javascript
terminal.info("This is a info terminal.");

// Output:
// - [info] This is a info terminal.
```

### Wait Terminal

```javascript
terminal.wait("Please wait a moment...");

// Output:
// - [wait] Please wait a moment...
```

### Ready Terminal

```javascript
terminal.ready("Your project is ready!");

// Output:
// - [ready] Your project is ready!
```

### Warn Terminal

```javascript
terminal.warn("Warning!");

// Output:
// - [warn] Warning!
```

### Error Terminal

```javascript
terminal.error("Something went wrong!");

// Output:
// - [error] Something went wrong!
```

### Cancel Terminal

```javascript
terminal.cancel("Operation cancelled");

// Output:
// - [cancel] Operation cancelled
```

## Customize

You may import the terminal into your `console.log` or `new Error`:

```javascript
console.log(terminal.info("Hello!", { mode: "string" }));

// Output:
// - [info] Hello!
```

## Color Functions

In addition to the standard terminals, Stormode Terminal offers a range of color functions:

```javascript
terminal.color.redLight("This is red but lighter");
terminal.color.red("This is red");
terminal.color.redDark("This is red but darker");

terminal.color.yellowLight("This is yellow but lighter");
terminal.color.yellow("This is yellow");
terminal.color.yellowDark("This is yellow but darker");

terminal.color.blueLight("This is blue but lighter");
terminal.color.blue("This is blue");
terminal.color.blueDark("This is blue but darker");

terminal.color.greenLight("This is green but lighter");
terminal.color.green("This is green");
terminal.color.greenDark("This is green but darker");

terminal.color.purpleLight("This is purple but lighter");
terminal.color.purple("This is purple");
terminal.color.purpleDark("This is purple but darker");
```

Feel free to explore and use these color functions in your project.

## License

This project is MIT licensed, you can find the license file <a href="https://github.com/stormode/stormode/blob/main/LICENSE" target="_blank" rel="noreferrer noopener" >here</a>.
