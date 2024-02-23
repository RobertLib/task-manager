class TaskItem extends HTMLElement {
  constructor() {
    super();

    this.isEditing = false;
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
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        this.completed = data.completed;
        this.render();
      })
      .catch((error) => console.error(error));
  }

  editTask() {
    this.isEditing = true;
    this.render();
  }

  saveTask(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const name = formData.get("name");

    fetch(form.action, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    })
      .then((response) => response.json())
      .then((data) => {
        this.name = data.name;
        this.isEditing = false;

        this.render();
      })
      .catch((error) => console.error(error));
  }

  deleteTask() {
    if (!confirm("Are you sure you want to delete the task?")) {
      return;
    }

    fetch(`/${this.taskId}/delete`, {
      method: "POST",
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
        style="align-items: center; display: flex; gap: 0.75rem"
      >
        <button
          class="btn"
          onclick="document.getElementById('${this.id}').toggleTask()"
          style="display: flex; padding: 0.25rem"
          title="Toggle ${this.completed ? "incomplete" : "complete"}"
          type="button"
        >
          <img alt="check" src="/icons/${
            this.completed ? "check-" : ""
          }circle.svg" style="height: 1.25rem; width: 1.25rem" />
        </button>

        <form
          action="/${this.taskId}"
          id="name-change-form-${this.taskId}"
          onsubmit="document.getElementById('${this.id}').saveTask(event)"
          style="flex: 1"
        >
          <input
            class="form-control"
            name="name"
            ${this.isEditing ? "" : "readonly"}
            style="width: 100%"
            value="${this.name}"
          />
        </form>

        <button
          class="btn btn-primary btn-sm"
          form="name-change-form-${this.taskId}"
          style="display: ${this.isEditing ? "block" : "none"}"
          type="submit"
        >
          Save
        </button>

        <button
          class="btn btn-warning btn-sm"
          onclick="document.getElementById('${this.id}').editTask()"
          style="display: ${
            this.isEditing ? "none" : "block"
          }; text-decoration: none"
          type="button"
        >
          Edit
        </button>

        <button
          class="btn btn-danger btn-sm"
          onclick="document.getElementById('${this.id}').deleteTask()"
          type="submit"
        >
          Delete
        </button>
      </li>
    `;
  }
}

customElements.define("task-item", TaskItem);
