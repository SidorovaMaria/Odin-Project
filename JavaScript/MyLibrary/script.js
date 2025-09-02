class Book {
  constructor(title, author, pages, read) {
    this.title = String(title).trim();
    this.author = String(author).trim();
    this.pages = Number(pages);
    this.read = Boolean(read);
    this.id = crypto.randomUUID();
  }
}
const myLibrary = [];
function addBookToLibrary({ title, author, pages, read }) {
  const book = new Book(title, author, pages, read);
  myLibrary.push(book);
  render();
}
function toggleReadStatus(bookId) {
  const book = myLibrary.find((b) => b.id === bookId);
  if (!book) return;
  book.read = !book.read;

  // Update just this row if it exists; otherwise re-render
  const row = document.querySelector(`.book[data-id="${bookId}"]`);
  if (row) {
    const checkbox = row.querySelector(".read-toggle");
    const label = row.querySelector(".read-label");
    const status = row.querySelector(".status");
    if (checkbox) checkbox.checked = book.read;
    if (label) label.textContent = book.read ? "Read" : "Not Read";
    if (status) status.setAttribute("aria-checked", String(book.read));
  } else {
    render();
  }
}
function removeBook(bookId) {
  const idx = myLibrary.findIndex((b) => b.id === bookId);
  if (idx === -1) return;
  myLibrary.splice(idx, 1);

  // Remove from DOM without full re-render
  const row = document.querySelector(`.book[data-id="${bookId}"]`);
  if (row && row.parentNode) row.parentNode.removeChild(row);
}

// Render;
function render() {
  const bookContainer = document.getElementById("book-container");
  if (!bookContainer) return;
  bookContainer.innerHTML = "";

  myLibrary.forEach((book) => {
    const bookElement = document.createElement("article");
    bookElement.classList.add("book");
    bookElement.dataset.id = book.id;
    bookElement.innerHTML = `
     <h3>${book.title}</h3>
     <div class="book-info">
         <p>by ${book.author}</p>
         <p>${book.pages} pages</p>
     </div>
     <div class="book-status">
         <label>
           <input type="checkbox" class="read-toggle" ${
             book.read ? "checked" : ""
           } />
            <span class="status" role="switch" aria-checked="${
              book.read
            }" aria-label="Toggle read status"></span>
         </label>
        <p class="read-label">${book.read ? "Read" : "Not Read"}</p>
     </div>
     <button class="remove-book" type="button" data-id="${
       book.id
     }" aria-label="Delete ${book.title}">
        <img src="./assets/icons/delete.svg" alt="" />
      </button>
    `;
    bookContainer.appendChild(bookElement);
  });
}
const form = document.getElementById("book-form");

function setUpUI() {
  const dialog = document.getElementById("add-book-dialog");
  const openBtn = document.getElementById("add-book-btn");
  const closeBtn = document.getElementById("close-dialog");
  openBtn.addEventListener("click", () => dialog.showModal());
  closeBtn.addEventListener("click", () => dialog.close());
  const form =
    document.getElementById("add-book-form") ||
    document.getElementById("book-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      addBookToLibrary({
        title: fd.get("title") || "",
        author: fd.get("author") || "",
        pages: Number(fd.get("pages")),
        read: fd.get("read") === "on" || fd.get("read") === true,
      });
      form.reset();
      dialog.close();
    });
  }
  const bookContainer = document.getElementById("book-container");
  if (!bookContainer) return;
  bookContainer.addEventListener("change", (e) => {
    const checkbox = e.target.closest(".read-toggle");
    if (!checkbox) return;
    const row = checkbox.closest(".book");
    if (!row) return;
    toggleReadStatus(row.dataset.id);
  });

  // Delete book (handles clicks on the <img> inside the button, too)
  bookContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".remove-book");
    if (!btn) return;
    const bookId = btn.dataset.id;
    removeBook(bookId);
  });
}

addBookToLibrary({
  title: "The Great Gatsby",
  author: "F. Scott Fitzgerald",
  pages: 180,
  read: false,
});
addBookToLibrary({
  title: "To Kill a Mockingbird",
  author: "Harper Lee",
  pages: 281,
  read: true,
});
addBookToLibrary({
  title: "1984",
  author: "George Orwell",
  pages: 328,
  read: false,
});

setUpUI();
render();
