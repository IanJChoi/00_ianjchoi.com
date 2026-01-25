const terminal = document.getElementById("terminal");
const promptUser = "ian@ianjchoi.com";
let currentDir = "~";
let currentInput = "";
const welcomeOutput = [
  "",
  "+-----------------------------------------------------------------------+",
  "|                          Welcome to my site!                          |",
  "|      I’m Ian. This is my personal website styled like a terminal.     |",
  "|        Feel free to explore. Hint: try cd, ls -l, cat command!        |",
  "+-----------------------------------------------------------------------+",
  ""
].join("\n");
const aboutOutput = [
  "",
  "+-----------------------------------------------------------------------+",
  "|                               About Me                                |",
  "+-----------------------------------------------------------------------+",
  "",
  "Hi, I’m Ian J. Choi.",
  "I’m a senior at Columbia University majoring in Computer Science with a minor in Mathematics.",
  "",
  "I built FYBCL (For Your Better College Life) — an app that helps students quickly check dining hall menus, library hours, campus events, etc, so they can spend less time clicking around and avoid walking all the way to the dining hall or library just to realize it’s closed.",
  "",
  "Technically, I’m deeply interested in low-level computing such as operating systems and system programming. I enjoy understanding how things actually work under the hood — memory, processes, I/O, latency — and I’m actively studying and building projects in this space.",
  "",
  "Before computers, there was swimming.",
  "I’ve been swimming since I was 4, competed as a member of the South Korean national team, and later swam for a Division I team in college. These days, swimming is more of a passion than a profession, and I spend most of my training time on CrossFit and HYROX — still chasing performance, just in different arenas.",
  "",
  "I like building things, pushing limits, and staying curious — whether that’s in code, systems, or sport.",
  "+-----------------------------------------------------------------------+",
  "",
].join("\n");
const contactOutput = [
  "",
  "+-----------------------------------------------------------------------+",
  "|                               Contact Me                              |",
  "+-----------------------------------------------------------------------+",
  "",
  "Email: ic2561@columbia.edu",
  "LinkedIn: linkedin.com/in/ianjchoi/",
  "GitHub: github.com/ianjchoi-ai",
  "+-----------------------------------------------------------------------+",
  "",
].join("\n");
const lsOutput_home = [
  "total 283",
  'drw-r--r-- ian staff 3887 Jan 24 00:23 about',
  'drwxr--r-- ian staff 3887 Jan 24 00:23 thought_process',
  'drw-r--r-- ian staff 3887 Jan 24 00:23 blog',
  "-rw-r--r-- ian staff  512 Jan 24 00:23 welcome.txt"
].join("\n");
const lsOutput_about = [
  "total 283",
  '-rw-r--r-- ian staff 3887 Jan 24 00:23 about.txt',
  '-rw-r--r-- ian staff 3887 Jan 24 00:23 contact.txt'
].join("\n");
const lsOutput_thought_process = [
  "total 283",
  'drw-r--r-- ian staff 3887 Jan 24 00:23 about',
  'drw-r--r-- ian staff 3887 Jan 24 00:23 blog',
  "-rw-r--r-- ian staff  512 Jan 24 00:23 welcome.txt"
].join("\n");
const lsOutput_blog = [
  "total 0"
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

  if (normalized === "cd ~" || normalized === "cd") {
    currentDir = "~";
    return { output: "", asHtml: false };
  }
  if (normalized === "cd .") {
    return { output: "", asHtml: false };
  }

  if (currentDir === "~") {
    if (normalized === "cat welcome.txt") {
      return { output: welcomeOutput, asHtml: false };
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
      if (normalized === "cd thought_process" || normalized === "cd thought_process/") {
        currentDir = "thought_process";
        return { output: "", asHtml: false };
      }
      if (normalized === "cd blog" || normalized === "cd blog/") {
        currentDir = "blog";
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
      return { output: aboutOutput, asHtml: false };
    }
    if (normalized === "cat contact.txt") {
      return { output: contactOutput, asHtml: false };
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
  if (currentDir === "thought_process") {
    if (normalized === "ls -l") {
      return { output: lsOutput_thought_process, asHtml: false };
    }
    if (normalized.startsWith("cd ")) {
      if (normalized === "cd ..") {
        currentDir = "~";
        return { output: "", asHtml: false };
      }
      return { output: `cd: no such file or directory: ${normalized.slice(3)}`, asHtml: false };
    }
  }
  if (currentDir === "blog") {
    if (normalized === "ls -l") {
      return { output: lsOutput_blog, asHtml: false };
    }
    if (normalized.startsWith("cd ")) {
      if (normalized === "cd ..") {
        currentDir = "~";
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
