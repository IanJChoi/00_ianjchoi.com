const terminal = document.getElementById("terminal");
const promptText = "ian@ianjchoi.com ~ % ";
let currentInput = "";
const welcomeOutput = [
  "",
  "+-----------------------------------------------------------------------+",
  "|                          Welcome to my site!                          |",
  "|       I’m Ian. This is my personal website styled like a terminal.    |",
  "+-----------------------------------------------------------------------+",
  ""
].join("\n");
const lsOutputHtml = [
  "total 283",
  'drw-r--r-- ian staff 3887 Jan 24 00:23 <a class="terminal-link about-link" href="about/">about</a>',
  'drwxr--r-- ian staff 3887 Jan 24 00:23 <a class="terminal-link about-link" href="thought_process/">thought_process</a>',
  'drw-r--r-- ian staff 3887 Jan 24 00:23 <a class="terminal-link about-link" href="blog/">blog</a>',
  "-rw-r--r-- ian staff  512 Jan 24 00:23 welcome.txt"
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

const runCommand = (command) => {
  const normalized = command.trim();
  if (normalized === "cat welcome.txt") {
    return { output: welcomeOutput, asHtml: false };
  }
  if (normalized === "ls -l") {
    return { output: lsOutputHtml, asHtml: true };
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

const appendPrompt = () => {
  const existingCursor = terminal.querySelector(".terminal-cursor");
  if (existingCursor) {
    existingCursor.remove();
  }

  trimTrailingWhitespaceNodes();

  terminal.insertAdjacentHTML(
    "beforeend",
    `\n${promptText}<span class="terminal-input"></span><span class="terminal-cursor">█</span>`
  );
  terminal.scrollTop = terminal.scrollHeight;
  // Keep the page view pinned to the bottom as new lines are added.
  requestAnimationFrame(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
};

document.addEventListener("keydown", (event) => {
  if (isEditableTarget(event.target)) {
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    const command = currentInput;
    finalizeCurrentLine();
    const { output, asHtml } = runCommand(command);
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

// Ensure the initial prompt has an input span for typing.
const bootstrapInput = () => {
  const cursor = terminal.querySelector(".terminal-cursor");
  if (cursor && !getCurrentInputSpan()) {
    cursor.insertAdjacentHTML("beforebegin", `<span class="terminal-input"></span>`);
  }
};

bootstrapInput();
