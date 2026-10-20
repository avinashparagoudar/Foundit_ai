/* FindIt AI — vanilla JavaScript demo.
   Reports are stored only in this browser using localStorage. */
"use strict";

const STORAGE_KEY = "findit-ai-reports-v1";
const form = document.getElementById("item-form");
const reportList = document.getElementById("report-list");
const searchInput = document.getElementById("search-input");
const emptyState = document.getElementById("empty-state");
const toast = document.getElementById("toast");
let activeFilter = "ALL";
let toastTimer;

const today = new Date();
document.getElementById("report-date").value =
  `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

function loadReports() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}
let reports = loadReports();

function saveReports() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[char]);
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}
function formatDate(dateString) {
  if (!dateString) return "Date not specified";
  const date = new Date(`${dateString}T12:00:00`);
  return Number.isNaN(date.getTime()) ? dateString : date.toLocaleDateString(undefined, {month:"short",day:"numeric",year:"numeric"});
}
function updateDashboard() {
  document.getElementById("total-count").textContent = reports.length;
  document.getElementById("lost-count").textContent = reports.filter(r => r.type === "LOST" && r.status !== "RESOLVED").length;
  document.getElementById("found-count").textContent = reports.filter(r => r.type === "FOUND" && r.status !== "RESOLVED").length;
  document.getElementById("resolved-count").textContent = reports.filter(r => r.status === "RESOLVED").length;
  document.getElementById("all-filter-count").textContent = reports.length;
}
function getVisibleReports() {
  const query = searchInput.value.trim().toLowerCase();
  return reports.filter(report => {
    const matchesFilter = activeFilter === "ALL" ||
      (activeFilter === "OPEN" ? report.status === "OPEN" : report.type === activeFilter);
    const searchable = [report.title, report.description, report.category, report.location, report.contactName].join(" ").toLowerCase();
    return matchesFilter && searchable.includes(query);
  }).sort((a,b) => b.createdAt - a.createdAt);
}
function renderReports() {
  updateDashboard();
  const visible = getVisibleReports();
  reportList.innerHTML = "";
  emptyState.hidden = visible.length !== 0;
  document.getElementById("results-footer").textContent =
    `Showing ${visible.length} of ${reports.length} report${reports.length === 1 ? "" : "s"}`;
  visible.forEach(report => {
    const card = document.createElement("article");
    card.className = `report-card ${report.type.toLowerCase()}`;
    const isResolved = report.status === "RESOLVED";
    card.innerHTML = `
      <div class="report-card-top">
        <div class="report-avatar" aria-hidden="true">${report.type === "LOST" ? "⌕" : "✓"}</div>
        <div class="report-main">
          <h3>${escapeHTML(report.title)}</h3>
          <p>${escapeHTML(report.category)} · Reported ${formatDate(report.reportDate)}</p>
        </div>
        <span class="report-badge ${isResolved ? "badge-resolved" : report.type === "LOST" ? "badge-lost" : "badge-found"}">${isResolved ? "RESOLVED" : report.type}</span>
      </div>
      <p class="report-description">${escapeHTML(report.description)}</p>
      <div class="report-meta"><span>⌖ ${escapeHTML(report.location)}</span><span>♙ ${escapeHTML(report.contactName)}</span></div>
      <div class="report-actions">
        <button class="small-action match-action" data-action="match" data-id="${report.id}">✧ Find matches</button>
        ${!isResolved ? `<button class="small-action" data-action="resolve" data-id="${report.id}">✓ Mark resolved</button>` : ""}
        <button class="small-action" data-action="contact" data-id="${report.id}">Contact details</button>
        <button class="small-action" data-action="delete" data-id="${report.id}">Delete</button>
      </div>
      <div class="match-slot" id="matches-${report.id}"></div>`;
    reportList.appendChild(card);
  });
}
function tokenize(text) {
  return new Set(String(text || "").toLowerCase().match(/[a-z0-9]+/g) || []);
}
function similarity(a, b) {
  const wordsA = tokenize(`${a.title} ${a.description}`);
  const wordsB = tokenize(`${b.title} ${b.description}`);
  const shared = [...wordsA].filter(word => wordsB.has(word));
  const union = new Set([...wordsA, ...wordsB]);
  let score = union.size ? shared.length / union.size : 0;
  if (a.category === b.category) score += 0.25;
  const locA = tokenize(a.location);
  const locB = tokenize(b.location);
  const locUnion = new Set([...locA, ...locB]);
  if ([...locA].some(word => locB.has(word))) score += 0.2;
  if (locUnion.size && [...locA].some(word => locB.has(word))) score += 0.05;
  return Math.min(score, 1);
}
function findMatches(report) {
  return reports
    .filter(other => other.id !== report.id && other.type !== report.type && other.status !== "RESOLVED" && report.status !== "RESOLVED")
    .map(other => ({report:other, score:similarity(report, other)}))
    .filter(match => match.score >= 0.15)
    .sort((a,b) => b.score - a.score)
    .slice(0,3);
}
form.addEventListener("submit", event => {
  event.preventDefault();
  if (!form.reportType.value) return;
  const data = new FormData(form);
  const report = {
    id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`),
    type: data.get("reportType"),
    title: data.get("title").trim(),
    category: data.get("category"),
    description: data.get("description").trim(),
    location: data.get("location").trim(),
    reportDate: data.get("reportDate"),
    contactName: data.get("contactName").trim(),
    contactEmail: data.get("contactEmail").trim(),
    status: "OPEN",
    createdAt: Date.now()
  };
  if (!report.title || !report.description || !report.location || !report.contactName || !report.contactEmail) {
    showToast("Please complete all required fields.");
    return;
  }
  reports.unshift(report);
  try {
    saveReports();
  } catch {
    reports.shift();
    showToast("Could not save the report. Check your browser storage settings.");
    return;
  }
  form.reset();
  document.getElementById("report-date").value = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  document.querySelector('input[name="reportType"][value="LOST"]').checked = true;
  activeFilter = "ALL";
  document.querySelectorAll(".filter-button").forEach(button => button.classList.toggle("active", button.dataset.filter === "ALL"));
  searchInput.value = "";
  renderReports();
  showToast("Report added successfully!");
  document.getElementById("reports").scrollIntoView({behavior:"smooth",block:"start"});
});
document.querySelectorAll(".filter-button").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter-button").forEach(item => item.classList.toggle("active", item === button));
    renderReports();
  });
});
searchInput.addEventListener("input", renderReports);
document.getElementById("clear-filters").addEventListener("click", () => {
  activeFilter = "ALL";
  searchInput.value = "";
  document.querySelectorAll(".filter-button").forEach(button => button.classList.toggle("active", button.dataset.filter === "ALL"));
  renderReports();
});
reportList.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const report = reports.find(item => item.id === button.dataset.id);
  if (!report) return;
  const slot = document.getElementById(`matches-${report.id}`);
  switch (button.dataset.action) {
    case "match": {
      if (report.status === "RESOLVED") {
        slot.innerHTML = `<div class="match-results">This report is already resolved.</div>`;
        return;
      }
      const matches = findMatches(report);
      slot.innerHTML = matches.length
        ? `<div class="match-results"><strong>✧ Possible matches (heuristic estimate)</strong>${matches.map(match => `<div class="match-item"><b>${escapeHTML(match.report.title)}</b> · ${Math.round(match.score*100)}% similarity<small>${escapeHTML(match.report.type)} · ${escapeHTML(match.report.location)} · ${escapeHTML(match.report.category)}</small></div>`).join("")}<small>Similarity is only a clue. Confirm the item's identifying details before arranging a return.</small></div>`
        : `<div class="match-results">No likely match yet. Add more details or check again when new reports are posted.</div>`;
      break;
    }
    case "resolve":
      report.status = "RESOLVED";
      saveReports(); renderReports(); showToast("Report marked as resolved."); break;
    case "contact":
      slot.innerHTML = `<div class="match-results"><strong>Contact the reporter</strong>${escapeHTML(report.contactName)}<br><a href="mailto:${encodeURIComponent(report.contactEmail)}">${escapeHTML(report.contactEmail)}</a><br><small>Only contact this person if you have a legitimate reason. Arrange handovers in a safe public place.</small></div>`;
      break;
    case "delete":
      if (confirm(`Delete the report "${report.title}"? This cannot be undone.`)) {
        reports = reports.filter(item => item.id !== report.id);
        saveReports(); renderReports(); showToast("Report deleted.");
      }
      break;
  }
});
renderReports();
