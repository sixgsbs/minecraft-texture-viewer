const packInput = document.getElementById("packInput");
const fileName = document.getElementById("fileName");
const viewer = document.getElementById("viewer");
const textures = document.getElementById("textures");

const buttons = document.querySelectorAll(".tabs button");

let textureFiles = [];

/* Load JSZip from GitHub instead of the old CDN */
function loadJSZip() {
    return new Promise((resolve, reject) => {
        if (window.JSZip) {
            resolve();
            return;
        }

        const script = document.createElement("script");

        script.src =
            "https://raw.githubusercontent.com/Stuk/jszip/v3.10.1/dist/jszip.min.js";

        script.onload = () => {
            if (window.JSZip) {
                resolve();
            } else {
                reject(new Error("JSZip loaded but was not found."));
            }
        };

        script.onerror = () => {
            reject(new Error("Could not load the ZIP reader."));
        };

        document.head.appendChild(script);
    });
}


/* When a texture pack is selected */
packInput.addEventListener("change", async function () {

    const file = packInput.files[0];

    if (!file) {
        return;
    }

    fileName.textContent = "Selected: " + file.name;

    viewer.classList.remove("hidden");

    textures.innerHTML = `
        <div class="texture">
            <p>📦 Opening texture pack...</p>
        </div>
    `;

    try {

        await loadJSZip();

        const zip = await JSZip.loadAsync(file);

        textureFiles = [];

        /* Find every PNG inside the ZIP */
        for (const path in zip.files) {

            const zipFile = zip.files[path];

            if (zipFile.dir) {
                continue;
            }

            const cleanPath = path
                .replaceAll("\\", "/")
                .toLowerCase();

            if (!cleanPath.endsWith(".png")) {
                continue;
            }

            if (!cleanPath.includes("/textures/")) {
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
                    <p>❌ I couldn't find Minecraft textures in this ZIP.</p>
                    <p class="texture-name">
                        Make sure this is a Minecraft texture pack.
                    </p>
                </div>
            `;

            return;
        }

        /* Show blocks first */
        showTextures("blocks");

    } catch (error) {

        console.error(error);

        textures.innerHTML = `
            <div class="texture">
                <p>❌ Something went wrong.</p>
                <p class="texture-name">
                    ${error.message}
                </p>
            </div>
        `;
    }
});


/* Show textures for a category */
async function showTextures(category) {

    textures.innerHTML = `
        <div class="texture">
            <p>🔎 Loading ${category}...</p>
        </div>
    `;

    let matchingTextures = [];

    for (const texture of textureFiles) {

        const path = texture.path
            .replaceAll("\\", "/")
            .toLowerCase();

        if (category === "blocks") {

            if (
                path.includes("/textures/block/") ||
                path.includes("/textures/blocks/")
            ) {
                matchingTextures.push(texture);
            }

        } else if (category === "items") {

            if (
                path.includes("/textures/item/") ||
                path.includes("/textures/items/")
            ) {
                matchingTextures.push(texture);
            }

        } else if (category === "gui") {

            if (path.includes("/textures/gui/")) {
                matchingTextures.push(texture);
            }

        } else if (category === "mobs") {

            if (
                path.includes("/textures/entity/") ||
                path.includes("/textures/mob/")
            ) {
                matchingTextures.push(texture);
            }
        }
    }


    textures.innerHTML = "";


    if (matchingTextures.length === 0) {

        textures.innerHTML = `
            <div class="texture">
                <p>😕 No ${category} textures found.</p>
            </div>
        `;

        return;
    }


    /* Create a card for every texture */
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


            const parts = texture.path
                .replaceAll("\\", "/")
                .split("/");

            name.textContent = parts[parts.length - 1];


            card.appendChild(image);

            card.appendChild(name);

            textures.appendChild(card);

        } catch (error) {

            console.error(
                "Could not load texture:",
                texture.path,
                error
            );
        }
    }
}


/* Category buttons */
buttons.forEach(button => {

    button.addEventListener("click", function () {

        const text = button.textContent
            .trim()
            .toLowerCase();

        if (text === "blocks") {
            showTextures("blocks");
        }

        if (text === "items") {
            showTextures("items");
        }

        if (text === "gui") {
            showTextures("gui");
        }

        if (text === "mobs") {
            showTextures("mobs");
        }

    });

});
