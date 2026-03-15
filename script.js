
const STORAGE_KEY = "dungeon-loot-splitter-state";

let loot = [];      // Array of loot objects { name, value, quantity }
let partySize = 1;  // Number of party members




// INITIAL EVENT LISTENERS
window.addEventListener("DOMContentLoaded", () => {
    // Restore state before the app begins writing to localStorage.
    loadState();

    document.getElementById("addLootBtn")
        .addEventListener("click", addLoot);

    document.getElementById("partySize")
        .addEventListener("input", onPartySizeChange);

    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn) {
        resetBtn.addEventListener("click", resetState);
    }

    updateUI();
});

// LOCAL STORAGE
function saveState() {
    const state = {
        loot,
        partySize
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
        console.warn("Could not save state to localStorage", err);
    }
}

function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
        const parsed = JSON.parse(raw);

        if (!parsed || typeof parsed !== "object") return;

        const { loot: storedLoot, partySize: storedPartySize } = parsed;

        if (!Array.isArray(storedLoot)) return;
        if (typeof storedPartySize !== "number" || Number.isNaN(storedPartySize) || storedPartySize < 1) return;

        // Validate each loot entry
        const validatedLoot = storedLoot.filter(item => {
            return (
                item &&
                typeof item.name === "string" &&
                item.name.trim().length > 0 &&
                typeof item.value === "number" &&
                !Number.isNaN(item.value) &&
                item.value >= 0 &&
                typeof item.quantity === "number" &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0
            );
        });

        loot = validatedLoot;
        partySize = storedPartySize;

        // Reflect restored state in the input UI.
        document.getElementById("partySize").value = partySize;
    } catch (err) {
        console.warn("Could not parse saved state", err);
    }
}

function resetState() {
    loot = [];
    partySize = 1;

    document.getElementById("partySize").value = partySize;
    document.getElementById("lootName").value = "";
    document.getElementById("lootValue").value = "";
    document.getElementById("lootQuantity").value = "1";

    clearError();

    localStorage.removeItem(STORAGE_KEY);

    updateUI();
}




// PARTY SIZE CHANGE HANDLER
function onPartySizeChange(event) {
    const value = parseInt(event.target.value, 10);

   
    if (Number.isNaN(value) || value < 1) {
        partySize = 1;
        event.target.value = partySize;
    } else {
        partySize = value;
    }

    clearError();
    saveState();
    updateUI();
}




// ADD LOOT FUNCTION
function addLoot() {
    const name = document.getElementById("lootName").value.trim();
    const value = parseFloat(document.getElementById("lootValue").value);
    const quantity = parseInt(document.getElementById("lootQuantity").value, 10);


    if (!name) return showError("Item name cannot be empty.");
    if (Number.isNaN(value) || value < 0)
        return showError("Value must be a number ≥ 0.");
    if (Number.isNaN(quantity) || quantity < 1)
        return showError("Quantity must be at least 1.");

    clearError();

    
    loot.push({ name, value, quantity });

    // Reset inputs
    document.getElementById("lootName").value = "";
    document.getElementById("lootValue").value = "";
    document.getElementById("lootQuantity").value = "1";

    saveState();
    updateUI();
}




// REMOVE LOOT
function removeLoot(index) {
    loot.splice(index, 1);
    saveState();
    updateUI();
}



//ERROR HANDLING
function showError(message) {
    const el = document.getElementById("errorMessage");
    el.textContent = message;
    el.classList.remove("hidden");
}

function clearError() {
    const el = document.getElementById("errorMessage");
    el.textContent = "";
    el.classList.add("hidden");
}




// MAIN RENDER FUNCTION
function updateUI() {

    // DOM references
    const lootRows = document.getElementById("lootRows");
    const noLootMessage = document.getElementById("noLootMessage");
    const resultsPanel = document.getElementById("resultsPanel");
    const totalLootEl = document.getElementById("totalLoot");
    const lootPerMemberEl = document.getElementById("lootPerMember");

    // Clear old rows
    lootRows.innerHTML = "";




    // RENDER LOOT LIST
    if (loot.length === 0) {
        noLootMessage.classList.remove("hidden");
    } else {
        noLootMessage.classList.add("hidden");

        loot.forEach((item, index) => {
            const row = document.createElement("div");
            row.className = "loot-row";

            // Create cells
            const nameCell = document.createElement("div");
            nameCell.className = "loot-cell";
            nameCell.textContent = item.name;

            const valueCell = document.createElement("div");
            valueCell.className = "loot-cell";
            valueCell.textContent = item.value.toFixed(2);

            const quantityCell = document.createElement("div");
            quantityCell.className = "loot-cell";
            quantityCell.textContent = item.quantity;

            const actionCell = document.createElement("div");
            actionCell.className = "loot-cell loot-actions";

            // Remove button
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remove";
            removeBtn.addEventListener("click", () => removeLoot(index));

            actionCell.appendChild(removeBtn);

            // Append cells to row
            row.appendChild(nameCell);
            row.appendChild(valueCell);
            row.appendChild(quantityCell);
            row.appendChild(actionCell);

            // Add row to table
            lootRows.appendChild(row);
        });
    }



    
    // CALCULATE TOTAL + SPLIT
    let total = 0;
    loot.forEach(item => {
        total += item.value * item.quantity;
    });

    const validParty = partySize >= 1;

    if (loot.length > 0 && validParty) {
        const perMember = total / partySize;

        totalLootEl.textContent = total.toFixed(2);
        lootPerMemberEl.textContent = perMember.toFixed(2);

        resultsPanel.classList.remove("hidden");
    } else {
        resultsPanel.classList.add("hidden");
    }
}
