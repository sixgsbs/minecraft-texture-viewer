const packInput = document.getElementById("packInput");
const fileName = document.getElementById("fileName");
const viewer = document.getElementById("viewer");
const textures = document.getElementById("textures");

const buttons = document.querySelectorAll(".tabs button");

let textureFiles = [];

// Load JSZip
const jszipReady = new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";

    script.onload = resolve;
    script.onerror = reject;

    document.head.appendChild(script);
});

packInput.addEventListener("change", async function () {
    const file = packInput.files[0];

    if (!file) {
        return;
    }

    fileName.textContent = "Selected: " + file.name;
    viewer.classList.remove("hidden");

    textures.innerHTML = "<p>📦 Reading texture pack...</p>";

    try {
        await jszipReady;

        const zip = await JSZip.loadAsync(file);

        textureFiles = [];

        for (const path in zip.files) {
            const zipFile = zip.files[path];

            if (zipFile.dir) {
                continue;
            }

            if (!path.toLowerCase().endsWith(".png")) {
                continue;
            }

            if (!path.toLowerCase().includes("/textures/")) {
                continue;
            }

            textureFiles.push({
                path: path,
                file: zipFile
            });
        }

        if (textureFiles.length === 0) {
            textures.innerHTML = `
                <div class="texture">
                    <p>❌ No Minecraft textures were found.</p>
                </div>
            `;
            return;
        }

        showTextures("block");

    } catch (error) {
        console.error(error);

        textures.innerHTML = `
            <div class="texture">
                <p>❌ Could not read the texture pack.</p>
                <p class="texture-name">${error.message}</p>
            </div>
        `;
    }
});

async function showTextures(category) {
    textures.innerHTML = "<p>🔎 Loading textures...</p>";

    const matchingTextures = textureFiles.filter(texture => {
        const path = texture.path.toLowerCase();

        return path.includes("/textures/" + category + "/");
    });

    textures.innerHTML = "";

    if (matchingTextures.length === 0) {
        textures.innerHTML = `
            <div class="texture">
                <p>😕 No ${category} textures found.</p>
            </div>
        `;
        return;
    }

    for (const texture of matchingTextures) {
        try {
            const imageBlob = await texture.file.async("blob");
            const imageURL = URL.createObjectURL(imageBlob);

            const card = document.createElement("div");
            card.className = "texture";

            const image = document.createElement("img");
            image.src = imageURL;
            image.alt = texture.path;

            const name = document.createElement("p");
            name.className = "texture-name";

            const parts = texture.path.split("/");
            name.textContent = parts[parts.length - 1];

            card.appendChild(image);
            card.appendChild(name);

            textures.appendChild(card);

        } catch (error) {
            console.error("Could not load:", texture.path);
        }
    }
}

// Blocks / Items / GUI / Mobs buttons
buttons.forEach(button => {
    button.addEventListener("click", function () {

        const category = button.textContent.trim().toLowerCase();

        showTextures(category);
    });
});
