
// ==========================================
// PEOPLEDESK - COMPLETE LOCAL VERSION
// ==========================================

const STORAGE_KEY = "peopledesk_employees";
const SESSION_KEY = "peopledesk_admin_session";

const ADMIN_USERNAME = "Admin";
const ADMIN_PASSWORD = "Adminpass";

let employees = [];
let deletedEmployee = null;
let toastTimer = null;

const $ = selector => document.querySelector(selector);

const starterEmployees = [
  {id:"EMP-1001",name:"Adrian Santos",age:29,address:"San Roque, Angat, Bulacan",gender:"Male",position:"Operations Manager",status:"Active"},
  {id:"EMP-1002",name:"Bianca Reyes",age:26,address:"Poblacion, Baliwag, Bulacan",gender:"Female",position:"Human Resources Officer",status:"Active"},
  {id:"EMP-1003",name:"Carlos Mendoza",age:34,address:"Sta. Cruz, Guiguinto, Bulacan",gender:"Male",position:"Accountant",status:"Active"},
  {id:"EMP-1004",name:"Danica Flores",age:25,address:"San Isidro, Pulilan, Bulacan",gender:"Female",position:"Administrative Assistant",status:"Active"},
  {id:"EMP-1005",name:"Enzo Garcia",age:31,address:"Longos, Malolos, Bulacan",gender:"Male",position:"IT Support Specialist",status:"Active"},
  {id:"EMP-1006",name:"Faith Navarro",age:28,address:"Tibag, Plaridel, Bulacan",gender:"Female",position:"Marketing Officer",status:"Active"},
  {id:"EMP-1007",name:"Gabriel Cruz",age:37,address:"San Miguel, San Rafael, Bulacan",gender:"Male",position:"Sales Supervisor",status:"Active"},
  {id:"EMP-1008",name:"Hannah Bautista",age:24,address:"Tuktukan, Guiguinto, Bulacan",gender:"Female",position:"Customer Service Representative",status:"Active"},
  {id:"EMP-1009",name:"Isaac Ramos",age:30,address:"Bagong Nayon, Angat, Bulacan",gender:"Male",position:"Logistics Coordinator",status:"Active"},
  {id:"EMP-1010",name:"Jasmine Aquino",age:27,address:"San Juan, Balagtas, Bulacan",gender:"Female",position:"Payroll Assistant",status:"Active"},
  {id:"EMP-1011",name:"Kyle Villanueva",age:32,address:"Tikay, Malolos, Bulacan",gender:"Male",position:"Quality Assurance Officer",status:"Active"},
  {id:"EMP-1012",name:"Leah Castillo",age:23,address:"Liciada, Bustos, Bulacan",gender:"Female",position:"Office Clerk",status:"Active"},
  {id:"EMP-1013",name:"Marco Dizon",age:40,address:"Pulong Yantok, Angat, Bulacan",gender:"Male",position:"Department Supervisor",status:"Inactive"},
  {id:"EMP-1014",name:"Nicole Herrera",age:29,address:"San Gabriel, Santa Maria, Bulacan",gender:"Female",position:"Purchasing Officer",status:"Active"},
  {id:"EMP-1015",name:"Oliver Santiago",age:35,address:"Banga, Plaridel, Bulacan",gender:"Male",position:"Warehouse Staff",status:"Active"},
  {id:"EMP-1016",name:"Patricia Lim",age:26,address:"Poblacion, Norzagaray, Bulacan",gender:"Female",position:"Graphic Designer",status:"Inactive"},
  {id:"EMP-1017",name:"Rafael Torres",age:33,address:"San Isidro, Angat, Bulacan",gender:"Male",position:"Facilities Officer",status:"Active"},
  {id:"EMP-1018",name:"Sofia Mercado",age:28,address:"Matimbo, Malolos, Bulacan",gender:"Female",position:"Recruitment Assistant",status:"Active"},
  {id:"EMP-1019",name:"Tristan Perez",age:36,address:"Poblacion, Bustos, Bulacan",gender:"Male",position:"Production Supervisor",status:"Inactive"},
  {id:"EMP-1020",name:"Vanessa Lopez",age:27,address:"San Roque, Baliwag, Bulacan",gender:"Female",position:"Finance Officer",status:"Active"}
];

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
  loadEmployees();
  createLoginScreen();
  createLogoutButton();
  createSortFilter();
  setupEventListeners();
  setupNavigation();

  if ($("#todayDate")) {
    $("#todayDate").textContent = new Intl.DateTimeFormat("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date());
  }

  if (sessionStorage.getItem(SESSION_KEY) === "true") {
    showDashboard();
  } else {
    showLogin();
  }
}

// ==========================================
// STORAGE
// ==========================================

function loadEmployees() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      employees = JSON.parse(saved);
      if (!Array.isArray(employees)) throw new Error("Invalid data");
    } catch (error) {
      console.error(error);
      employees = [...starterEmployees];
      saveEmployees();
    }
  } else {
    employees = [...starterEmployees];
    saveEmployees();
  }

  renderAll();
}

function saveEmployees() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

// ==========================================
// DISPLAY HELPERS
// ==========================================

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function initials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0] || "")
    .join("")
    .toUpperCase();
}

function employeeCell(employee) {
  return `
    <div class="employee-cell">
      <div class="employee-avatar">${escapeHTML(initials(employee.name))}</div>
      <div>
        <div class="employee-name">${escapeHTML(employee.name)}</div>
        <div class="employee-sub">Employee</div>
      </div>
    </div>
  `;
}

function statusBadge(status) {
  const className = status === "Active" ? "status-active" : "status-inactive";
  return `<span class="status-badge ${className}">${escapeHTML(status)}</span>`;
}

// ==========================================
// DASHBOARD
// ==========================================

function renderDashboard() {
  const active = employees.filter(e => e.status === "Active").length;
  const inactive = employees.filter(e => e.status === "Inactive").length;
  const positions = new Set(
    employees.map(e => String(e.position || "").trim().toLowerCase())
  ).size;

  if ($("#totalCount")) $("#totalCount").textContent = employees.length;
  if ($("#activeCount")) $("#activeCount").textContent = active;
  if ($("#inactiveCount")) $("#inactiveCount").textContent = inactive;
  if ($("#positionCount")) $("#positionCount").textContent = positions;

  const recent = [...employees].slice(-5).reverse();

  if ($("#recentTableBody")) {
    $("#recentTableBody").innerHTML = recent.length
      ? recent.map(employee => `
          <tr>
            <td>${employeeCell(employee)}</td>
            <td class="id-text">${escapeHTML(employee.id)}</td>
            <td>${escapeHTML(employee.position)}</td>
            <td>${escapeHTML(employee.gender)}</td>
            <td>${statusBadge(employee.status)}</td>
          </tr>
        `).join("")
      : `<tr><td colspan="5" class="empty-state">No employee records yet.</td></tr>`;
  }
}

// ==========================================
// EMPLOYEE RECORDS
// ==========================================

function renderEmployees() {
  if (!$("#employeeTableBody")) return;

  const query = $("#searchInput")?.value.trim().toLowerCase() || "";
  const status = $("#statusFilter")?.value || "All";
  const sortOrder = $("#sortFilter")?.value || "name-asc";

  const filtered = employees.filter(employee => {
    const matchesQuery = [
      employee.name, employee.id, employee.position, employee.address
    ].some(value => String(value ?? "").toLowerCase().includes(query));

    const matchesStatus = status === "All" || employee.status === status;
    return matchesQuery && matchesStatus;
  });

  filtered.sort((a, b) => {
    const comparison = a.name.localeCompare(b.name, undefined, {
      sensitivity: "base"
    });
    return sortOrder === "name-desc" ? -comparison : comparison;
  });

  $("#employeeTableBody").innerHTML = filtered.length
    ? filtered.map(employee => `
        <tr>
          <td>${employeeCell(employee)}</td>
          <td class="id-text">${escapeHTML(employee.id)}</td>
          <td>${escapeHTML(employee.age)}</td>
          <td>${escapeHTML(employee.address)}</td>
          <td>${escapeHTML(employee.gender)}</td>
          <td>${escapeHTML(employee.position)}</td>
          <td>${statusBadge(employee.status)}</td>
          <td class="action-cell">
            <div class="row-actions">
              <button class="icon-btn" title="Edit employee"
                data-action="edit" data-id="${escapeHTML(employee.id)}">✎</button>
              <button class="icon-btn delete" title="Delete employee"
                data-action="delete" data-id="${escapeHTML(employee.id)}">×</button>
            </div>
          </td>
        </tr>
      `).join("")
    : `<tr><td colspan="8" class="empty-state">No matching employee records found.</td></tr>`;

  if ($("#recordsCount")) $("#recordsCount").textContent = filtered.length;
  if ($("#showingText")) {
    $("#showingText").textContent =
      `Showing ${filtered.length} of ${employees.length} employees`;
  }
}

function renderAll() {
  renderDashboard();
  renderEmployees();
}

// ==========================================
// TOAST
// ==========================================

function showToast(message, showUndo = false) {
  if (!$("#toast")) return;

  const toast = $("#toast");
  clearTimeout(toastTimer);

  toast.innerHTML = `
    <span>${escapeHTML(message)}</span>
    ${showUndo ? '<button type="button" id="undoDeleteBtn">UNDO</button>' : ""}
  `;

  toast.classList.add("show");

  if (showUndo) {
    $("#undoDeleteBtn").addEventListener("click", undoDelete);
  }

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    deletedEmployee = null;
  }, showUndo ? 7000 : 2600);
}

// ==========================================
// ADD / EDIT MODAL
// ==========================================

function openModal(employee = null) {
  if (!$("#employeeForm")) return;

  $("#employeeForm").reset();
  $("#editingId").value = employee ? employee.id : "";

  $("#modalTitle").textContent = employee ? "Edit Employee" : "Add New Employee";
  $("#saveBtn").textContent = employee ? "Save Changes" : "Save Employee";

  if (employee) {
    $("#fullName").value = employee.name;
    $("#age").value = employee.age;
    $("#gender").value = employee.gender;
    $("#address").value = employee.address;
    $("#position").value = employee.position;
    $("#status").value = employee.status;
  } else {
    $("#status").value = "Active";
  }

  $("#employeeModal").classList.add("show");
  $("#employeeModal").setAttribute("aria-hidden", "false");
}

function closeModal() {
  if (!$("#employeeModal")) return;
  $("#employeeModal").classList.remove("show");
  $("#employeeModal").setAttribute("aria-hidden", "true");
  $("#employeeForm").reset();
}

function makeEmployeeId() {
  const numbers = employees
    .map(e => Number(String(e.id).replace(/\D/g, "")))
    .filter(Number.isFinite);

  return `EMP-${Math.max(1000, ...numbers) + 1}`;
}

function handleFormSubmit(event) {
  event.preventDefault();

  const saveButton = $("#saveBtn");
  saveButton.disabled = true;

  const editingId = $("#editingId").value;

  const employeeData = {
    name: $("#fullName").value.trim(),
    age: Number($("#age").value),
    gender: $("#gender").value,
    address: $("#address").value.trim(),
    position: $("#position").value.trim(),
    status: $("#status").value
  };

  if (
    !employeeData.name ||
    !employeeData.address ||
    !employeeData.position ||
    !Number.isInteger(employeeData.age) ||
    employeeData.age < 18 ||
    employeeData.age > 100
  ) {
    showToast("Please check the employee information.");
    saveButton.disabled = false;
    return;
  }

  if (editingId) {
    const index = employees.findIndex(e => e.id === editingId);
    if (index !== -1) {
      employees[index] = { id: editingId, ...employeeData };
    }
    showToast("Employee record updated successfully.");
  } else {
    employees.push({ id: makeEmployeeId(), ...employeeData });
    showToast("New employee added successfully.");
  }

  saveEmployees();
  renderAll();
  closeModal();
  saveButton.disabled = false;
}

// ==========================================
// DELETE / UNDO
// ==========================================

function handleTableAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const employee = employees.find(e => e.id === button.dataset.id);
  if (!employee) return;

  if (button.dataset.action === "edit") openModal(employee);
  if (button.dataset.action === "delete") deleteEmployee(employee);
}

function deleteEmployee(employee) {
  if (!confirm(`Delete the record for ${employee.name}?`)) return;

  deletedEmployee = { ...employee };
  employees = employees.filter(e => e.id !== employee.id);

  saveEmployees();
  renderAll();
  showToast("Employee record deleted.", true);
}

function undoDelete() {
  if (!deletedEmployee) return;

  employees.push(deletedEmployee);
  deletedEmployee = null;

  saveEmployees();
  renderAll();

  $("#toast").classList.remove("show");
  showToast("Employee record restored successfully.");
}

// ==========================================
// NAVIGATION
// ==========================================

function switchPage(pageName) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active-page");
  });

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.page === pageName);
  });

  const target = $(`#${pageName}Page`);
  if (target) target.classList.add("active-page");

  if ($("#pageHeading")) {
    $("#pageHeading").textContent =
      pageName === "dashboard" ? "Dashboard" : "Employee Records";
  }

  $("#sidebar")?.classList.remove("open");
}

function setupNavigation() {
  document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => switchPage(button.dataset.page));
  });
}

// ==========================================
// SORT
// ==========================================

function createSortFilter() {
  if (!$("#statusFilter") || $("#sortFilter")) return;

  const sortFilter = document.createElement("select");
  sortFilter.id = "sortFilter";
  sortFilter.setAttribute("aria-label", "Sort employees");

  sortFilter.innerHTML = `
    <option value="name-asc">Name: A–Z</option>
    <option value="name-desc">Name: Z–A</option>
  `;

  $("#statusFilter").insertAdjacentElement("beforebegin", sortFilter);
  sortFilter.addEventListener("change", renderEmployees);
}

// ==========================================
// LOGIN SCREEN
// ==========================================

function createLoginScreen() {
  if ($("#adminLoginOverlay")) return;

  const styles = document.createElement("style");

  styles.textContent = `
    #adminLoginOverlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #101b35, #1d3b68);
      font-family: inherit;
    }

    #adminLoginOverlay .login-card {
      box-sizing: border-box;
      width: min(100%, 410px);
      padding: 36px;
      border-radius: 18px;
      background: #fff;
      color: #172033;
      box-shadow: 0 24px 70px rgba(0,0,0,.25);
    }

    #adminLoginOverlay .login-brand {
      margin: 0 0 8px;
      color: #2563eb;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    #adminLoginOverlay h1 { margin: 0 0 8px; font-size: 27px; }
    #adminLoginOverlay .login-subtitle {
      margin: 0 0 26px;
      color: #64748b;
      font-size: 14px;
    }

    #adminLoginOverlay label {
      display: block;
      margin: 15px 0 7px;
      font-size: 13px;
      font-weight: 700;
    }

    #adminLoginOverlay input {
      box-sizing: border-box;
      width: 100%;
      padding: 12px 13px;
      border: 1px solid #d8deea;
      border-radius: 9px;
      outline: none;
      font: inherit;
    }

    #adminLoginOverlay input:focus {
      border-color: #3976e8;
      box-shadow: 0 0 0 3px rgba(57,118,232,.12);
    }

    #adminLoginOverlay .password-wrap { display: flex; gap: 8px; }
    #adminLoginOverlay .password-wrap input { flex: 1; min-width: 0; }

    #adminLoginOverlay .show-password {
      padding: 0 12px;
      border: 1px solid #d8deea;
      border-radius: 9px;
      background: #f8fafc;
      cursor: pointer;
    }

    #adminLoginOverlay .login-submit {
      width: 100%;
      margin-top: 22px;
      padding: 13px;
      border: 0;
      border-radius: 9px;
      background: #2563eb;
      color: #fff;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    #adminLoginOverlay .login-submit:disabled { opacity: .6; cursor: wait; }

    #adminLoginOverlay .login-error {
      min-height: 18px;
      margin: 12px 0 0;
      color: #dc2626;
      font-size: 13px;
    }

    #adminLogoutBtn {
      display: block;
      width: calc(100% - 24px);
      margin: 14px 12px;
      padding: 11px 14px;
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 9px;
      background: rgba(255,255,255,.08);
      color: inherit;
      font: inherit;
      font-weight: 600;
      text-align: left;
      cursor: pointer;
    }

    #undoDeleteBtn {
      margin-left: 14px;
      padding: 6px 11px;
      border: 0;
      border-radius: 6px;
      background: #fff;
      color: #1d4ed8;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
    }

    .toast.show { pointer-events: auto; }
  `;

  document.head.appendChild(styles);

  const overlay = document.createElement("div");
  overlay.id = "adminLoginOverlay";

  overlay.innerHTML = `
    <form class="login-card" id="adminLoginForm">
      <p class="login-brand">PeopleDesk</p>
      <h1>Admin Login</h1>
      <p class="login-subtitle">Sign in to manage employee records.</p>

      <label for="adminUsername">Username</label>
      <input id="adminUsername" type="text"
        placeholder="Enter username" autocomplete="username" required>

      <label for="adminPassword">Password</label>
      <div class="password-wrap">
        <input id="adminPassword" type="password"
          placeholder="Enter password" autocomplete="current-password" required>
        <button class="show-password" id="toggleAdminPassword" type="button">
          Show
        </button>
      </div>

      <button class="login-submit" id="loginSubmit" type="submit">Sign In</button>
      <p class="login-error" id="adminLoginError" role="alert"></p>
    </form>
  `;

  document.body.appendChild(overlay);
}

// ==========================================
// LOGIN / LOGOUT
// ==========================================

function showLogin() {
  $("#adminLoginOverlay").style.display = "flex";
  $("#adminUsername").value = "";
  $("#adminPassword").value = "";
  $("#adminLoginError").textContent = "";
}

function hideLogin() {
  $("#adminLoginOverlay").style.display = "none";
}

function loginAdmin(event) {
  event.preventDefault();

  const username = $("#adminUsername").value.trim();
  const password = $("#adminPassword").value;
  const button = $("#loginSubmit");

  button.disabled = true;
  button.textContent = "Signing in...";

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, "true");
    $("#adminLoginError").textContent = "";
    hideLogin();
    showDashboard();
  } else {
    $("#adminLoginError").textContent = "Incorrect username or password.";
    $("#adminPassword").value = "";
  }

  button.disabled = false;
  button.textContent = "Sign In";
}

function showDashboard() {
  hideLogin();

  document.querySelectorAll(".page").forEach(page => {
    page.style.visibility = "visible";
  });

  if ($("#adminLogoutBtn")) $("#adminLogoutBtn").style.display = "block";

  renderAll();
}

function logoutAdmin() {
  sessionStorage.removeItem(SESSION_KEY);
  showLogin();
  if ($("#adminLogoutBtn")) $("#adminLogoutBtn").style.display = "none";
}

function createLogoutButton() {
  if ($("#adminLogoutBtn")) return;

  const button = document.createElement("button");
  button.id = "adminLogoutBtn";
  button.type = "button";
  button.textContent = "↪  Logout";

  const sidebar = $("#sidebar");

  if (sidebar) sidebar.appendChild(button);
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
  $("#adminLoginForm").addEventListener("submit", loginAdmin);

  $("#toggleAdminPassword").addEventListener("click", () => {
    const passwordInput = $("#adminPassword");
    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword ? "text" : "password";
    $("#toggleAdminPassword").textContent = isPassword ? "Hide" : "Show";
  });

  $("#adminLogoutBtn")?.addEventListener("click", logoutAdmin);

  $("#addEmployeeBtn")?.addEventListener("click", () => openModal());

  $("#closeModal")?.addEventListener("click", closeModal);
  $("#cancelBtn")?.addEventListener("click", closeModal);

  $("#employeeModal")?.addEventListener("click", event => {
    if (event.target === $("#employeeModal")) closeModal();
  });

  $("#employeeForm")?.addEventListener("submit", handleFormSubmit);

  $("#searchInput")?.addEventListener("input", renderEmployees);
  $("#statusFilter")?.addEventListener("change", renderEmployees);

  $("#employeeTableBody")?.addEventListener("click", handleTableAction);

  $("#menuToggle")?.addEventListener("click", () => {
    $("#sidebar")?.classList.toggle("open");
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeModal();
  });
}
