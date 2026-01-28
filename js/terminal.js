const terminal = document.getElementById("terminal");
const promptUser = "ian@ianjchoi.com";
let currentDir = "~";
let currentInput = "";
// Cache text file contents to avoid repeated fetches.
const textCache = new Map();
const welcomePath = "/outputs/home/welcome.txt";
const aboutPath = "/outputs/about/about.txt";
const contactPath = "/outputs/about/contact.txt";

const HDCDW_00 = "/outputs/tech/HowDoesCdWork/00_ReadMe.txt";
const HDCDW_01 = "/outputs/tech/HowDoesCdWork/01_structure.txt";

const loadTextFile = async (path) => {
  if (textCache.has(path)) {
    return textCache.get(path);
  }
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.status}`);
    }
    const text = (await response.text()).replace(/\r\n/g, "\n");
    textCache.set(path, text);
    return text;
  } catch (error) {
    console.error(error);
    const fallback = `zsh: failed to load ${path}`;
    textCache.set(path, fallback);
    return fallback;
  }
};

const getWelcomeOutput = () => loadTextFile(welcomePath);
const getAboutOutput = () => loadTextFile(aboutPath);
const getContactOutput = () => loadTextFile(contactPath);
const getHDCDWOutput_00 = () => loadTextFile(HDCDW_00);
const getHDCDWOutput_01 = () => loadTextFile(HDCDW_01);

const lsOutput_home = [
  "total 283",
  'drw-r--r-- ian staff 3887 Jan 24 00:23 about',
  'drwxr--r-- ian staff 3887 Jan 24 00:23 tech',
  "-rw-r--r-- ian staff  512 Jan 24 00:23 welcome.txt"
].join("\n");
const lsOutput_about = [
  "total 283",
  '-rw-r--r-- ian staff 3887 Jan 24 00:23 about.txt',
  '-rw-r--r-- ian staff 3887 Jan 24 00:23 contact.txt'
].join("\n");
const lsOutput_tech = [
  "total 382",
  'drw-r--r-- ian staff 3887 Jan 24 00:23 HowDoesCdWork',
].join("\n");
const lsOutput_HDCDW = [
  "total 330",
  '-rw-r--r-- ian staff 383  Jan 24 00:23 00_ReadMe.txt',
  '-rw-r--r-- ian staff 1037 Jan 24 00:23 01_structure.txt'
].join("\n");

const isEditableTarget = (target) => {
  if (!target) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
};

const getCurrentInputSpan = () =>
  terminal.querySelector(".terminal-input");

const renderInput = () => {
  const inputSpan = getCurrentInputSpan();
  if (inputSpan) {
    inputSpan.textContent = currentInput;
  }
};

const finalizeCurrentLine = () => {
  const inputSpan = getCurrentInputSpan();
  if (inputSpan) {
    inputSpan.classList.remove("terminal-input");
  }
  currentInput = "";
};

const appendOutput = (output, asHtml = false) => {
  if (!output) return;
  trimTrailingWhitespaceNodes();
  const needsNewline = !terminal.textContent.endsWith("\n");
  const payload = `${needsNewline ? "\n" : ""}${output}`;
  if (asHtml) {
    terminal.insertAdjacentHTML("beforeend", payload);
  } else {
    terminal.insertAdjacentText("beforeend", payload);
  }
};

const runCommand = async (command) => {
  const normalized = command.trim();

  if (normalized === "cd ~" || normalized === "cd") {
    currentDir = "~";
    return { output: "", asHtml: false };
  }
  if (normalized === "cd .") {
    return { output: "", asHtml: false };
  }






  if (currentDir === "~") {
    if (normalized === "cat welcome.txt") {
      return { output: await getWelcomeOutput(), asHtml: false };
    }
    if (normalized === "ls -l") {
      return { output: lsOutput_home, asHtml: false };
    }
    if (normalized.startsWith("cd ")) {
      if (normalized === "cd ..") {
        currentDir = "~";
        return { output: "", asHtml: false };
      }
      if (normalized === "cd about" || normalized === "cd about/") {
        currentDir = "about";
        return { output: "", asHtml: false };
      }
      if (normalized === "cd tech" || normalized === "cd tech/") {
        currentDir = "tech";
        return { output: "", asHtml: false };
      }
      if (normalized === "cd welcome.txt") {
        return { output: `cd: not a directory: ${normalized.slice(3)}`, asHtml: false };
      }
      return { output: `cd: no such file or directory: ${normalized.slice(3)}`, asHtml: false };
    }
  }






  if (currentDir === "about") {
    if (normalized === "cat about.txt") {
      return { output: await getAboutOutput(), asHtml: false };
    }
    if (normalized === "cat contact.txt") {
      return { output: await getContactOutput(), asHtml: false };
    }
    if (normalized === "ls -l") {
      return { output: lsOutput_about, asHtml: false };
    }
    if (normalized.startsWith("cd ")) {
      if (normalized === "cd ..") {
        currentDir = "~";
        return { output: "", asHtml: false };
      }
      return { output: `cd: no such file or directory: ${normalized.slice(3)}`, asHtml: false };
    }
  }





  if (currentDir === "tech") {
    if (normalized === "ls -l") {
      return { output: lsOutput_tech, asHtml: false };
    }
    if (normalized.startsWith("cd ")) {
      if (normalized === "cd ..") {
        currentDir = "~";
        return { output: "", asHtml: false };
      }
     if (normalized === "cd HowDoesCdWork" || normalized === "cd HowDoesCdWork/") {
        currentDir = "HowDoesCdWork";
        return { output: "", asHtml: false };
      }
      return { output: `cd: no such file or directory: ${normalized.slice(3)}`, asHtml: false };
    }
  }





  if (currentDir === "HowDoesCdWork") {
    if (normalized === "ls -l") {
      return { output: lsOutput_HDCDW, asHtml: false };
    }
    if (normalized === "cat 00_ReadMe.txt") {
      return { output: await getHDCDWOutput_00(), asHtml: false };
    }
    if (normalized === "cat 01_structure.txt") {
      return { output: await getHDCDWOutput_01(), asHtml: false };
    }
    if (normalized.startsWith("cd ")) {
      if (normalized === "cd ..") {
        currentDir = "tech";
        return { output: "", asHtml: false };
      }
      return { output: `cd: no such file or directory: ${normalized.slice(3)}`, asHtml: false };
    }
  }

  if (normalized.length > 0) {
    return { output: `zsh: command not found: ${normalized}`, asHtml: false };
  }
  return { output: "", asHtml: false };
};

const trimTrailingWhitespaceNodes = () => {
  let node = terminal.lastChild;
  while (node && node.nodeType === Node.TEXT_NODE) {
    if (/^\s*$/.test(node.nodeValue)) {
      const prev = node.previousSibling;
      node.remove();
      node = prev;
      continue;
    }
    break;
  }
};

const getPromptText = () => `${promptUser} ${currentDir} % `;

const appendPrompt = () => {
  const existingCursor = terminal.querySelector(".terminal-cursor");
  if (existingCursor) {
    existingCursor.remove();
  }

  trimTrailingWhitespaceNodes();

  terminal.insertAdjacentHTML(
    "beforeend",
    `\n${getPromptText()}<span class="terminal-input"></span><span class="terminal-cursor">█</span>`
  );
  terminal.scrollTop = terminal.scrollHeight;
  // Keep the page view pinned to the bottom as new lines are added.
  requestAnimationFrame(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
};

const createMobileInput = () => {
  const input = document.createElement("input");
  input.type = "text";
  input.setAttribute("aria-label", "Terminal input");
  input.autocapitalize = "none";
  input.autocorrect = "off";
  input.spellcheck = false;
  input.inputMode = "text";
  input.style.position = "fixed";
  input.style.opacity = "0.01";
  input.style.pointerEvents = "auto";
  input.style.height = "2px";
  input.style.width = "2px";
  input.style.left = "0px";
  input.style.top = "0px";
  input.style.fontSize = "16px";
  document.body.appendChild(input);
  return input;
};

const mobileInput = createMobileInput();

const syncMobileInput = () => {
  mobileInput.value = currentInput;
};

document.addEventListener("keydown", async (event) => {
  if (isEditableTarget(event.target)) {
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    const command = currentInput;
    finalizeCurrentLine();
    const { output, asHtml } = await runCommand(command);
    appendOutput(output, asHtml);
    appendPrompt();
    return;
  }

  if (event.key === "Backspace") {
    event.preventDefault();
    if (currentInput.length > 0) {
      currentInput = currentInput.slice(0, -1);
      renderInput();
    }
    return;
  }

  if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault();
    currentInput += event.key;
    renderInput();
  }
});

const moveMobileInputToPoint = (point) => {
  if (!point) return;
  mobileInput.style.left = `${Math.max(0, Math.floor(point.clientX))}px`;
  mobileInput.style.top = `${Math.max(0, Math.floor(point.clientY))}px`;
};

const focusMobileInput = (event) => {
  if (event?.touches && event.touches[0]) {
    moveMobileInputToPoint(event.touches[0]);
  } else if (event?.clientX != null && event?.clientY != null) {
    moveMobileInputToPoint(event);
  }
  syncMobileInput();
  mobileInput.focus();
  mobileInput.click();
};

terminal.setAttribute("tabindex", "0");

terminal.addEventListener("pointerdown", focusMobileInput);
terminal.addEventListener("touchstart", focusMobileInput);
terminal.addEventListener("click", focusMobileInput);

mobileInput.addEventListener("input", () => {
  currentInput = mobileInput.value;
  renderInput();
});

mobileInput.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    const command = currentInput;
    finalizeCurrentLine();
    const { output, asHtml } = await runCommand(command);
    appendOutput(output, asHtml);
    appendPrompt();
    mobileInput.value = "";
  }
});

// Ensure the initial prompt has an input span for typing.
const bootstrapInput = () => {
  const cursor = terminal.querySelector(".terminal-cursor");
  if (cursor && !getCurrentInputSpan()) {
    cursor.insertAdjacentHTML("beforebegin", `<span class="terminal-input"></span>`);
  }
};

bootstrapInput();
