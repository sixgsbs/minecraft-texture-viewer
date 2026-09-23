const packInput = document.getElementById("packInput");
const fileName = document.getElementById("fileName");
const viewer = document.getElementById("viewer");
const textures = document.getElementById("textures");

packInput.addEventListener("change", async function () {
    const file = packInput.files[0];

    if (!file) {
        return;
    }

    fileName.textContent = "Selected: " + file.name;

    viewer.classList.remove("hidden");

    textures.innerHTML = `
        <div class="texture">
            <p>📦 Texture pack selected!</p>
            <p class="texture-name">${file.name}</p>
        </div>
    `;
});
