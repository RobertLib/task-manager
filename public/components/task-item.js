"use strict";

class TaskItem extends HTMLElement {
  constructor() {
    super();

    this.panelHeightClosed = "47px";
    this.panelHeightOpen = "106px";
    this.textareaHeightClosed = "31px";
    this.textareaHeightOpen = "90px";
  }

  connectedCallback() {
    this.taskId = this.getAttribute("taskId");
    this.name = this.getAttribute("name");
    this.completed = this.getAttribute("completed") === "true";

    this.id = `task-item-${this.taskId}`;

    this.render();
  }

  toggleTask() {
    fetch(`/${this.taskId}/toggle`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        this.completed = data.completed;

        /** @type {HTMLButtonElement} */
        const toggleButton = this.querySelector(`#toggle-task-${this.taskId}`);

        toggleButton.title = `Toggle ${
          this.completed ? "incomplete" : "complete"
        }`;

        /** @type {NodeListOf<HTMLImageElement>} */
        const toggleButtonImages = toggleButton.querySelectorAll("img");

        toggleButtonImages.forEach((image) => {
          image.style.display =
            image.style.display === "block" ? "none" : "block";
        });
      })
      .catch((error) => console.error(error));
  }

  editTask() {
    /** @type {HTMLDataListElement} */
    const panel = this.querySelector(".panel");
    panel.style.height = this.panelHeightOpen;

    /** @type {HTMLTextAreaElement} */
    const textarea = this.querySelector("textarea");

    textarea.readOnly = false;
    textarea.rows = 4;
    textarea.style.height = this.textareaHeightOpen;
    textarea.style.whiteSpace = "normal";

    /** @type {HTMLButtonElement} */
    const submitButton = this.querySelector("button[type='submit']");
    submitButton.style.display = "block";

    /** @type {HTMLButtonElement} */
    const editButton = this.querySelector("button[id^='edit-task']");
    editButton.style.display = "none";
  }

  closeTask() {
    /** @type {HTMLDataListElement} */
    const panel = this.querySelector(".panel");
    panel.style.height = this.panelHeightClosed;

    /** @type {HTMLTextAreaElement} */
    const textarea = this.querySelector("textarea");

    textarea.readOnly = true;
    textarea.rows = 1;
    textarea.style.height = this.textareaHeightClosed;
    textarea.style.whiteSpace = "nowrap";

    /** @type {HTMLButtonElement} */
    const submitButton = this.querySelector("button[type='submit']");
    submitButton.style.display = "none";

    /** @type {HTMLButtonElement} */
    const editButton = this.querySelector("button[id^='edit-task']");
    editButton.style.display = "block";
  }

  /** @param {Event} event */
  saveTask(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const name = formData.get("name");

    fetch(form.action, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    })
      .then((response) => response.json())
      .then((data) => {
        this.name = data.name;

        this.closeTask();
      })
      .catch((error) => console.error(error));
  }

  deleteTask() {
    if (!confirm("Are you sure you want to delete the task?")) {
      return;
    }

    fetch(`/${this.taskId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then(() => {
        this.remove();
      })
      .catch((error) => console.error(error));
  }

  render() {
    this.innerHTML = `
      <li
        class="panel"
        style="align-items: start; animation: fade-in 0.25s; display: flex; gap: 0.25rem; height: ${
          this.panelHeightClosed
        }; overflow: hidden; transition: height 0.25s ease-in-out"
      >
        <button
          class="btn"
          id="toggle-task-${this.taskId}"
          onclick="document.getElementById('${this.id}').toggleTask()"
          style="display: flex; padding: 0.25rem"
          title="Toggle ${this.completed ? "incomplete" : "complete"}"
          type="button"
        >
          <img
            alt="check"
            class="icon"
            src="/icons/circle.svg"
            style="display: ${
              this.completed ? "none" : "block"
            }; height: 1.25rem; width: 1.25rem"
          />
          <img
            alt="check"
            class="icon"
            src="/icons/check-circle.svg"
            style="display: ${
              this.completed ? "block" : "none"
            }; height: 1.25rem; width: 1.25rem"
          />
        </button>

        <form
          action="/${this.taskId}"
          id="name-change-form-${this.taskId}"
          onsubmit="document.getElementById('${this.id}').saveTask(event)"
          style="flex: 1; padding-right: 0.25rem"
        >
          <textarea
            class="form-control"
            maxlength="255"
            name="name"
            readonly
            rows="1"
            style="display: flex; height: ${
              this.textareaHeightClosed
            }; resize: none; transition: height 0.25s ease-in-out; white-space: nowraps; width: 100%"
          >${this.name}</textarea>
        </form>

        <button
          class="btn btn-primary btn-sm"
          form="name-change-form-${this.taskId}"
          style="display: none; margin-top: 0.2rem; padding-bottom: 0.1rem; padding-top: 0.1rem"
          title="Save"
          type="submit"
        >
          <img
            alt="save"
            class="icon icon-light"
            src="/icons/save.svg"
            style="height: 1.1rem; width: 1.1rem"
          />
        </button>

        <button
          class="btn btn-warning btn-sm"
          id="edit-task-${this.taskId}"
          onclick="document.getElementById('${this.id}').editTask()"
          style="display: block; margin-top: 0.2rem; padding-bottom: 0.1rem; padding-top: 0.1rem"
          title="Edit"
          type="button"
        >
          <img
            alt="edit"
            class="icon icon-dark"
            src="/icons/edit.svg"
            style="height: 1.1rem; width: 1.1rem"
          />
        </button>

        <button
          class="btn btn-danger btn-sm"
          onclick="document.getElementById('${this.id}').deleteTask()"
          style="display: block; margin-top: 0.2rem; padding-bottom: 0.1rem; padding-top: 0.1rem"
          title="Delete"
          type="submit"
        >
          <img
            alt="delete"
            class="icon icon-light"
            src="/icons/delete.svg"
            style="height: 1.1rem; width: 1.1rem"
          />
        </button>
      </li>
    `;
  }
}

customElements.define("task-item", TaskItem);
