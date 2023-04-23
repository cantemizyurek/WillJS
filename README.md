[See live demo here](https://cantemizyurek.github.io/WillJS/)

# Basic React-like Library

This is a basic React-like library that mimics some core React functionalities such as creating components, handling state, and handling effects. It provides a minimal API for creating web components and updating the DOM efficiently.

## Features

- React-like components
- Virtual DOM
- State management with `useState`
- Side effects with `useEffect`
- Event handling

## Installation

Simply include `basic-react-like.js` in your project.

```html
<script src="path/to/basic-react-like.js"></script>
```

## Usage

To create a component, define a function that returns a call to `createElement`.

```javascript
function App() {
  return createElement("div", {}, [
    createElement("h1", {}, ["Hello, Basic React-like Library!"]),
  ]);
}

createWillJS(App);
```

### State management with `useState`

This library provides a `useState` function to manage component state, similar to React's `useState` hook.

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  return createElement("div", {}, [
    createElement(
      "button",
      {
        onclick: () => setCount(count - 1),
      },
      ["-"]
    ),
    createElement("span", {}, [count]),
    createElement(
      "button",
      {
        onclick: () => setCount(count + 1),
      },
      ["+"]
    ),
  ]);
}
```

### Side effects with `useEffect`

This library provides a `useEffect` function to handle side effects like fetching data, DOM manipulation, etc., similar to React's `useEffect` hook.

```javascript
function FetchData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("https://api.example.com/data")
      .then((response) => response.json())
      .then((data) => setData(data));
  }, []);

  return createElement("div", {}, [JSON.stringify(data)]);
}
```

### Event handling

This library can handle events by prefixing the event type with "on" (e.g. `onclick`, `oninput`, etc.).

```javascript
function Input() {
  const [value, setValue] = useState("");

  return createElement("input", {
    type: "text",
    value: value,
    oninput: (e) => setValue(e.target.value),
  });
}
```

## API

### `createElement(type, props, children)`

Creates a virtual DOM element.

- `type`: String or function
- `props`: Object (default: `{}`)
- `children`: Array (default: `[]`)

### `initVDOM(element)`

Initializes the virtual DOM and renders the provided element into the root element with id "root".

- `element`: Virtual DOM element

### `useState(init)`

Function to manage component state.

- `init`: Initial state value

Returns an array containing the state value and a function to update it.

### `useEffect(callback, states)`

Function to handle side effects.

- `callback`: Function to run when state changes
- `states`: Array of state dependencies

### `createWillJS(element)`

Initializes the library with the given element as the root component.

- `element`: Function that returns a virtual DOM element
