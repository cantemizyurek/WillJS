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

  element.append(...children);

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

    requestAnimationFrame(rerenderVDom);
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
    if (update) {
      rerenderVDom();
    }
  }
}

function createWillJS(element) {
  rerenderVDom = initVDOM(element);
}

////////////////////////////////////////////////////////
//* App
function Task({ task, onToggle, onDelete }) {
  return createElement(
    "div",
    {
      style: `text-decoration: ${task.completed ? "line-through" : "none"}`,
    },
    [
      createElement("input", {
        type: "checkbox",
        checked: task.completed,
        onchange: () => onToggle(task.id),
      }),
      task.text,
      createElement(
        "button",
        {
          onclick: () => onDelete(task.id),
          style: "margin-left: 10px;",
        },
        ["Delete"]
      ),
    ]
  );
}

function TaskList() {
  const [tasks, setTasks] = useState([]);

  function addTask(text) {
    setTasks((prevTasks) => [
      ...prevTasks,
      { id: Date.now(), text, completed: false },
    ]);
  }

  function toggleTask(id) {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  function deleteTask(id) {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  }

  const taskItems = tasks.map((task) =>
    createElement(Task, {
      key: task.id,
      task,
      onToggle: toggleTask,
      onDelete: deleteTask,
    })
  );

  return createElement("div", {}, [
    createElement(NewTaskForm, { onAdd: addTask }),
    createElement("div", {}, taskItems),
  ]);
}

function NewTaskForm({ onAdd }) {
  const [inputValue, setInputValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue("");
    }
  }

  return createElement(
    "form",
    {
      onsubmit: handleSubmit,
    },
    [
      createElement("input", {
        type: "text",
        value: inputValue,
        oninput: (e) => setInputValue(e.target.value),
        placeholder: "Enter a task",
      }),
      createElement("button", { type: "submit" }, ["Add Task"]),
    ]
  );
}

const App = () => createElement(TaskList);

createWillJS(App);
