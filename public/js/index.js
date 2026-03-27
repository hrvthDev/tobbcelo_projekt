function createNews() {

  const Contentform = document.getElementById("content-form");

  Contentform.addEventListener("submit", async function (e) {

    e.preventDefault();

    const formData = { title: document.getElementById("title").value, content: document.getElementById("content").value };

    try {

      const reponse = await fetch("/api/news/create", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const data = await reponse.json();

      console.log("Sikeresen létrehoztad a bejegyzést!", data.title)

    }

    catch (err) {
      console.error("Szerver hiba történt", err)
    }

  })



}


async function loadNews() {
  try {
    const res = await fetch("/api/news");
    const data = await res.json();

    const container = document.getElementById("newsContainer");
    container.innerHTML = "";

    if (data.length === 0) {
      container.innerHTML = `<h1>Jelenleg nincs aktuális hír!</h1>`
    }

    data.forEach(item => {

      const isIndex = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";

      container.innerHTML += `
        <div class="news-card">
          <div class="news-card-body">
            <span class="news-tag">${item.tag || ""}</span>
            <h1>${item.title}</h1>
            <p class="messages">${item.content}</p>
            <div class="news-card-footer">
              <span class="news-date">${item.created_at}</span>
            </div>
            ${!isIndex ? `
              <div style="margin-top:10px;">
                <button onclick="openDeleteModal(${item.id})" class="modal-btn">Törlés</button>
                <button onclick='openEditModal(${item.id}, ${JSON.stringify(item.title)}, ${JSON.stringify(item.content)})' class="modal-btn">Szerkesztés</button>
              </div>
            ` : ""}
          </div>
        </div>
      `;
    });

  } catch (err) {
    console.error("Hírek hiba:", err);
  }
}



function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

function openDeleteModal(id) {
  selectedNewsId = id;
  document.getElementById("deleteModal").classList.remove("hidden");
}

async function confirmDelete() {
  try {
    const res = await fetch(`/api/news/${selectedNewsId}`, { method: "DELETE" });
    if (res.ok) {
      closeModal("deleteModal");
      loadNews();
    }
  } catch (err) {
    console.error("Törlés hiba:", err);
  }
}

function openEditModal(id, title, content) {
  selectedNewsId = id;

  const inputTitle = document.getElementById("title");
  const inputContent = document.getElementById("content");
  const modal = document.getElementById("editModal");

  if (!inputTitle || !inputContent || !modal) {
    console.error("Modal elemek nem találhatók a DOM-ban!");
    return;
  }

  inputTitle.value = title;
  inputContent.value = content;
  modal.classList.remove("hidden");
}

function openDeleteModal(id) {
  selectedNewsId = id;
  const modal = document.getElementById("deleteModal");

  if (!modal) {
    console.error("Delete modal nem található a DOM-ban!");
    return;
  }

  modal.classList.remove("hidden");
}

async function confirmEdit() {
  const title = document.getElementById("editTitle").value;
  const content = document.getElementById("editContent").value;

  try {
    const res = await fetch(`/api/news/${selectedNewsId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content })
    });

    if (res.ok) {
      closeModal("editModal");
      loadNews();
    }
  } catch (err) {
    console.error("Szerkesztés hiba:", err);
  }
}





async function loadEvents() {
  try {
    const res = await fetch("/api/events");
    const data = await res.json();

    const container = document.getElementById("eventsContainer");
    container.innerHTML = "";

    data.forEach(event => {
      const date = new Date(event.event_date);

      const day = date.getDate();
      const month = date.toLocaleString("hu-HU", { month: "short" });

      container.innerHTML += `
        <div class="event-item">
          <div class="event-date-box ev-terra">
            <span class="month">${month}</span>
            <span class="day">${day}</span>
          </div>
          <div class="event-info">
            <h4>${event.title}</h4>
            <p>${event.description}</p>
            <div class="event-meta">
              <span>${event.event_date}</span>
              <span>${event.location || ""}</span>
            </div>
          </div>
        </div>
      `;
    });

  } catch (err) {
    console.error("Esemény hiba:", err);
  }
}


async function loadStudents() {

  try {

    const response = await fetch("api/students");

    const data = await response.json();


    const container = document.getElementById("studentsContainer");


    data.forEach((d) => {

      container.innerHTML = `
      
      <div class="">
      
      <div class="news-card">

        <h2>Tanuló neve: ${d.name}</h2>

        <span> osztálya: ${d.class}</span>
      
      </div>

      </div>
      
      `

    })


  }

  catch (err) {
    console.error("Szerver hiba történt!")
  }

}

function setupStudentForm() {
  const form = document.getElementById("student-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById("studentName").value,
      className: document.getElementById("studentClass").value
    };

    const res = await fetch("/api/create/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    alert("Diák mentve!");
    form.reset();
  });
}


function setupContactForm() {
  const form = document.getElementById("contact-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      message: document.getElementById("message").value
    };

    if (!data) {
      alert("Kötelező kitölteni az adatoka!");
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      alert(result.message || "Elküldve!");
      form.reset();

    } catch (err) {
      console.error("Form hiba:", err);
      alert("Hiba történt!");
    }
  });
}

async function loadMessages() {

  try {

    const container = document.getElementById("messagesContainer");

    container.innerHTML = "";

    const response = await fetch("api/messages");
    const data = await response.json();

    if (!response.ok) {
      throw new Error("Szerver hiba történt!")
    }

    if (data.length === 0) {
      container.innerHTML = `<h1>Nincs elérhető üzenet!</h1>`
    }


    data.forEach(item => {

      const isIndex = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";

      container.innerHTML += `
        <div class="news-card">
          <div class="news-card-body">
            <h1>${item.name}</h1>
            <p class="messages">${item.message}</p>
            <div class="news-card-footer">
              <span class="news-date">${item.created_at}</span>
            </div>
            ${!isIndex ? `
              <div style="margin-top:10px;">
              <button onclick="openDeleteMessageModal(${item.id})" class="modal-btn">Törlés</button>
               <button onclick='openEditMessageModal(${item.id}, ${JSON.stringify(item.name)}, ${JSON.stringify(item.message)})' class="modal-btn">Szerkesztés</button>
            </div>
            ` : ""}
          </div>
        </div>
      `;
    });


  }

  catch (err) {
    console.error("Szerver hiba történt!")
  }



}


function loginForm() {

  const loginForm = document.getElementById("login-form");

  loginForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const formData = { 
      name: document.getElementById("name").value, 
      email: document.getElementById("email").value, 
      password: document.getElementById("password").value 
    };

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("isLogin", "true");
        localStorage.setItem("username", data.username || data.name);
        window.location.href = "e-naplo.html";
        console.log("Üdvözöllek kedves", data.username || data.name);
      } else {
        alert(data.message || "Hibás bejelentkezés!");
      }

    } catch (err) {
      console.error("Hiba történt a bejelentkezés során!", err);
    }

  });

}


async function confirmDeleteMessage() {
  if (!selectedMessageId) return;

  try {
    const res = await fetch(`/api/messages/${selectedMessageId}`, { method: "DELETE" });
    if (res.ok) {
      closeModal("deleteMessageModal");
      loadMessages();
    }
  } catch (err) {
    console.error("Törlés hiba:", err);
  }
}

function openEditMessageModal(id, name, message) {
  selectedMessageId = id;

  const inputName = document.getElementById("editMessageName");
  const inputMessage = document.getElementById("editMessageContent");
  const modal = document.getElementById("editMessageModal");

  if (!inputName || !inputMessage || !modal) return;

  inputName.value = name;
  inputMessage.value = message;
  modal.classList.remove("hidden");
}



function openDeleteMessageModal(id) {
  selectedMessageId = id;

  const modal = document.getElementById("deleteMessageModal");

  if (!modal) {
    console.error("Delete message modal nem található!");
    return;
  }

  modal.classList.remove("hidden");
}

async function confirmEditMessage() {
  const name = document.getElementById("editMessageName").value;
  const message = document.getElementById("editMessageContent").value;

  if (!selectedMessageId) return;

  try {
    const res = await fetch(`/api/messages/${selectedMessageId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message })
    });

    if (res.ok) {
      closeModal("editMessageModal");
      loadMessages();
    }
  } catch (err) {
    console.error("Szerkesztés hiba:", err);
  }
}



async function uploadFile() {
  const fileInput = document.getElementById("fileInput");
  const result = document.getElementById("uploadResult");
  const fileType = document.getElementById("fileType").value;

  if (!fileInput.files.length) {
    result.innerText = "Válassz ki egy fájlt!";
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);
  formData.append("type", fileType);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      result.innerText = data.message;
      return;
    }

    result.innerHTML = `
       Sikeres feltöltés! <br>
      <a href="${data.filePath}" target="_blank">Megnyitás</a>
    `;

  } catch (err) {
    result.innerText = "Hiba történt!";
  }
}



document.addEventListener("DOMContentLoaded", () => {

  const currentPage = window.location.pathname;

if (currentPage.includes("e-naplo.html")) {
  const isLogin = localStorage.getItem("isLogin");
  if (isLogin !== "true") {
    window.location.href = "login.html";
    return;
  }
}

  if (document.getElementById("newsContainer")) {
    loadNews()
  };

  if (document.getElementById("content-form")) {
    createNews()
  };

  if (document.getElementById("contact-form")) {
    setupContactForm()
  };


  if (document.getElementById("login-form")) {
    loginForm()
  };


  if (document.getElementById("messagesContainer")) {
    loadMessages();
  }


  if (document.getElementById("student-form")) {
    setupStudentForm();
  }

  if (document.getElementById("studentsContainer")) {
    loadStudents();
  }



});