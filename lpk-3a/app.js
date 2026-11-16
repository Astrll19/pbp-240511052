"use strict";

const STORAGE_KEY = "todos";
let storageMessage = "";
let todos = loadTodos();

const form = document.querySelector("#form-todo");
const input = document.querySelector("#input-todo");
const list = document.querySelector("#list-todo");
const stats = document.querySelector("#stats");
const emptyState = document.querySelector("#empty-state");

function loadTodos() {
  try {
    const savedTodos = localStorage.getItem(STORAGE_KEY);
    if (!savedTodos) return [];

    const parsedTodos = JSON.parse(savedTodos);
    if (!Array.isArray(parsedTodos)) {
      throw new TypeError("Data tugas harus berupa daftar.");
    }

    return parsedTodos.filter((todo) =>
      todo &&
      typeof todo.id === "string" &&
      typeof todo.teks === "string" &&
      typeof todo.selesai === "boolean"
    );
  } catch (error) {
    console.error("Data To-Do List di localStorage tidak dapat dibaca.", error);
    storageMessage = "Data tersimpan tidak dapat dibaca";
    return [];
  }
}

function simpan() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    storageMessage = "";
  } catch (error) {
    console.error("To-Do List gagal disimpan ke localStorage.", error);
    storageMessage = "Gagal menyimpan tugas di perangkat ini";
  }
}

let idCounter = 0;

function buatId() {
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
    if (typeof crypto.getRandomValues === "function") {
      const values = crypto.getRandomValues(new Uint32Array(4));
      return Array.from(values, (value) => value.toString(16).padStart(8, "0")).join("");
    }
  }

  idCounter += 1;
  return `${Date.now()}-${idCounter}`;
}

function render() {
  list.replaceChildren();

  todos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = "todo-item";
    if (todo.selesai) item.classList.add("selesai");

    const checkbox = document.createElement("input");
    checkbox.className = "todo-check";
    checkbox.type = "checkbox";
    checkbox.checked = todo.selesai;
    checkbox.dataset.id = todo.id;
    checkbox.setAttribute("aria-label", `Tandai "${todo.teks}" sebagai selesai`);

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.teks;

    const deleteButton = document.createElement("button");
    deleteButton.className = "hapus";
    deleteButton.type = "button";
    deleteButton.dataset.id = todo.id;
    deleteButton.textContent = "Hapus";
    deleteButton.setAttribute("aria-label", `Hapus tugas "${todo.teks}"`);

    item.append(checkbox, text, deleteButton);
    list.appendChild(item);
  });

  const unfinishedCount = todos.filter((todo) => !todo.selesai).length;
  stats.textContent = storageMessage
    ? `${unfinishedCount} tugas belum selesai · ${storageMessage}`
    : `${unfinishedCount} tugas belum selesai`;
  emptyState.hidden = todos.length > 0;
}

function tambahTodo(teks) {
  todos.push({
    id: buatId(),
    teks: teks.trim(),
    selesai: false
  });
  simpan();
  render();
}

function hapusTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  simpan();
  render();
}

function toggleSelesai(id) {
  const todo = todos.find((item) => item.id === id);
  if (!todo) return;

  todo.selesai = !todo.selesai;
  simpan();
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const teks = input.value.trim();
  if (!teks) {
    input.focus();
    return;
  }

  tambahTodo(teks);
  input.value = "";
  input.focus();
});

list.addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLInputElement) || !event.target.matches(".todo-check")) return;
  toggleSelesai(event.target.dataset.id);
});

list.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLButtonElement) || !event.target.matches(".hapus")) return;
  hapusTodo(event.target.dataset.id);
});

render();
