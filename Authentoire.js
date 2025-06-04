const codeList = document.getElementById("code-list");
const addBtn = document.getElementById("add-btn");
const addDialog = document.getElementById("addDialog"); // Changed from add-form to addDialog
const newAccountForm = document.getElementById("newAccountForm"); // Get the form element
const cancelAddBtn = document.getElementById("cancelAddBtn"); // Get the cancel button

const labelInput = document.getElementById("label");
const secretInput = document.getElementById("secret");

async function renderCodes() {
  chrome.storage.local.get("secrets", async (data) => {
    const secrets = data.secrets || [];
    codeList.innerHTML = "";

    for (let i = 0; i < secrets.length; i++) {
      const item = secrets[i];
      const code = await generateTOTP(item.secret);

      const entry = document.createElement("div");
      entry.className = "entry";

      const label = document.createElement("span");
      label.textContent = `${item.label}: ${code}`;

      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️";
      delBtn.onclick = () => deleteSecret(i);

      entry.appendChild(label);
      entry.appendChild(delBtn);
      codeList.appendChild(entry);
    }
  });
}

function deleteSecret(index) {
  chrome.storage.local.get("secrets", (data) => {
    const secrets = data.secrets || [];
    secrets.splice(index, 1);
    chrome.storage.local.set({ secrets }, renderCodes);
  });
}

function addSecret(event) {
  event.preventDefault(); // Prevent default form submission
  const label = labelInput.value.trim();
  const secret = secretInput.value.trim();
  if (!label || !secret) return;

  chrome.storage.local.get("secrets", (data) => {
    const secrets = data.secrets || [];
    secrets.push({ label, secret });
    chrome.storage.local.set({ secrets }, () => {
      labelInput.value = "";
      secretInput.value = "";
      addDialog.close(); // Close the dialog
      renderCodes();
    });
    0;
  });
}

addBtn.onclick = () => {
  addDialog.showModal(); // Show the dialog
};

newAccountForm.onsubmit = addSecret; // Handle form submission

cancelAddBtn.onclick = () => {
  addDialog.close(); // Close the dialog on cancel
};

renderCodes();

// Refresh every 30 seconds to update codes
setInterval(renderCodes, 30000);
