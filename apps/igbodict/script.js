const API_KEY = "98b54823-d19e-4327-b0ea-5275255cab0d";
let pronunciationUrl = "";

document.getElementById("word-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        document.getElementById("search-btn").click();
    }
});


document.getElementById("search-btn").addEventListener("click", async () => {
    const word = document.getElementById("word-input").value.trim();
    if (!word) return alert("Please enter a word.");

    const response = await fetch(`https://igboapi.com/api/v1/words?keyword=${word}&examples=true`, {
        headers: { "X-API-Key": API_KEY }
    });

    const data = await response.json();
    displayResult(data);
});

function displayResult(data) {
    const result = document.getElementById("result");
    const playBtn = document.getElementById("play-btn");
    const saveBtn = document.getElementById("save-btn");

    if (data.length === 0) {
        result.textContent = "Word not found.";
        playBtn.disabled = true;
        saveBtn.disabled = true;
        return;
    }

    const wordData = data[0];
    pronunciationUrl = wordData.pronunciation;

    let resultText = `Word: ${wordData.word}\n1. ${wordData.definitions[0]}\n`;
    if (wordData.definitions[1]) {
        resultText += `2. ${wordData.definitions[1]}\n`;
    }

    if (wordData.variations && wordData.variations.length > 0) {
        resultText += `Variation: ${wordData.variations[0]}\n`;
    }

    if (wordData.examples.length > 0) {
        resultText += `Example: ${wordData.examples[0].igbo} - ${wordData.examples[0].english}\n`;
    }

    if (wordData.examples.length > 1) {
        resultText += `Example 2: ${wordData.examples[1].igbo} - ${wordData.examples[1].english}`;
    }

    result.textContent = resultText;
    playBtn.disabled = !pronunciationUrl;
    saveBtn.disabled = !pronunciationUrl;
}

document.getElementById("play-btn").addEventListener("click", () => {
    if (pronunciationUrl) {
        const audio = new Audio(pronunciationUrl);
        audio.play();
    }
});

document.getElementById("save-btn").addEventListener("click", () => {
    if (pronunciationUrl) {
        const link = document.createElement("a");
        link.href = pronunciationUrl;
        link.download = "pronunciation.mp3";
        link.click();
    }
});
