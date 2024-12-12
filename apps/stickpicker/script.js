let config = JSON.parse(localStorage.getItem('config')) || {};
let data = JSON.parse(localStorage.getItem('data')) || {};
let lastPick = null;

// Load data on page load
window.addEventListener('load', () => {
    if (Object.keys(config).length > 0) {
        enableButtons();
        hideCreateConfig();
    }
});

// Add event listeners
document.getElementById('create-config').addEventListener('click', () => {
    showPrompt('Add Category', 'Enter a new category name:', (category) => {
        if (!config[category]) {
            showPrompt('Add Category', `Enter initial sticks for ${category}:`, (initialSticks) => {
                showPrompt('Add Category', `Enter refill sticks for ${category}:`, (refillSticks) => {
                    if (!isNaN(initialSticks) && !isNaN(refillSticks)) {
                        config[category] = { refill: parseInt(refillSticks, 10), locked: false };
                        data[category] = parseInt(initialSticks, 10);
                        saveData();
                        enableButtons();
                        hideCreateConfig();
                        showAlert('Info', `Category "${category}" added.`);
                    } else {
                        showAlert('Error', 'Invalid input. Try again.');
                    }
                });
            });
        } else {
            showAlert('Error', 'Category already exists.');
        }
    });
});

document.getElementById('pick-stick').addEventListener('click', () => {
    const unlockedCategories = Object.keys(data).filter(cat => !config[cat].locked && data[cat] > 0);
    if (unlockedCategories.length === 0) {
        refillSticks();
        return;
    }

    const randomCategory = unlockedCategories[Math.floor(Math.random() * unlockedCategories.length)];
    data[randomCategory]--;
    lastPick = randomCategory;

    saveData();
    showAlert("Info", `Picked a stick from "${randomCategory}".`);
});

document.getElementById('undo-pick').addEventListener('click', () => {
    if (lastPick) {
        data[lastPick]++;
        saveData();
        showAlert("Info", `Undid the last pick from "${lastPick}".`);
        lastPick = null;
    } else {
        showAlert("Error", "No pick to undo.");
    }
});

document.getElementById('add-category').addEventListener('click', () => {
    showPrompt('Add Category', 'Enter a new category name:', (category) => {
        if (!config[category]) {
            showPrompt('Add Category', `Enter initial sticks for ${category}:`, (initialSticks) => {
                showPrompt('Add Category', `Enter refill sticks for ${category}:`, (refillSticks) => {
                    if (!isNaN(initialSticks) && !isNaN(refillSticks)) {
                        config[category] = { refill: parseInt(refillSticks, 10), locked: false };
                        data[category] = parseInt(initialSticks, 10);
                        saveData();
                        showAlert('Info', `Category "${category}" added.`);
                    } else {
                        showAlert('Error', 'Invalid input. Try again.');
                    }
                });
            });
        } else {
            showAlert('Error', 'Category already exists.');
        }
    });
});


document.getElementById('remove-category').addEventListener('click', () => {
    showPrompt('Remove Category', 'Enter the category name to remove:', (category) => {
        if (config[category]) {
            delete config[category];
            delete data[category];
            saveData();
            showAlert('Info', `Category "${category}" removed.`);
        } else {
            showAlert('Error', 'Category not found.');
        }
    });
});


document.getElementById('edit-category').addEventListener('click', () => {
    showPrompt('Edit Category', 'Enter the category name to edit:', (category) => {
        if (config[category]) {
            showPrompt(
                'Edit Category', 
                `Enter new initial sticks for ${category}:`,
                (newInitialSticks) => {
                    showPrompt(
                        'Edit Category', 
                        `Enter new refill sticks for ${category}:`,
                        (newRefillSticks) => {
                            if (!isNaN(newInitialSticks) && !isNaN(newRefillSticks)) {
                                data[category] = parseInt(newInitialSticks, 10);
                                config[category].refill = parseInt(newRefillSticks, 10);
                                saveData();
                                showAlert('Info', `Category "${category}" updated.`);
                            } else {
                                showAlert('Error', 'Invalid input. Try again.');
                            }
                        }
                    );
                }
            );
        } else {
            showAlert('Error', 'Category not found.');
        }
    });
});


document.getElementById('lock-category').addEventListener('click', () => {
    showPrompt('Lock/Unlock Category', 'Enter the category name to lock/unlock:', (category) => {
        if (config[category]) {
            config[category].locked = !config[category].locked;
            saveData();
            const status = config[category].locked ? 'locked' : 'unlocked';
            showAlert('Info', `Category "${category}" is now ${status}.`);
        } else {
            showAlert('Error', 'Category not found.');
        }
    });
});


document.getElementById('show-categories').addEventListener('click', () => {
    const categoryDetails = Object.keys(config).map(category => {
        const sticks = data[category];
        const refill = config[category].refill;
        const status = config[category].locked ? "Locked" : "Unlocked";
        return `${category}: Sticks = ${sticks}, Refill = ${refill}, Status = ${status}`;
    }).join('\n');

    showAlert("Categories", categoryDetails || "No categories available.");
});

document.getElementById('export-config').addEventListener('click', () => {
    const exportData = { config, data };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'stick_picker_config.json';
    a.click();

    URL.revokeObjectURL(url);
    showAlert("Info", "Configuration exported successfully.");
});

document.getElementById('import-config').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (importedData.config && importedData.data) {
                    config = importedData.config;
                    data = importedData.data;
                    saveData();
                    enableButtons();
                    hideCreateConfig();
                    showAlert("Info", "Configuration imported successfully.");
                } else {
                    showAlert("Error", "Invalid file format.");
                }
            } catch (error) {
                showAlert("Error", "Error reading the file. Ensure it's a valid JSON file.");
            }
        };

        reader.readAsText(file);
    });

    input.click();
});

document.getElementById('reset-config').addEventListener('click', () => {
    let resetMessage = ''
    showPrompt('Reset Config', 'If you want to reset your config, type "RESET FINAL" below.', (resetMessage) => {
        console.log(resetMessage)
        if (resetMessage == 'RESET FINAL') {
            config = {}
            data = {}
            saveData()
            location.reload(true)
        } else {
            showAlert('Info', 'Reset canceled.');
        }
    });
});

document.getElementById('help').addEventListener('click', () => {
    const helpText = `
Stick Picker App Help:
1. Create Config: Create the initial setup by defining categories and sticks.
2. Pick a Stick: Randomly select a stick from an unlocked category.
3. Undo Last Pick: Revert the last stick picked.
4. Add Category: Add a new category with sticks.
5. Remove Category: Delete an existing category.
6. Edit Category: Modify the sticks or refill settings of a category.
7. Lock/Unlock Category: Lock or unlock a category for picking sticks.
8. Show Categories: View details of all categories, including stick counts and lock status.
9. Export Config: Save the current configuration to a file.
10. Import Config: Load a configuration file.
11. Help: Display this help guide.

To start, create a configuration by adding categories with sticks. Use other features to manage your stick-picking process.
    `;
    showAlert("Help", helpText);
});


// Utility Functions
function saveData() {
    localStorage.setItem('config', JSON.stringify(config));
    localStorage.setItem('data', JSON.stringify(data));
}

function enableButtons() {
    document.querySelectorAll('button').forEach(button => {
        if (button.id !== 'create-config') button.disabled = false;
    });
}

function hideCreateConfig() {
    document.getElementById('create-config').style.display = 'none';
}

function refillSticks() {
    Object.keys(config).forEach(cat => {
        if (!config[cat].locked) {
            data[cat] = config[cat].refill;
        }
    });
    saveData();
    showAlert("Info","Refilled all sticks. You can now pull.");
}

function showModal({ title, message, input = false, callback }) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalInputContainer = document.getElementById('modal-input-container');
    const modalInput = document.getElementById('modal-input');
    const modalConfirm = document.getElementById('modal-confirm');
    const modalCancel = document.getElementById('modal-cancel');

    modalTitle.textContent = title || '';
    modalMessage.textContent = message || '';
    modalInputContainer.classList.toggle('hidden', !input); // Show/hide input container based on 'input' flag
    modalInput.value = '';

    modal.classList.remove('hidden');

    function closeModal(result) {
        modal.classList.add('hidden');
        modalConfirm.removeEventListener('click', confirmHandler);
        modalCancel.removeEventListener('click', cancelHandler);
        if (callback) callback(result);
    }

    function confirmHandler() {
        closeModal(input ? modalInput.value : true);
    }

    function cancelHandler() {
        closeModal(null);
    }

    modalConfirm.addEventListener('click', confirmHandler);
    modalCancel.addEventListener('click', cancelHandler);
    modalCancel.classList.toggle('hidden', !input);
}

// Replace alert with showModal for displaying information
function showAlert(title, message) {
    showModal({ title, message, input: false, callback: () => {} });
}

// Replace prompt with showModal for gathering input
function showPrompt(title, message, callback) {
    showModal({
        title,
        message,
        input: true,
        callback: (input) => {
            if (input !== null && input.trim() !== '') {
                callback(input.trim());
            } else if (input !== null) {
                showAlert('Error', 'Input cannot be empty. Please try again.');
            }
        },
    });
}
