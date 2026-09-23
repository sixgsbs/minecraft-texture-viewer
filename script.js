const packInput = document.getElementById("packInput");
const fileName = document.getElementById("fileName");
const viewer = document.getElementById("viewer");
const textures = document.getElementById("textures");

// Load JSZip
const zipScript = document.createElement("script");
zipScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
document.head.appendChild(zipScript);

packInput.addEventListener("change", async function () {
    const file = packInput.files[0];

    if (!file) {
        return;
    }

    fileName.textContent = "Selected: " + file.name;
    viewer.classList.remove("hidden");

    textures.innerHTML = "<p>📦 Reading texture pack...</p>";

    try {
        const zip = await JSZip.loadAsync(file);

        textures.innerHTML = "";

        let found = 0;

        for (const path in zip.files) {
            const zipFile = zip.files[path];

            if (zipFile.dir) {
                continue;
            }

            if (!path.toLowerCase().endsWith(".png")) {
                continue;
            }

            if (!path.includes("assets/minecraft/textures/")) {
                continue;
            }

            const imageBlob = await zipFile.async("blob");
            const imageURL = URL.createObjectURL(imageBlob);

            const texture = document.createElement("div");
            texture.className = "texture";

            const image = document.createElement("img");
            image.src = imageURL;

            const name = document.createElement("p");
            name.className = "texture-name";
            name.textContent = path;

            texture.appendChild(image);
            texture.appendChild(name);

            textures.appendChild(texture);

            found++;
        }

        if (found === 0) {
            textures.innerHTML = `
                <div class="texture">
                    <p>❌ No Minecraft textures were found.</p>
                </div>
            `;
        }

    } catch (error) {
        console.error(error);

        textures.innerHTML = `
            <div class="texture">
                <p>❌ Could not read this texture pack.</p>
                <p class="texture-name">${error.message}</p>
            </div>
        `;
    }
});
