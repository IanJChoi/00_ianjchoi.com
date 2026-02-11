const terminal = document.getElementById("terminal");
const promptUser = "ian@ianjchoi.com";
let currentDir = "~";
let currentInput = "";
// Cache text file contents to avoid repeated fetches.
const textCache = new Map();

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

const dirEntries = {
  "~": ["about/", "blog/", "projects/", "welcome.txt"],
  about: ["about.txt", "contact.txt", "cv.txt"],
  blog: ["HowDoesCdWork/"],
  projects: ["01_allocator_sim.txt"],
  HowDoesCdWork: ["00_ReadMe.txt", "01_structure.txt"]
};

const welcomePath = "/outputs/welcome.txt";
const aboutPath = "/outputs/about/about.txt";
const contactPath = "/outputs/about/contact.txt";
const cvPath = "/outputs/about/cv.txt";

const HDCDW_00 = "/outputs/blog/HowDoesCdWork/00_ReadMe.txt";
const HDCDW_01 = "/outputs/blog/HowDoesCdWork/01_structure.txt";

const PRO_01 = "/outputs/projects/01_allocator_sim.txt";

const getWelcomeOutput = () => loadTextFile(welcomePath);
const getAboutOutput = () => loadTextFile(aboutPath);
const getContactOutput = () => loadTextFile(contactPath);
const getCVOutput = () => loadTextFile(cvPath);

const getHDCDWOutput_00 = () => loadTextFile(HDCDW_00);
const getHDCDWOutput_01 = () => loadTextFile(HDCDW_01);

const getPROOutput_01 = () => loadTextFile(PRO_01);

const lsOutput_home = [
'total 24',
'drwxr-xr-x@ 7 ian  staff   224 Feb  2 21:34 ./',
'drwxr-xr-x@ 9 ian  staff   288 Jan 27 14:55 ../',
'drwxr-xr-x  5 ian  staff   160 Feb 11 09:06 about/',
'drwxr-xr-x@ 4 ian  staff   128 Feb  2 21:36 blog/',
'drwxr-xr-x@ 3 ian  staff    96 Feb  3 00:28 projects/',
'-rw-r--r--@ 1 ian  staff   423 Feb 11 09:05 welcome.txt'
].join("\n");
const lsOutput_about = [
'total 24',
'drwxr-xr-x  5 ian  staff   160 Feb 11 09:06 ./',
'drwxr-xr-x@ 7 ian  staff   224 Feb  2 21:34 ../',
'-rw-r--r--@ 1 ian  staff  1482 Jan 31 15:11 about.txt',
'-rw-r--r--@ 1 ian  staff   432 Jan 31 15:11 contact.txt',
'-rw-r--r--@ 1 ian  staff  2875 Feb 11 09:06 cv.txt'
].join("\n");
const lsOutput_blog = [
'total 16',
'drwxr-xr-x@ 4 ian  staff   128 Feb  2 21:36 ./',
'drwxr-xr-x@ 7 ian  staff   224 Feb  2 21:34 ../',
'drwxr-xr-x@ 4 ian  staff   128 Jan 27 15:10 HowDoesCdWork/'
].join("\n");
const lsOutput_projects = [
'total 16',
'drwxr-xr-x@ 3 ian  staff    96 Feb  3 00:28 ./',
'drwxr-xr-x@ 7 ian  staff   224 Feb  2 21:34 ../',
'-rw-r--r--@ 1 ian  staff  4162 Feb  5 09:44 01_allocator_sim.txt'
].join("\n");

const lsOutput_HDCDW = [
'total 24',
'drwxr-xr-x@ 4 ian  staff   128 Jan 27 15:10 ./',
'drwxr-xr-x@ 4 ian  staff   128 Feb  2 21:36 ../',
'-rw-r--r--@ 1 ian  staff  1450 Jan 28 00:07 00_ReadMe.txt',
'-rw-r--r--@ 1 ian  staff  7142 Jan 31 15:11 01_structure.txt'
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

const getAutocompleteMatches = (input) => {
  const trimmed = input.replace(/\s+$/, "");
  const lastSpaceIndex = trimmed.lastIndexOf(" ");
  if (lastSpaceIndex === -1) return [];
  const token = trimmed.slice(lastSpaceIndex + 1);
  const entries = dirEntries[currentDir] || [];
  return entries.filter((entry) => entry.startsWith(token));
};

const getCommonPrefix = (values) => {
  if (!values.length) return "";
  let prefix = values[0];
  for (let i = 1; i < values.length; i += 1) {
    const value = values[i];
    let j = 0;
    while (j < prefix.length && j < value.length && prefix[j] === value[j]) {
      j += 1;
    }
    prefix = prefix.slice(0, j);
    if (!prefix) break;
  }
  return prefix;
};

const handleAutocomplete = () => {
  const trimmed = currentInput.replace(/\s+$/, "");
  const lastSpaceIndex = trimmed.lastIndexOf(" ");
  if (lastSpaceIndex === -1) {
    return;
  }
  const base = trimmed.slice(0, lastSpaceIndex + 1);
  const token = trimmed.slice(lastSpaceIndex + 1);
  const matches = getAutocompleteMatches(currentInput);
  if (!matches.length) return;
  if (matches.length === 1) {
    currentInput = `${base}${matches[0]}`;
    renderInput();
    syncMobileInput();
    return;
  }
  const commonPrefix = getCommonPrefix(matches);
  if (commonPrefix.length > token.length) {
    currentInput = `${base}${commonPrefix}`;
    renderInput();
    syncMobileInput();
    return;
  }
  appendOutput(matches.join("  "));
  appendPrompt();
  currentInput = `${base}${token}`;
  renderInput();
  syncMobileInput();
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
    if (normalized === "ll") {
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
      if (normalized === "cd blog" || normalized === "cd blog/") {
        currentDir = "blog";
        return { output: "", asHtml: false };
      }
      if (normalized === "cd projects" || normalized === "cd projects/") {
        currentDir = "projects";
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
    if (normalized === "cat cv.txt") {
      return { output: await getCVOutput(), asHtml: false };
    }
    if (normalized === "ll") {
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


  if (currentDir === "blog") {
    if (normalized === "ll") {
      return { output: lsOutput_blog, asHtml: false };
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


  if (currentDir === "projects") {
    if (normalized === "ll") {
      return { output: lsOutput_projects, asHtml: false };
    }
    if (normalized === "cat 01_allocator_sim.txt") {
      return { output: await getPROOutput_01(), asHtml: false };
    }
    if (normalized.startsWith("cd ")) {
      if (normalized === "cd ..") {
        currentDir = "~";
        return { output: "", asHtml: false };
      }
      return { output: `cd: no such file or directory: ${normalized.slice(3)}`, asHtml: false };
    }
  }


  if (currentDir === "HowDoesCdWork") {
    if (normalized === "ll") {
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
  const input = document.createElement("div");
  input.setAttribute("aria-label", "Terminal input");
  input.setAttribute("role", "textbox");
  input.setAttribute("aria-multiline", "false");
  input.contentEditable = "true";
  input.autocapitalize = "none";
  input.autocorrect = "off";
  input.spellcheck = false;
  input.inputMode = "text";
  input.setAttribute("autocomplete", "off");
  input.setAttribute("autofill", "off");
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
  mobileInput.textContent = currentInput;
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

  if (event.key === "Tab") {
    event.preventDefault();
    handleAutocomplete();
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
}, true);

const moveMobileInputToPoint = (point) => {
  if (!point) return;
  mobileInput.style.left = `${Math.max(0, Math.floor(point.clientX))}px`;
  mobileInput.style.top = `${Math.max(0, Math.floor(point.clientY))}px`;
};

const isTouchInteraction = (event) =>
  (event?.touches && event.touches.length > 0) || event?.pointerType === "touch";

const focusMobileInput = (event) => {
  terminal.focus({ preventScroll: true });
  if (!isTouchInteraction(event)) {
    return;
  }
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

document.body.addEventListener("pointerdown", focusMobileInput);
document.body.addEventListener("touchstart", focusMobileInput);
document.body.addEventListener("click", focusMobileInput);

mobileInput.addEventListener("input", () => {
  currentInput = mobileInput.textContent || "";
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
    mobileInput.textContent = "";
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
