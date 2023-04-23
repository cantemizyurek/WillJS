let hookContexts = new Map();
let currentHooks = [];
let curIdx = 0;

function updateHookContexts(type, props) {
  let key = type;

  if (props.key) key = props.key;

  if (hookContexts.has(key)) {
    currentHooks = hookContexts.get(key);
  } else {
    hookContexts.set(key, currentHooks);
  }
}

function addEventListenerToElement(element, key, value) {
  const eventType = key.slice(2).toLowerCase();
  element.addEventListener(eventType, value);
}

function createElement(type, props = {}, children = []) {
  var element = null;

  if (typeof type === "function") {
    curIdx = 0;
    currentHooks = [];

    updateHookContexts(type, props);

    element = type({ ...props, children });
    return element;
  }

  element = document.createElement(type);

  Object.keys(props).forEach((key) => {
    if (key.startsWith("on") && typeof props[key] === "function") {
      addEventListenerToElement(element, key, props[key]);
    } else {
      element[key] = props[key];
    }
  });

  element.append(...children.filter((child) => child !== null));

  return element;
}

function initVDOM(element) {
  let vDOM = element;

  const root = document.getElementById("root");
  root.append(createElement(vDOM));

  return function reRenderVDOM() {
    const activeElement = document.activeElement;
    const activeElementPath = [];
    let currentNode = activeElement;

    while (currentNode !== root && currentNode !== document.body) {
      activeElementPath.unshift(
        Array.prototype.indexOf.call(
          currentNode.parentNode.childNodes,
          currentNode
        )
      );
      currentNode = currentNode.parentNode;
    }

    root.replaceChildren(createElement(vDOM));

    try {
      if (activeElementPath.length > 0) {
        let newActiveElement = root;
        for (const childIndex of activeElementPath) {
          newActiveElement = newActiveElement.childNodes[childIndex];
        }
        newActiveElement.focus();
      }
    } catch {}
  };
}

let rerenderVDom = null;

function useState(init) {
  let componentHooks = currentHooks;
  let idx = curIdx++;

  let val = init;

  if (componentHooks[idx]) {
    val = componentHooks[idx];
  } else {
    componentHooks[idx] = val;
  }

  function setState(newVal) {
    if (typeof newVal === "function") {
      componentHooks[idx] = newVal(componentHooks[idx]);
    } else {
      componentHooks[idx] = newVal;
    }

    if (rerenderVDom) {
      requestAnimationFrame(rerenderVDom);
    }
  }

  return [val, setState];
}

function useEffect(callback, states) {
  let componentHooks = currentHooks;
  let idx = curIdx++;

  let prevStates = componentHooks[idx];

  let update = false;

  if (prevStates && prevStates.values) {
    update = states.reduce((init, cur, idx) => {
      if (init === true) {
        return init;
      } else {
        return cur !== prevStates.values[idx];
      }
    }, false);
  }

  componentHooks[idx] = {
    values: states,
    callback: componentHooks[idx]?.callback,
  };

  if (update || !prevStates || !prevStates.values) {
    if (componentHooks[idx].callback) {
      componentHooks[idx].callback();
    }
    componentHooks[idx].callback = callback();
  }
}

function createWillJS(element) {
  rerenderVDom = initVDOM(element);
}

////////////////////////////////////////////////////////
//* App

function useCounter() {
  let [count, setCount] = useState(0);

  return [
    count,
    () => setCount((count) => count + 1),
    () => setCount((count) => count - 1),
    (val) => setCount(Number(val)),
  ];
}

function Counter() {
  const [count, increment, decrement, set] = useCounter();

  function displayText() {
    if (count > 0) {
      return createElement("p", {}, ["Higher Than 0"]);
    } else if (count < 0) {
      return createElement("p", {}, ["Lower Than 0"]);
    } else {
      return createElement("p", {}, ["Number 0"]);
    }
  }

  return createElement("div", {}, [
    createElement(
      "button",
      {
        onclick: decrement,
      },
      ["-"]
    ),
    createElement(
      "input",
      { value: count, oninput: (e) => set(e.target.value) },
      [count]
    ),
    createElement(
      "button",
      {
        onclick: increment,
      },
      ["+"]
    ),
    displayText(),
  ]);
}

const App = () => createElement(Counter);

createWillJS(App);
