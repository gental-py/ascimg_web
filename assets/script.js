// The main scripts file for ascimg site.
// About 70% of this code was generated by ChatGPT,
// so some things could have been done better. Anyway,
// im happy enough with this result. 


const API_CONVERT = "https://fastapi-production-4d68.up.railway.app/convert/"
// const API_CONVERT = "http://127.0.0.1:8000/convert/"
let image_buffer = null
console.log("Using API endpoint: ", API_CONVERT)


document.getElementById("ascimg-logo").addEventListener("click", () => {
    window.open("https://github.com/gental-py/ascimg", "_blank")
})

document.getElementById("upload_card").addEventListener("click", () => {
    document.getElementById("upload_input").click()
})


document.getElementById("density-scale").addEventListener("change", handleDensityChange)
function handleDensityChange() {
    value = document.getElementById("density-scale").value
    if (value == "custom") {
        document.getElementById("custom-density").style.display = "inline";
    } else {
        document.getElementById("custom-density").style.display = "none";
    }
}

function outputSmallerContent() {
    outputContent = document.getElementById("output_content");
    computedStyle = window.getComputedStyle(outputContent);
    currentFontSize = parseFloat(computedStyle.fontSize);
    if (isNaN(currentFontSize) || currentFontSize <= 1) {
        return;
    }
    outputContent.style.fontSize = (currentFontSize - 1) + "px";
}

function outputBiggerContent() {
    outputContent = document.getElementById("output_content");
    computedStyle = window.getComputedStyle(outputContent);
    currentFontSize = parseFloat(computedStyle.fontSize);
    if (isNaN(currentFontSize) || currentFontSize >= 18) {
        return;
    }
    outputContent.style.fontSize = (currentFontSize + 1) + "px";
}

function copyOutputContent() {
    content = document.getElementById("output_content").innerText
    if (content == "" || content == undefined) { return }
    navigator.clipboard.writeText(content)
}

function switchViewModeToImage(image) {
    document.getElementById("upload_inform").style.display = "none"
    document.getElementById("upload_image_icon").style.display = "none"
    document.getElementById("uploaded_img").src = image
}

function displayAscii(text, time) {
    document.getElementById("output_content").innerHTML = text
    if (time == -1) {
        document.getElementById("output_header").innerHTML = "There was an error..."
    } else {
        document.getElementById("output_header").innerHTML = "Generated in: " + time + " seconds."
    }
    document.getElementById("open_popup").click()
}

function prepareSettings() {
    data = ""
    data += getValue("image-scale") + "~"
    data += getValue("contrast-factor") + "~"
    data += getValue("brightness-factor") + "~"
    data += getValue("sharpness-factor") + "~"
    if (document.getElementById('density-scale').value == "custom") {
        density = document.getElementById("custom-density").value
        density = density.replaceAll("~", "")
        if (density.length == 0) {
            density = "short"
            console.warn("Blank custom density scale... using short.")
        } 
        data += density + "~"
    } else {
        data += document.getElementById('density-scale').value + "~"
    }
    data += getValue("solarize-factor") + "~"
    data += ((getValue("invert-checkbox") == "Enabled") ? "1" : "0") + "~"
    data += ((getValue("mirror-checkbox") == "Enabled") ? "1" : "0")
    console.log("Settings query: ", data)
    data = encodeURIComponent(data)
    console.log("^-- After encoding: ", data)
    return data
}

document.getElementById("upload_input").addEventListener("change", updateImage)
function updateImage() {
    file = document.getElementById("upload_input").files[0]

    try {
        image = URL.createObjectURL(file)
        image_buffer = image
    } catch (error) {
        console.warn("Failed to genearte URL for image.")
        if (image_buffer === null) {
            console.error("No image in buffer...")
            location.reload()
        } else {
            image = image_buffer
            console.log("Found image in buffer.")
        }
    }

    switchViewModeToImage(image)
}

function generateImage() {
    image = image_buffer
    if (image === null) { 
        console.error("Cannot generate - blank image buffer.")
        return
    }

    fetch(image)
        .then(response => response.blob())
        .then(imageBlob => {
            const formData = new FormData();
            formData.append('file', imageBlob,);
            url = API_CONVERT + "?settings=" + prepareSettings()
            return fetch(url, {
                method: 'POST',
                body: formData,
            });
        })
        .then(response => response.json())
        .then(data => {
            if (data.error !== false) {
                displayAscii("There was an error with API... <br>" + data.error, -1)
            } else {
                displayAscii(ascii, data.time)
            }
        })
        .catch(error => {
            console.error(error);
            displayAscii("There was an error with JS... <br>" + error, -1)
        });

}

function updateValue(elementId, value) {
    document.getElementById(elementId + '-value').textContent = value;
}

function getValue(elementId) {
    return document.getElementById(elementId + '-value').textContent;
}

function initializeValues() {
    updateValue('image-scale', document.getElementById('image-scale').value);
    updateValue('contrast-factor', document.getElementById('contrast-factor').value);
    updateValue('brightness-factor', document.getElementById('brightness-factor').value);
    updateValue('sharpness-factor', document.getElementById('sharpness-factor').value);
    updateValue('solarize-factor', document.getElementById('solarize-factor').value);
    updateValue('invert-checkbox', document.getElementById('invert-checkbox').checked ? 'Enabled' : 'Disabled');
    updateValue('mirror-checkbox', document.getElementById('mirror-checkbox').checked ? 'Enabled' : 'Disabled');
}

document.getElementById('image-scale').addEventListener('input', function () {
    updateValue('image-scale', this.value);
});

document.getElementById('contrast-factor').addEventListener('input', function () {
    updateValue('contrast-factor', this.value);
});

document.getElementById('brightness-factor').addEventListener('input', function () {
    updateValue('brightness-factor', this.value);
});

document.getElementById('sharpness-factor').addEventListener('input', function () {
    updateValue('sharpness-factor', this.value);
});

document.getElementById('solarize-factor').addEventListener('input', function () {
    updateValue('solarize-factor', this.value);
});

document.getElementById('invert-checkbox').addEventListener('change', function () {
    updateValue('invert-checkbox', this.checked ? 'Enabled' : 'Disabled');
});

document.getElementById('mirror-checkbox').addEventListener('change', function () {
    updateValue('mirror-checkbox', this.checked ? 'Enabled' : 'Disabled');
});

initializeValues();


function resetToDefault() {
    // Reset image width
    document.getElementById('image-scale').value = 0.5;
    updateValue('image-scale', '0.5');

    // Reset contrast factor
    document.getElementById('contrast-factor').value = 1.5;
    updateValue('contrast-factor', '1.5');

    // Reset brightness factor
    document.getElementById('brightness-factor').value = 1.0;
    updateValue('brightness-factor', '1');

    // Reset sharpness factor
    document.getElementById('sharpness-factor').value = 1.0;
    updateValue('sharpness-factor', '1');

    // Reset solarize factor
    document.getElementById('solarize-factor').value = 0;
    updateValue('solarize-factor', '0');

    // Reset invert checkbox
    document.getElementById('invert-checkbox').checked = false;
    updateValue('invert-checkbox', 'Disabled');

    // Reset mirror checkbox
    document.getElementById('mirror-checkbox').checked = false;
    updateValue('mirror-checkbox', 'Disabled');

    // Reset density scale
    document.getElementById('density-scale').value = "short";

    document.getElementById("custom-density").style.display = "none";
}
