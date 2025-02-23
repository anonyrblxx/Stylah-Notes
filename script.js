// ======= DATA INITIALIZATION =======
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let activeNoteId;

// Create a default note if none exist
if (notes.length === 0) {
  const defaultNote = { id: 1, title: "Note", content: "", editing: false };
  notes.push(defaultNote);
  activeNoteId = defaultNote.id;
  saveNotes();
} else {
  activeNoteId = notes[0].id;
}

// ======= UTILITY FUNCTIONS =======
function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function getActiveNote() {
  return notes.find(note => note.id === activeNoteId);
}

// ======= TABS & NOTES MANAGEMENT =======
const tabsContainer = document.getElementById("tabs-container");
const textarea = document.getElementById("note-content");
const lineNumbers = document.getElementById("line-numbers");

function renderTabs() {
  tabsContainer.innerHTML = "";
  
  notes.forEach(note => {
    const tabButton = document.createElement("button");
    tabButton.classList.add("tab");
    if (note.id === activeNoteId) {
      tabButton.classList.add("active");
    }
    if (note.justCreated) {
      tabButton.classList.add("new-tab");
      // Remove the flag after animation completes
      setTimeout(() => { note.justCreated = false; }, 300);
    }
    
    // Create container to ensure the close button is always at the end
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("tab-content");
    
    // Title span with renaming (double-click to edit)
    const titleSpan = document.createElement("span");
    titleSpan.classList.add("title");
    if (note.editing) {
      const input = document.createElement("input");
      input.type = "text";
      input.value = note.title;
      input.classList.add("rename-input");
      input.addEventListener("blur", () => finishRenaming(note.id, input.value));
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") input.blur();
        if (e.key === " ") e.stopPropagation(); // Prevent spacebar from ending renaming
      });
      titleSpan.appendChild(input);
      setTimeout(() => input.focus(), 0);
    } else {
      titleSpan.textContent = note.title;
      titleSpan.addEventListener("dblclick", () => startRenaming(note.id));
    }
    contentDiv.appendChild(titleSpan);
    
    // Delete (close) button at the end
    const closeBtn = document.createElement("button");
    closeBtn.classList.add("close-btn");
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      tabButton.classList.add("tab-deleting");
      setTimeout(() => deleteNote(note.id), 300); // Wait for animation to complete
    });
    contentDiv.appendChild(closeBtn);
    
    tabButton.appendChild(contentDiv);
    tabButton.addEventListener("click", () => switchNote(note.id));
    tabsContainer.appendChild(tabButton);
  });
  
  // Append plus-tab for creating a new note
  const plusTab = document.createElement("button");
  plusTab.classList.add("tab", "plus-tab");
  plusTab.textContent = "+";
  plusTab.addEventListener("click", addNote);
  tabsContainer.appendChild(plusTab);
}

function switchNote(id) {
  activeNoteId = id;
  const note = getActiveNote();
  textarea.value = note.content;
  updateLineNumbers();
  renderTabs();
}

function addNote() {
  const newId = notes.length ? Math.max(...notes.map(n => n.id)) + 1 : 1;
  const newNote = { id: newId, title: "Note", content: "", editing: false, justCreated: true };
  notes.push(newNote);
  activeNoteId = newId;
  saveNotes();
  renderTabs();
  switchNote(newId);
}

function deleteNote(noteId) {
  notes = notes.filter(note => note.id !== noteId);
  if (notes.length === 0) {
    const defaultNote = { id: 1, title: "Note", content: "", editing: false };
    notes.push(defaultNote);
    activeNoteId = defaultNote.id;
  } else if (activeNoteId === noteId) {
    activeNoteId = notes[0].id;
  }
  saveNotes();
  renderTabs();
  switchNote(activeNoteId);
}

function startRenaming(noteId) {
  notes = notes.map(note =>
    note.id === noteId ? { ...note, editing: true } : note
  );
  renderTabs();
  const input = document.querySelector(".rename-input");
  if (input) {
    input.focus();
    input.select();
  }
}

function finishRenaming(noteId, newTitle) {
  notes = notes.map(note =>
    note.id === noteId
      ? { ...note, title: newTitle.trim() === "" ? "Untitled" : newTitle, editing: false }
      : note
  );
  saveNotes();
  renderTabs();
}

// ======= CODE EDITOR & LINE NUMBERS =======
function updateLineNumbers() {
  const lines = textarea.value.split("\n").length || 1;
  let lineNumberHtml = "";
  for (let i = 1; i <= lines; i++) {
    lineNumberHtml += i + "<br>";
  }
  lineNumbers.innerHTML = lineNumberHtml;
}

textarea.addEventListener("scroll", () => {
  lineNumbers.scrollTop = textarea.scrollTop;
});

textarea.addEventListener("input", () => {
  const note = getActiveNote();
  note.content = textarea.value;
  saveNotes();
  updateLineNumbers();
});

// Add event listener for keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "r") {
    e.preventDefault();
    startRenaming(activeNoteId);
  } else if (e.ctrlKey && e.key === "d") {
    e.preventDefault();
    deleteNoteShortcut();
  } else if (e.ctrlKey && e.key === "e") {
    e.preventDefault();
    addNote();
  }
});

function deleteNoteShortcut() {
  const note = getActiveNote();
  if (note) {
    const tabButton = document.querySelector(`.tab.active`);
    if (tabButton) {
      tabButton.classList.add("tab-deleting");
      setTimeout(() => deleteNote(note.id), 300); // Wait for animation to complete
    }
  }
}

// ======= INITIAL RENDER =======
renderTabs();
switchNote(activeNoteId);
updateLineNumbers();
