// script.js
let completedLessons = JSON.parse(localStorage.getItem('completedLessons')) || [];
let currentLesson = null;
let currentQuestionIndex = 0;
let streak = 0;
let incorrectQuestions = [];

let correctCount = 0;
let fixedCount = 0;
let failedCount = 0;

const lessonsDropdown = document.getElementById('lessons');
const startLessonBtn = document.getElementById('start-lesson');
const lessonSelection = document.getElementById('lesson-selection');
const quizContainer = document.getElementById('quiz-container');
const dataExportContainer = document.getElementById('dataexport-container');
const currentTopic = document.getElementById('current-topic');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const nextQuestionBtn = document.getElementById('next-question');
const feedbackEl = document.getElementById('feedback');
const streakEl = document.getElementById('streak');
const importProgressBtn = document.getElementById('import-progress');
const exportProgressBtn = document.getElementById('export-progress');
const resetProgressBtn = document.getElementById('reset-progress');

// Updated lessons
const lessons = [
    { id: 1, topic: 'Greetings', words: ['goodbye', 'please', 'thank you', 'good morning', 'hi'] },
    { id: 2, topic: 'Family', words: ['father', 'mother', 'brother', 'sister', 'child', 'cousin', 'grandmother', 'grandfather'] },
    { id: 3, topic: 'Colors', words: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'orange', 'purple', 'pink', 'brown'] },
    { id: 4, topic: 'Numbers', words: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'] },
    { id: 5, topic: 'Food', words: ['rice', 'yam', 'soup', 'chicken', 'fish', 'vegetable', 'fruit', 'bread', 'water', 'juice'] },
    { id: 6, topic: 'Places', words: ['home', 'market', 'hospital', 'farm', 'shop', 'street', 'restaurant'] },
    { id: 7, topic: 'Animals', words: ['dog', 'cat', 'cow', 'goat', 'chicken', 'horse', 'sheep', 'fish', 'elephant', 'bird'] },
    { id: 8, topic: 'Weather', words: ['sun', 'rain', 'clouds', 'hot', 'cold', 'wind', 'storm', 'fog', 'thunder', 'lightning'] },
    { id: 9, topic: 'Emotions', words: ['happy', 'sad', 'angry', 'surprise', 'scared', 'tired', 'confusion', 'calm'] }
];

let wordDictionary = {}; // Initialize as an empty object

async function loadWordDictionary() {
    try {
        const response = await fetch('wordDictionary.json'); // Path to your JSON file
        if (!response.ok) {
            throw new Error('Failed to load word dictionary.');
        }
        wordDictionary = await response.json();
        console.log('Word dictionary loaded successfully:', wordDictionary);
    } catch (error) {
        console.error('Error loading word dictionary:', error);
        alert('Failed to load word dictionary. Please try again.');
    }
}

function populateLessonDropdown() {
    lessonsDropdown.innerHTML = '';
    const availableLessons = lessons.filter(lesson => !completedLessons.includes(lesson.topic));

    if (availableLessons.length === 0) {
        lessonsDropdown.innerHTML = '<option disabled>No lessons available</option>';
        return;
    }

    availableLessons.forEach(lesson => {
        const option = document.createElement('option');
        option.value = lesson.id;
        option.textContent = lesson.topic;
        lessonsDropdown.appendChild(option);
    });
}

function startLesson() {
    const selectedLessonId = parseInt(lessonsDropdown.value);
    currentLesson = lessons.find(lesson => lesson.id === selectedLessonId);
    currentQuestionIndex = 0;
    incorrectQuestions = [];
    streak = 0;
    correctCount = 0;
    fixedCount = 0;
    failedCount = 0;
    updateStreakDisplay();
    lessonSelection.classList.add('hidden');
    dataExportContainer.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    currentTopic.textContent = `Topic: ${currentLesson.topic}`;
    document.title = "Lesson - IgboLingo"
    showQuestion();
}

function fetchWordData(word) {
    return wordDictionary[word] || word; // Return the word itself if not in dictionary
}

function showQuestion() {
    const word = getCurrentWord();
    if (!word) {
        finishLesson();
        return;
    }

    const translation = fetchWordData(word);
    if (!translation) {
        questionEl.textContent = 'Error fetching word data. Try again later.';
        return;
    }

    questionEl.textContent = `What is the English translation for "${translation}"?`;

    const options = generateOptions(word);
    shuffleArray(options);
    optionsEl.innerHTML = '';
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => checkAnswer(option, word);
        optionsEl.appendChild(button);
    });
}

function generateOptions(correctWord) {
    const incorrectOptions = currentLesson.words
        .filter(w => w !== correctWord)
        .slice(0, 3);
    return [...incorrectOptions, correctWord];
}

function getCurrentWord() {
    if (currentQuestionIndex < currentLesson.words.length) {
        return currentLesson.words[currentQuestionIndex];
    } else if (incorrectQuestions.length > 0) {
        return incorrectQuestions[0];
    } else {
        return null; // No more questions
    }
}

function checkAnswer(selectedOption, correctAnswer) {
    const correctTranslation = fetchWordData(correctAnswer);

    if (selectedOption === correctAnswer) {
        feedbackEl.textContent = 'Correct!';
        streak++;

        if (incorrectQuestions.includes(correctAnswer)) {
            fixedCount++;
            failedCount = failedCount - 1;
            let index = incorrectQuestions.indexOf(correctAnswer);
            incorrectQuestions = incorrectQuestions.filter(q => q !== correctAnswer);
            console.log('fixed');
        } else {
            correctCount++;
            console.log('correct first time');
        }
    } else {
        feedbackEl.textContent = `Incorrect! The correct answer was: ${correctAnswer} (${correctTranslation}).`;
        streak = 0;

        if (incorrectQuestions.includes(correctAnswer)) {
            console.log('failed twice');
            incorrectQuestions = incorrectQuestions.filter(q => q !== correctAnswer);
        } else {
            incorrectQuestions.push(correctAnswer); // Add to retry list
            failedCount++;
            console.log("failed first time");
            console.log(incorrectQuestions)
        }
    }

    updateStreakDisplay();
    nextQuestionBtn.classList.remove('hidden');
    optionsEl.classList.add('hidden');
}


function nextQuestion() {
    feedbackEl.textContent = '';
    nextQuestionBtn.classList.add('hidden');
    optionsEl.classList.remove('hidden');

    if (currentQuestionIndex < currentLesson.words.length) {
        currentQuestionIndex++;
    } else if (incorrectQuestions.length > 0) {
        currentQuestionIndex = currentLesson.words.length; // Out of bounds to indicate we're in retry mode
    } else {
        finishLesson();
        return;
    }

    showQuestion();
}

function finishLesson() {
    const totalQuestions = currentLesson.words.length;
    const successRate = (((correctCount + fixedCount) / totalQuestions) * 100).toFixed(2);

    quizContainer.classList.add('hidden');
    const resultHTML = `
        <h2>Lesson Completed: ${currentLesson.topic}</h2>
        <p>Correct Answers: ${correctCount}</p>
        <p>Fixed on Retry: ${fixedCount}</p>
        <p>Failed Attempts: ${failedCount}</p>
        <p>Success Rate: ${successRate}%</p>
        <button id="home-btn" onclick="goHome()">Home</button>
    `;
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = resultHTML;
    resultContainer.classList.remove('hidden');
    completedLessons.push(currentLesson.topic);
    saveProgress();
    populateLessonDropdown();
}

function goHome() {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = null
    resultContainer.classList.add('hidden');
    lessonSelection.classList.remove('hidden');
    dataExportContainer.classList.remove('hidden');
    document.title = "Home - IgboLingo"
}

function resetProgress() {
    if (confirm('Are you sure you want to reset all your progress?')) {
        completedLessons = [];
        saveProgress();
        populateLessonDropdown();
        alert('Progress has been reset.');
    }
}

function exportProgress() {
    const progressData = JSON.stringify({ completedLessons });
    const blob = new Blob([progressData], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'progress.igl';
    link.click();
}

function importProgress(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                completedLessons = importedData.completedLessons || [];
                saveProgress();
                populateLessonDropdown();
                alert('Progress imported successfully!');
            } catch (err) {
                alert('Failed to import progress. Ensure the file is valid.');
                console.error(err);
            }
        };
        reader.readAsText(file);
    }
}

function saveProgress() {
    localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function updateStreakDisplay() {
    streakEl.textContent = `Streak: ${streak}`;
}

startLessonBtn.onclick = startLesson;
nextQuestionBtn.onclick = nextQuestion;
importProgressBtn.addEventListener('change', importProgress);
exportProgressBtn.onclick = exportProgress;
resetProgressBtn.onclick = resetProgress;

document.addEventListener('DOMContentLoaded', async () => {
    await loadWordDictionary(); // Load the dictionary first
    populateLessonDropdown();  // Then populate the dropdown
});
