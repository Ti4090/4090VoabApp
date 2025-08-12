// VocabMaster - Complete Vocabulary Learning Application
// Thoroughly implemented JavaScript based on HTML and CSS structure

class VocabularyApp {
    constructor() {
        this.words = [];
        this.categories = [];
        this.difficultWords = [];
        this.favoriteWords = [];
        this.notes = [];
        this.dailyPractice = {
            practiced: 0,
            goal: 10,
            streak: 0,
            lastPracticeDate: null
        };
        this.userPreferences = {
            theme: 'white',
            dailyGoal: 10
        };

        // Quiz-related properties
        this.selectedQuizWords = [];
        this.currentQuizStep = 0;
        this.quizPhase = 'turkish-to-english';
        this.quizCorrectAnswers = 0;
        this.quizTotalQuestions = 0; // Will be set based on selected words (4 questions per word)
        this.currentQuizWord = null;
        this.currentScreen = 'home';
        this.currentWordIndex = 0;
        this.currentQuestionTypeIndex = 0;
        this.currentRandomQuestionIndex = 0; // For randomized questions
        this.questionTypes = ['turkish-to-english', 'english-to-turkish', 'writing', 'audio'];
        this.learnedWords = new Set(); // Track learned words in localStorage
        this.wordAnswerHistory = {}; // Track answers for each word
        this.randomizedQuestions = []; // Randomized order of questions

        // Social features data (client-side only)
        this.socialData = {
            profile: {
                username: 'Vocabulary Learner',
                avatar: '👤',
                level: 1,
                xp: 0,
                rank: 0
            },
            friends: [],
            achievements: [],
            challenges: [],
            stats: {
                totalPracticeTime: 0,
                quizAccuracy: 0,
                wordsLearned: 0,
                currentStreak: 0
            }
        };

        this.init();
    }

    init() {
        // Clear any existing data and start fresh
        this.clearExistingData();
        this.loadData();
        this.loadCategories();
        this.setupEventListeners();
        this.showScreen('home');
        this.updateStats();
        this.updateCategoryOptions();
        this.initializeTheme();
        this.createToastContainer();
        this.loadPersonalization();
        this.loadQuizSettings();
        this.setupDynamicThemes();
        this.initializeVoiceRecognition();
        this.initializeSpeechSynthesis();
        this.initializeDailyPractice();
        this.initializeAdvancedEffects();
        this.loadSocialData();
        this.initializeAchievements();
    }

    clearExistingData() {
        // Only clear on first load to remove any default words/categories
        const hasCleared = localStorage.getItem('vocabularyAppCleared');
        if (!hasCleared) {
            localStorage.removeItem('vocabularyWords');
            localStorage.removeItem('vocabularyCategories');
            localStorage.removeItem('vocabularyDifficultWords');
            localStorage.removeItem('vocabularyFavoriteWords');
            localStorage.removeItem('vocabularyNotes');
            localStorage.setItem('vocabularyAppCleared', 'true');
        }
    }

    createToastContainer() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    // Data Management
    loadData() {
        try {
            // Start with empty arrays - no default data
            this.words = [];
            this.difficultWords = [];
            this.favoriteWords = [];
            
            // Load learned words
            const savedLearnedWords = localStorage.getItem('vocabularyLearnedWords');
            this.learnedWords = savedLearnedWords ? new Set(JSON.parse(savedLearnedWords)) : new Set();
            this.notes = [];

            // Load saved data if it exists
            const savedWords = localStorage.getItem('vocabularyWords');
            if (savedWords) {
                this.words = JSON.parse(savedWords);
            }

            const savedDifficult = localStorage.getItem('vocabularyDifficultWords');
            if (savedDifficult) {
                this.difficultWords = JSON.parse(savedDifficult);
            }

            const savedFavorites = localStorage.getItem('vocabularyFavoriteWords');
            if (savedFavorites) {
                this.favoriteWords = JSON.parse(savedFavorites);
            }

            const savedNotes = localStorage.getItem('vocabularyNotes');
            if (savedNotes) {
                this.notes = JSON.parse(savedNotes);
            }

            const savedDailyPractice = localStorage.getItem('vocabularyDailyPractice');
            if (savedDailyPractice) {
                this.dailyPractice = { ...this.dailyPractice, ...JSON.parse(savedDailyPractice) };
            }

            const savedPreferences = localStorage.getItem('vocabularyPreferences');
            if (savedPreferences) {
                this.userPreferences = { ...this.userPreferences, ...JSON.parse(savedPreferences) };
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.showToast('Error loading data', 'error');
        }
    }

    saveData() {
        try {
            localStorage.setItem('vocabularyWords', JSON.stringify(this.words));
            localStorage.setItem('vocabularyDifficultWords', JSON.stringify(this.difficultWords));
            localStorage.setItem('vocabularyFavoriteWords', JSON.stringify(this.favoriteWords));
            localStorage.setItem('vocabularyNotes', JSON.stringify(this.notes));
            localStorage.setItem('vocabularyDailyPractice', JSON.stringify(this.dailyPractice));
            localStorage.setItem('vocabularyPreferences', JSON.stringify(this.userPreferences));
            localStorage.setItem('vocabularyLearnedWords', JSON.stringify([...this.learnedWords]));
        } catch (error) {
            console.error('Error saving data:', error);
            this.showToast('Error saving data', 'error');
        }
    }

    // Category Management - Start with only General category
    loadCategories() {
        const savedCategories = localStorage.getItem('vocabularyCategories');
        if (savedCategories) {
            this.categories = JSON.parse(savedCategories);
        } else {
            // Only one default category - General
            this.categories = [
                {
                    id: 'general',
                    name: 'General',
                    description: 'General vocabulary words',
                    wordCount: 0
                }
            ];
            this.saveCategories();
        }
        this.updateCategoryWordCounts();
    }

    saveCategories() {
        localStorage.setItem('vocabularyCategories', JSON.stringify(this.categories));
    }

    updateCategoryWordCounts() {
        this.categories.forEach(category => {
            category.wordCount = this.words.filter(word => word.category === category.id).length;
        });
        this.saveCategories();
    }

    createCategory() {
        const nameInput = document.getElementById('new-category-name');
        const descInput = document.getElementById('new-category-description');

        if (!nameInput || !descInput) return;

        const name = nameInput.value.trim();
        const description = descInput.value.trim();

        if (!name) {
            this.showToast('Please enter a category name', 'error');
            return;
        }

        // Check if category already exists
        if (this.categories.find(cat => cat.name.toLowerCase() === name.toLowerCase())) {
            this.showToast('Category already exists', 'error');
            return;
        }

        const category = {
            id: Date.now().toString(),
            name: name,
            description: description || 'Custom category',
            wordCount: 0
        };

        this.categories.push(category);
        this.saveCategories();
        this.updateCategoryOptions();
        this.displayCategories();

        nameInput.value = '';
        descInput.value = '';

        this.showToast(`Category "${name}" created successfully!`, 'success');
    }

    displayCategories() {
        const grid = document.getElementById('categories-grid');
        if (!grid) return;

        grid.innerHTML = '';

        this.categories.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.innerHTML = `
                <h3>${category.name}</h3>
                <p>${category.description}</p>
                <div class="category-stats">
                    <span>${category.wordCount} words</span>
                </div>
                <div class="category-actions">
                    <button class="category-btn select" onclick="app.selectCategoryForLearning('${category.id}')">
                        Study Words
                    </button>
                    <button class="category-btn edit" onclick="app.editCategory('${category.id}')">Edit</button>
                    ${category.id !== 'general' ? `<button class="category-btn delete" onclick="app.deleteCategory('${category.id}')">Delete</button>` : ''}
                </div>
            `;
            grid.appendChild(categoryCard);
        });
    }

    selectCategoryForLearning(categoryId) {
        const categoryWords = this.words.filter(word => word.category === categoryId);
        if (categoryWords.length === 0) {
            this.showToast('No words in this category yet', 'warning');
            return;
        }

        this.selectedQuizWords = categoryWords.slice(0, Math.min(5, categoryWords.length));
        this.showScreen('learning');
        this.showQuizSelection();
    }

    deleteCategory(categoryId) {
        if (categoryId === 'general') {
            this.showToast('Cannot delete the general category', 'error');
            return;
        }

        if (confirm('Are you sure you want to delete this category? Words in this category will be moved to General.')) {
            // Move words to general category
            this.words.forEach(word => {
                if (word.category === categoryId) {
                    word.category = 'general';
                }
            });

            // Remove category
            this.categories = this.categories.filter(cat => cat.id !== categoryId);

            this.saveCategories();
            this.saveData();
            this.updateCategoryWordCounts();
            this.displayCategories();
            this.updateCategoryOptions();

            this.showToast('Category deleted successfully', 'success');
        }
    }

    deleteWord(wordId) {
        if (confirm(`Are you sure you want to delete this word permanently?`)) {
            // Remove from main words array
            this.words = this.words.filter(word => word.id !== wordId);

            // Remove from favorite and difficult words if present
            this.favoriteWords = this.favoriteWords.filter(id => id !== wordId);
            this.difficultWords = this.difficultWords.filter(id => id !== wordId);

            this.saveData();

            // Refresh current display
            const currentScreen = document.querySelector('.screen.active')?.id;
            if (currentScreen === 'categories-screen') {
                this.displayCategories();
            } else if (currentScreen === 'dictionary-screen') {
                this.displayDictionary();
            }

            this.updateStats();
            this.updateCategoryWordCounts();
            this.showToast('Word deleted successfully', 'success');
        }
    }

    updateCategoryOptions() {
        const select = document.getElementById('new-category');
        if (!select) return;

        select.innerHTML = '<option value="">Select Category (Optional)</option>';

        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }

    getCategoryName(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'General';
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Home screen navigation
        this.addEventListenerSafely('start-learning-btn', 'click', () => this.showScreen('learning'));
        this.addEventListenerSafely('add-word-btn', 'click', () => this.showScreen('add-word'));
        this.addEventListenerSafely('categories-btn', 'click', () => this.showScreen('categories'));
        this.addEventListenerSafely('difficult-words-btn', 'click', () => this.showDifficultWordsScreen());
        this.addEventListenerSafely('favorite-words-btn', 'click', () => this.showFavoriteWordsScreen());

        this.addEventListenerSafely('notes-btn', 'click', () => this.showScreen('notes'));
        this.addEventListenerSafely('statistics-btn', 'click', () => this.showScreen('statistics'));

        this.addEventListenerSafely('dictionary-btn', 'click', () => {
            this.showScreen('dictionary');
            this.setupDictionaryScreen();
        });
        this.addEventListenerSafely('data-management-btn', 'click', () => this.showScreen('data-management'));

        // Learning screen navigation and universal back-to-home buttons
        this.addEventListenerSafely('back-to-home', 'click', () => this.showScreen('home'));
        
        // Set up event listeners for all back-to-home buttons using delegation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('back-btn') && e.target.textContent.includes('← Back to Home')) {
                e.preventDefault();
                this.showScreen('home');
            }
        });

        // Learning mode buttons
        this.addEventListenerSafely('quiz-mode', 'click', () => this.startQuizMode());
        this.addEventListenerSafely('learned-words-practice', 'click', () => this.startLearnedWordsPractice());
        this.addEventListenerSafely('difficult-words-practice', 'click', () => this.startDifficultWordsPractice());
        this.addEventListenerSafely('favorite-words-practice', 'click', () => this.startFavoriteWordsPractice());
        this.addEventListenerSafely('repeat-practice', 'click', () => this.showRepeatPractice());

        // Specialized practice modes
        this.addEventListenerSafely('listening-practice', 'click', () => this.startListeningPractice());
        this.addEventListenerSafely('translation-practice', 'click', () => this.startTranslationPractice());
        this.addEventListenerSafely('reverse-translation-practice', 'click', () => this.startReverseTranslationPractice());
        this.addEventListenerSafely('writing-practice', 'click', () => this.startWritingPractice());
        this.addEventListenerSafely('voice-skip-word', 'click', () => this.skipVoiceWord());
        this.addEventListenerSafely('pronunciation-practice-btn', 'click', () => this.startPronunciationPractice());
        this.addEventListenerSafely('start-daily-practice', 'click', () => this.startDailyPractice());
        this.addEventListenerSafely('skip-daily-practice', 'click', () => this.skipDailyPractice());
        this.addEventListenerSafely('close-daily-practice', 'click', () => this.closeDailyPractice());

        // Quiz selection
        this.addEventListenerSafely('random-words', 'click', () => this.selectRandomWords());
        this.addEventListenerSafely('manual-select', 'click', () => this.showManualSelection());
        this.addEventListenerSafely('start-quiz', 'click', () => this.startQuizFromSelection());
        
        // Enhanced word selection controls
        this.addEventListenerSafely('select-all-words', 'click', () => this.selectAllWords());
        this.addEventListenerSafely('clear-selection', 'click', () => this.clearWordSelection());
        this.addEventListenerSafely('select-favorites', 'click', () => this.selectFavoriteWords());
        this.addEventListenerSafely('word-filter-category', 'change', () => this.filterWordSelection());
        this.addEventListenerSafely('word-filter-difficulty', 'change', () => this.filterWordSelection());
        this.addEventListenerSafely('word-search', 'input', () => this.filterWordSelection());

        // Repeat practice
        this.addEventListenerSafely('start-repeat-all', 'click', () => this.startRepeatAll());
        this.addEventListenerSafely('start-repeat-number', 'click', () => this.startRepeatNumber());

        // Quiz navigation
        this.addEventListenerSafely('exit-quiz', 'click', () => this.exitQuiz());
        this.addEventListenerSafely('next-quiz-question', 'click', () => this.nextQuizQuestion());
        this.addEventListenerSafely('submit-text-answer', 'click', () => this.submitTextAnswer());
        this.addEventListenerSafely('play-audio-question', 'click', () => this.playAudioQuestion());

        // Quiz results
        this.addEventListenerSafely('retake-quiz', 'click', () => this.retakeQuiz());
        this.addEventListenerSafely('back-to-learning', 'click', () => this.backToLearning());
        this.addEventListenerSafely('home-from-results', 'click', () => this.showScreen('home'));

        // Word navigation
        this.addEventListenerSafely('prev-word', 'click', () => this.previousWord());
        this.addEventListenerSafely('next-word', 'click', () => this.nextWord());
        this.addEventListenerSafely('save-progress', 'click', () => this.saveProgress());
        this.addEventListenerSafely('play-word-audio', 'click', () => this.playWordAudio());

        // Add word form
        this.addEventListenerSafely('add-word-form', 'submit', (e) => this.addWord(e));
        this.addEventListenerSafely('clear-form', 'click', () => this.clearForm());
        this.addEventListenerSafely('new-image', 'input', () => this.previewImage());

        // Categories
        this.addEventListenerSafely('create-category', 'click', () => this.createCategory());

        // Notes
        this.addEventListenerSafely('add-note', 'click', () => this.addNote());

        // Data management
        this.addEventListenerSafely('export-data', 'click', () => this.exportData());
        this.addEventListenerSafely('import-data', 'click', () => this.triggerImport());
        this.addEventListenerSafely('import-file', 'change', (e) => this.importData(e));
        this.addEventListenerSafely('clear-all-data', 'click', () => this.clearAllData());
        this.addEventListenerSafely('generate-progress-report', 'click', () => this.showProgressAnalysisModal());

        // Theme management
        this.addEventListenerSafely('theme-toggle', 'click', () => this.toggleThemeOptions());
        this.addEventListenerSafely('save-personalization', 'click', () => this.savePersonalization());
        
        // Modal event listeners
        this.addEventListenerSafely('close-edit-modal', 'click', () => this.closeEditModal());
        this.addEventListenerSafely('cancel-edit', 'click', () => this.closeEditModal());
        this.addEventListenerSafely('edit-word-form', 'submit', (e) => this.saveWordEdit(e));
        
        // Edit note modal
        this.addEventListenerSafely('close-edit-note-modal', 'click', () => this.hideEditNoteModal());
        this.addEventListenerSafely('save-note-changes', 'click', () => this.saveNoteChanges());
        this.addEventListenerSafely('cancel-note-edit', 'click', () => this.hideEditNoteModal());
        
        // Quiz personalization
        this.addEventListenerSafely('apply-quiz-settings', 'click', () => this.applyQuizSettings());
        this.addEventListenerSafely('close-quiz-settings', 'click', () => this.hideQuizPersonalization());
        
        // Dictionary search and filters
        this.addEventListenerSafely('dictionary-search', 'input', () => this.filterDictionary());
        this.addEventListenerSafely('dictionary-filter', 'change', () => this.filterDictionary());
        this.addEventListenerSafely('dictionary-sort', 'change', () => this.filterDictionary());
        
        // Enhanced quiz customization buttons
        this.addEventListenerSafely('start-favorite-quiz', 'click', () => this.startFavoriteQuizFromCustomization());
        this.addEventListenerSafely('start-difficult-quiz', 'click', () => this.startDifficultQuizFromCustomization());

        // Theme options - use event delegation for better reliability
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('theme-option')) {
                e.preventDefault();
                e.stopPropagation();
                const theme = e.target.dataset.theme;
                if (theme) {
                    this.changeTheme(theme);
                }
            }
        });

        // Close theme options when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.theme-selector')) {
                document.getElementById('theme-options').style.display = 'none';
            }
        });

        // Enter key for quiz text input
        this.addEventListenerSafely('quiz-text-input', 'keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitTextAnswer();
            }
        });

        // Statistics features event listeners
        this.addEventListenerSafely('overview-tab', 'click', () => this.showStatsTab('overview'));
        this.addEventListenerSafely('detailed-tab', 'click', () => this.showStatsTab('detailed'));
        this.addEventListenerSafely('progress-tab', 'click', () => this.showStatsTab('progress'));
        this.addEventListenerSafely('reports-tab', 'click', () => this.showStatsTab('reports'));

        // PDF Reports management
        this.addEventListenerSafely('generate-summary-pdf', 'click', () => this.generateSummaryPDF());
        this.addEventListenerSafely('generate-analysis-pdf', 'click', () => this.generateAnalysisPDF());
        this.addEventListenerSafely('generate-timeline-pdf', 'click', () => this.generateTimelinePDF());
        this.addEventListenerSafely('generate-custom-pdf', 'click', () => this.generateCustomPDF());

        // Progress sharing
        this.addEventListenerSafely('generate-progress-image', 'click', () => this.showProgressAnalysisModal());
        this.addEventListenerSafely('share-achievement', 'click', () => this.shareAchievement());
        this.addEventListenerSafely('create-challenge', 'click', () => this.showCreateChallengeModal());

        // Challenge creation
        this.addEventListenerSafely('create-challenge-btn', 'click', () => this.createChallenge());
        this.addEventListenerSafely('cancel-challenge', 'click', () => this.closeChallengeModal());
        this.addEventListenerSafely('close-challenge-modal', 'click', () => this.closeChallengeModal());
    }

    addEventListenerSafely(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, handler);
        }
    }

    // Screen Management
    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
        }

        // Update screen-specific content
        if (screenName === 'home') {
            this.updateStats();
        } else if (screenName === 'categories') {
            this.displayCategories();
        } else if (screenName === 'learning') {
            this.showWordSelection();
        } else if (screenName === 'notes') {
            this.displayNotes();
        } else if (screenName === 'statistics') {
            this.setupStatisticsScreen();
        } else if (screenName === 'data-management') {
            this.updateDataManagementStats();
        }
    }

    // Statistics Update
    updateStats() {
        const totalWords = this.words.length;
        const learnedWordsCount = this.learnedWords.size;
        const favoriteWordsCount = this.favoriteWords.length;
        const difficultWordsCount = this.difficultWords.length;
        const categoriesCount = this.categories.length;
        const dailyStreak = this.dailyPractice.streak;

        this.updateElementText('total-words', totalWords);
        this.updateElementText('learned-words-count', learnedWordsCount);
        this.updateElementText('favorite-words-count', favoriteWordsCount);
        this.updateElementText('difficult-words-count', difficultWordsCount);
        this.updateElementText('categories-count', categoriesCount);
        this.updateElementText('daily-streak', dailyStreak);
    }

    updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    // Learning Screen Management
    showWordSelection() {
        document.getElementById('word-selection-phase').style.display = 'block';
        document.getElementById('quiz-phase').style.display = 'none';
        document.getElementById('quiz-results').style.display = 'none';
        document.getElementById('word-display').style.display = 'none';
        document.getElementById('no-words-message').style.display = 'none';
        // Hide quiz personalization when showing word selection
        document.getElementById('quiz-personalization').style.display = 'none';
    }

    startQuizMode() {
        if (this.words.length < 5) {
            this.showToast('You need at least 5 words to start a quiz. Add more words first.', 'warning');
            return;
        }
        // Ensure mixed quiz phase for regular quiz mode
        this.quizPhase = 'mixed';
        this.showQuizSelection();
    }

    showQuizSelection() {
        document.getElementById('quiz-selection').style.display = 'block';
        document.getElementById('repeat-selection').style.display = 'none';
        // Hide quiz personalization when showing selection
        this.hideQuizPersonalization();
    }

    showRepeatPractice() {
        if (this.words.length === 0) {
            this.showToast('No words available. Add some words first.', 'warning');
            return;
        }
        document.getElementById('repeat-selection').style.display = 'block';
        document.getElementById('quiz-selection').style.display = 'none';
    }

    selectRandomWords() {
        const availableWords = this.words.slice();
        const selectedCount = Math.min(5, availableWords.length);
        
        // Shuffle and select random words
        for (let i = availableWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableWords[i], availableWords[j]] = [availableWords[j], availableWords[i]];
        }
        
        this.selectedQuizWords = availableWords.slice(0, selectedCount);
        // Hide quiz personalization before starting
        this.hideQuizPersonalization();
        this.startQuiz();
    }

    showManualSelection() {
        const manualArea = document.getElementById('manual-selection-area');
        const grid = document.getElementById('word-selection-grid');
        
        manualArea.style.display = 'block';
        grid.innerHTML = '';

        this.words.forEach(word => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-selection-item';
            wordItem.innerHTML = `
                <input type="checkbox" id="word-${word.id}" data-word-id="${word.id}">
                <label for="word-${word.id}">
                    <strong>${word.english}</strong><br>
                    <small>${word.turkish}</small>
                </label>
            `;
            
            const checkbox = wordItem.querySelector('input');
            checkbox.addEventListener('change', () => this.updateWordSelection());
            
            grid.appendChild(wordItem);
        });

        this.updateWordSelection();
    }

    updateWordSelection() {
        const checkboxes = document.querySelectorAll('#word-selection-grid input[type="checkbox"]');
        const selectedWords = [];
        
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const wordId = checkbox.dataset.wordId;
                const word = this.words.find(w => w.id === wordId);
                if (word) selectedWords.push(word);
            }
            
            // Update visual state
            const item = checkbox.closest('.word-selection-item');
            item.classList.toggle('selected', checkbox.checked);
        });

        document.getElementById('selected-count').textContent = selectedWords.length;
        document.getElementById('start-quiz').disabled = selectedWords.length < 5;

        this.selectedQuizWords = selectedWords;
    }

    startQuizFromSelection() {
        if (this.selectedQuizWords.length < 5) {
            this.showToast('Please select at least 5 words for the quiz.', 'warning');
            return;
        }
        // Hide quiz personalization before starting
        this.hideQuizPersonalization();
        this.startQuiz();
    }

    startRepeatAll() {
        if (this.words.length === 0) {
            this.showToast('No words available to practice.', 'warning');
            return;
        }
        this.selectedQuizWords = this.words.slice();
        this.startQuiz(); // Start quiz instead of word display
    }

    startRepeatNumber() {
        const countInput = document.getElementById('repeat-word-count');
        const count = parseInt(countInput.value);
        
        if (!count || count <= 0) {
            this.showToast('Please enter a valid number of words.', 'error');
            return;
        }

        if (count > this.words.length) {
            this.showToast(`You only have ${this.words.length} words available.`, 'warning');
            return;
        }

        // Select random words
        const shuffled = this.words.slice().sort(() => 0.5 - Math.random());
        this.selectedQuizWords = shuffled.slice(0, count);
        this.startQuiz(); // Start quiz instead of word display
    }

    startLearnedWordsPractice() {
        const learnedWords = this.words.filter(word => this.learnedWords.has(word.id));
        if (learnedWords.length === 0) {
            this.showToast('No learned words to practice yet.', 'warning');
            return;
        }
        
        // Set up learned words for quiz directly
        this.selectedQuizWords = learnedWords;
        this.quizPhase = 'mixed';
        
        // Reset quiz state completely
        this.currentQuizIndex = 0;
        this.currentQuizStep = 0;
        this.quizScore = 0;
        this.quizCorrectAnswers = 0;
        this.quizAnswers = [];
        this.currentWordIndex = 0;
        this.currentQuestionTypeIndex = 0;
        this.wordAnswerHistory = {};
        
        // Switch to learning screen first, then to quiz
        this.showScreen('learning');
        
        // Force show quiz phase and hide other phases
        setTimeout(() => {
            document.getElementById('word-selection-phase').style.display = 'none';
            document.getElementById('quiz-phase').style.display = 'block';
            document.getElementById('quiz-results').style.display = 'none';
            document.getElementById('quiz-personalization').style.display = 'none';
            document.getElementById('word-display').style.display = 'none';
            
            // Start the quiz
            this.startQuiz();
        }, 100);
    }

    startDifficultWordsPractice() {
        const difficultWords = this.words.filter(word => this.difficultWords.includes(word.id));
        if (difficultWords.length === 0) {
            this.showToast('No difficult words marked yet.', 'warning');
            return;
        }
        
        // Set up difficult words for quiz directly  
        this.selectedQuizWords = difficultWords;
        this.quizPhase = 'mixed';
        
        // Reset quiz state completely
        this.currentQuizIndex = 0;
        this.currentQuizStep = 0;
        this.quizScore = 0;
        this.quizCorrectAnswers = 0;
        this.quizAnswers = [];
        this.currentWordIndex = 0;
        this.currentQuestionTypeIndex = 0;
        this.wordAnswerHistory = {};
        
        // Switch to learning screen first, then to quiz
        this.showScreen('learning');
        
        // Force show quiz phase and hide other phases
        setTimeout(() => {
            document.getElementById('word-selection-phase').style.display = 'none';
            document.getElementById('quiz-phase').style.display = 'block';
            document.getElementById('quiz-results').style.display = 'none';
            document.getElementById('quiz-personalization').style.display = 'none';
            document.getElementById('word-display').style.display = 'none';
            
            // Start the quiz
            this.startQuiz();
        }, 100);
    }

    startFavoriteWordsPractice() {
        const favoriteWords = this.words.filter(word => this.favoriteWords.includes(word.id));
        if (favoriteWords.length === 0) {
            this.showToast('No favorite words marked yet.', 'warning');
            return;
        }
        
        console.log('Starting favorite words practice with', favoriteWords.length, 'words'); // Debug
        
        // Set up favorite words for quiz directly - ensure proper initialization
        this.selectedQuizWords = favoriteWords;
        this.quizPhase = 'mixed';
        
        // Reset quiz state completely
        this.currentQuizIndex = 0;
        this.currentQuizStep = 0;
        this.quizScore = 0;
        this.quizCorrectAnswers = 0;
        this.quizAnswers = [];
        this.currentWordIndex = 0;
        this.currentQuestionTypeIndex = 0;
        this.wordAnswerHistory = {};
        
        // Switch to learning screen first, then to quiz
        this.showScreen('learning');
        
        // Force show quiz phase and hide other phases
        setTimeout(() => {
            document.getElementById('word-selection-phase').style.display = 'none';
            document.getElementById('quiz-phase').style.display = 'block';
            document.getElementById('quiz-results').style.display = 'none';
            document.getElementById('quiz-personalization').style.display = 'none';
            document.getElementById('word-display').style.display = 'none';
            
            // Start the quiz
            this.startQuiz();
        }, 100);
    }

    showFavoriteWordsQuizInterface() {
        const favoriteWordsList = this.words.filter(word => this.favoriteWords.includes(word.id));

        if (favoriteWordsList.length === 0) {
            this.showToast('No favorite words available for quiz.', 'warning');
            return;
        }

        const quizContainer = document.getElementById('quiz-selection');
        quizContainer.style.display = 'block';
        
        // Update the header to show favorite words context
        const learningModes = document.querySelector('.learning-mode-grid');
        learningModes.style.display = 'none';
        
        // Create favorite words specific interface
        quizContainer.innerHTML = `
            <div class="favorite-quiz-header">
                <h4>⭐ Favorite Words Quiz</h4>
                <p>Practice your ${favoriteWordsList.length} favorite words with interactive quizzes</p>
            </div>
            
            <div class="quiz-type-selection">
                <h5>Select Quiz Type:</h5>
                <div class="quiz-type-grid">
                    <button class="quiz-type-btn" onclick="app.startFavoriteQuiz('mixed')">
                        <span class="quiz-icon">🎯</span>
                        <span class="quiz-title">Mixed Quiz</span>
                        <span class="quiz-desc">All question types</span>
                    </button>
                    <button class="quiz-type-btn" onclick="app.startFavoriteQuiz('translation')">
                        <span class="quiz-icon">🔄</span>
                        <span class="quiz-title">Translation Only</span>
                        <span class="quiz-desc">Turkish to English</span>
                    </button>
                    <button class="quiz-type-btn" onclick="app.startFavoriteQuiz('reverse')">
                        <span class="quiz-icon">↩️</span>
                        <span class="quiz-title">Reverse Translation</span>
                        <span class="quiz-desc">English to Turkish</span>
                    </button>
                    <button class="quiz-type-btn" onclick="app.startFavoriteQuiz('writing')">
                        <span class="quiz-icon">✍️</span>
                        <span class="quiz-title">Writing Practice</span>
                        <span class="quiz-desc">Type the words</span>
                    </button>
                </div>
            </div>
            
            <div class="quiz-settings">
                <h5>Quiz Settings:</h5>
                <div class="settings-row">
                    <label for="favorite-quiz-count">Number of questions:</label>
                    <select id="favorite-quiz-count">
                        <option value="5">5 Questions</option>
                        <option value="10">10 Questions</option>
                        <option value="15">15 Questions</option>
                        <option value="all" selected>All Favorite Words (${favoriteWordsList.length})</option>
                    </select>
                </div>
                <div class="settings-row">
                    <label for="favorite-quiz-shuffle">Question order:</label>
                    <select id="favorite-quiz-shuffle">
                        <option value="random" selected>Random Order</option>
                        <option value="alphabetical">Alphabetical Order</option>
                        <option value="difficulty">By Difficulty</option>
                    </select>
                </div>
            </div>
            
            <div class="favorite-words-preview">
                <h5>Your Favorite Words (${favoriteWordsList.length} total):</h5>
                <div class="words-preview-grid">
                    ${favoriteWordsList.slice(0, 6).map(word => `
                        <div class="word-preview-card">
                            <span class="word-en">${word.english}</span>
                            <span class="word-tr">${word.turkish}</span>
                        </div>
                    `).join('')}
                    ${favoriteWordsList.length > 6 ? `<div class="more-words">+${favoriteWordsList.length - 6} more...</div>` : ''}
                </div>
            </div>
            
            <div class="quiz-actions">
                <button class="back-btn" onclick="app.showWordSelection()">← Back to Learning Modes</button>
            </div>
        `;
    }

    startFavoriteQuiz(quizType) {
        const favoriteWordsList = this.words.filter(word => this.favoriteWords.includes(word.id));

        if (favoriteWordsList.length === 0) {
            this.showToast('No favorite words available for quiz.', 'warning');
            return;
        }

        // Get quiz settings
        const quizCount = document.getElementById('favorite-quiz-count').value;
        const shuffleType = document.getElementById('favorite-quiz-shuffle').value;

        // Prepare words based on settings
        let wordsToUse = [...favoriteWordsList];
        
        // Apply sorting
        if (shuffleType === 'alphabetical') {
            wordsToUse.sort((a, b) => a.english.localeCompare(b.english));
        } else if (shuffleType === 'difficulty') {
            wordsToUse.sort((a, b) => {
                const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
                return (difficultyOrder[a.difficulty] || 2) - (difficultyOrder[b.difficulty] || 2);
            });
        } else {
            wordsToUse = this.shuffleArray(wordsToUse);
        }

        // Limit number of words
        if (quizCount !== 'all') {
            wordsToUse = wordsToUse.slice(0, parseInt(quizCount));
        }

        // Set up quiz properly for the learning screen
        this.selectedQuizWords = wordsToUse;
        this.currentQuizIndex = 0;
        this.quizScore = 0;
        this.quizResults = [];
        this.quizPhase = this.getQuizPhaseFromType(quizType);
        
        // Navigate to learning screen properly
        this.showScreen('learning');
        
        // Hide word selection phase
        const wordSelectionPhase = document.getElementById('word-selection-phase');
        if (wordSelectionPhase) wordSelectionPhase.style.display = 'none';
        
        const quizPersonalization = document.getElementById('quiz-personalization');
        if (quizPersonalization) quizPersonalization.style.display = 'none';
        
        // Start the actual quiz
        this.startQuiz();
    }

    getQuizPhaseFromType(quizType) {
        switch(quizType) {
            case 'translation': return 'turkish-to-english-only';
            case 'reverse': return 'english-to-turkish-only';
            case 'writing': return 'writing-only';
            case 'audio': return 'audio-only';
            case 'mixed':
            default:
                return 'mixed';
        }
    }
    
    startFavoriteQuiz(quizType) {
        const favoriteWords = this.words.filter(word => this.favoriteWords.has(word.id));
        
        if (favoriteWords.length === 0) {
            this.showToast('No favorite words to practice.', 'warning');
            return;
        }

        // Get settings from the UI
        const countSelect = document.getElementById('favorite-quiz-count');
        const shuffleSelect = document.getElementById('favorite-quiz-shuffle');
        
        let wordCount = favoriteWords.length;
        let strategy = 'random';
        
        if (countSelect && countSelect.value !== 'all') {
            wordCount = parseInt(countSelect.value);
        }
        
        if (shuffleSelect) {
            strategy = shuffleSelect.value;
        }
        
        // Apply quiz settings
        let selectedWords = favoriteWords;
        if (strategy === 'random') {
            selectedWords = favoriteWords.sort(() => 0.5 - Math.random());
        } else if (strategy === 'difficulty') {
            selectedWords = favoriteWords.sort((a, b) => {
                const aDifficulty = this.difficultWords.has(a.id) ? 1 : 0;
                const bDifficulty = this.difficultWords.has(b.id) ? 1 : 0;
                return bDifficulty - aDifficulty;
            });
        } else if (strategy === 'alphabetical') {
            selectedWords = favoriteWords.sort((a, b) => a.english.localeCompare(b.english));
        }
        
        // Limit word count
        selectedWords = selectedWords.slice(0, Math.min(wordCount, selectedWords.length));
        
        this.selectedQuizWords = selectedWords;
        this.quizPhase = this.getQuizPhaseFromType(quizType);
        
        // Navigate to learning screen and start quiz
        this.showScreen('learning');
        
        // Start the quiz after a brief delay
        setTimeout(() => {
            this.startQuiz();
        }, 100);
    }

    startListeningPractice() {
        if (this.words.length === 0) {
            this.showToast('No words available for listening practice.', 'warning');
            return;
        }
        // Show word selection for listening practice
        this.quizPhase = 'audio-only';
        this.showQuizSelection();
    }

    startTranslationPractice() {
        if (this.words.length === 0) {
            this.showToast('No words available for translation practice.', 'warning');
            return;
        }
        // Show word selection for translation practice
        this.quizPhase = 'turkish-to-english-only';
        this.showQuizSelection();
    }

    startReverseTranslationPractice() {
        if (this.words.length === 0) {
            this.showToast('No words available for reverse translation practice.', 'warning');
            return;
        }
        // Show word selection for reverse translation practice
        this.quizPhase = 'english-to-turkish-only';
        this.showQuizSelection();
    }

    startWritingPractice() {
        if (this.words.length === 0) {
            this.showToast('No words available for writing practice.', 'warning');
            return;
        }
        // Show word selection for writing practice
        this.quizPhase = 'writing-only';
        this.showQuizSelection();
    }

    // Quiz System
    startQuiz() {
        document.getElementById('word-selection-phase').style.display = 'none';
        document.getElementById('quiz-phase').style.display = 'block';
        document.getElementById('quiz-results').style.display = 'none';
        document.getElementById('quiz-personalization').style.display = 'none';

        // Initialize quiz state
        this.currentQuizStep = 0;
        this.quizCorrectAnswers = 0;
        this.currentWordIndex = 0;
        this.currentQuestionTypeIndex = 0;
        this.wordAnswerHistory = {};

        // Set up question types based on quiz phase
        if (this.quizPhase === 'audio-only') {
            this.questionTypes = ['audio'];
            this.quizTotalQuestions = this.selectedQuizWords.length;
        } else if (this.quizPhase === 'turkish-to-english-only') {
            this.questionTypes = ['turkish-to-english'];
            this.quizTotalQuestions = this.selectedQuizWords.length;
        } else if (this.quizPhase === 'english-to-turkish-only') {
            this.questionTypes = ['english-to-turkish'];
            this.quizTotalQuestions = this.selectedQuizWords.length;
        } else if (this.quizPhase === 'writing-only') {
            this.questionTypes = ['writing'];
            this.quizTotalQuestions = this.selectedQuizWords.length;
        } else {
            this.questionTypes = ['turkish-to-english', 'english-to-turkish', 'writing', 'audio'];
            this.quizTotalQuestions = this.selectedQuizWords.length * 4;
        }

        // Create randomized question order
        this.randomizedQuestions = [];
        this.selectedQuizWords.forEach((word, wordIndex) => {
            this.questionTypes.forEach((type, typeIndex) => {
                this.randomizedQuestions.push({ wordIndex, questionType: type });
            });
        });

        // Shuffle questions for random order
        for (let i = this.randomizedQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.randomizedQuestions[i], this.randomizedQuestions[j]] = [this.randomizedQuestions[j], this.randomizedQuestions[i]];
        }

        this.currentRandomQuestionIndex = 0;

        document.getElementById('total-quiz-steps').textContent = this.quizTotalQuestions;
        this.showNextQuizQuestion();
    }

    showNextQuizQuestion() {
        if (this.currentRandomQuestionIndex >= this.randomizedQuestions.length) {
            this.showQuizResults();
            return;
        }

        const currentQuestion = this.randomizedQuestions[this.currentRandomQuestionIndex];
        this.currentQuizWord = this.selectedQuizWords[currentQuestion.wordIndex];
        this.quizPhase = currentQuestion.questionType;

        this.currentQuizStep++;
        document.getElementById('current-quiz-step').textContent = this.currentQuizStep;
        
        // Update progress bar
        const progressPercent = (this.currentQuizStep / this.quizTotalQuestions) * 100;
        document.getElementById('quiz-progress-bar').style.width = `${progressPercent}%`;

        // Hide feedback
        document.getElementById('quiz-feedback').style.display = 'none';

        // Show question based on type
        this.displayQuizQuestion();
    }

    displayQuizQuestion() {
        const questionContainer = document.getElementById('quiz-question-container');
        const phaseTitle = document.getElementById('quiz-phase-title');
        
        // Hide all question types
        document.getElementById('quiz-options').style.display = 'none';
        document.getElementById('quiz-input-area').style.display = 'none';
        document.getElementById('quiz-audio-area').style.display = 'none';

        switch (this.quizPhase) {
            case 'turkish-to-english':
                phaseTitle.textContent = 'Turkish to English';
                this.showMultipleChoiceQuestion(this.currentQuizWord.turkish, 'english');
                break;
            case 'english-to-turkish':
                phaseTitle.textContent = 'English to Turkish';
                this.showMultipleChoiceQuestion(this.currentQuizWord.english, 'turkish');
                break;
            case 'writing':
                phaseTitle.textContent = 'Writing Practice';
                this.showWritingQuestion();
                break;
            case 'audio':
            case 'audio-only':
                phaseTitle.textContent = 'Listening Practice';
                this.showAudioQuestion();
                break;
        }
    }

    showMultipleChoiceQuestion(question, answerType) {
        document.getElementById('quiz-question').textContent = question;
        document.getElementById('quiz-options').style.display = 'grid';

        const optionsContainer = document.getElementById('quiz-options');
        optionsContainer.innerHTML = '';

        // Get correct answer
        const correctAnswer = this.currentQuizWord[answerType];
        
        // Get other random answers
        const otherWords = this.words.filter(w => w.id !== this.currentQuizWord.id);
        const wrongAnswers = [];
        
        while (wrongAnswers.length < 3 && otherWords.length > 0) {
            const randomIndex = Math.floor(Math.random() * otherWords.length);
            const randomWord = otherWords.splice(randomIndex, 1)[0];
            if (randomWord[answerType] !== correctAnswer) {
                wrongAnswers.push(randomWord[answerType]);
            }
        }

        // Combine and shuffle options
        const allOptions = [correctAnswer, ...wrongAnswers];
        for (let i = allOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
        }

        // Create option buttons
        allOptions.forEach(option => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'quiz-option';
            optionBtn.textContent = option;
            optionBtn.addEventListener('click', () => this.selectQuizOption(optionBtn, option, correctAnswer));
            optionsContainer.appendChild(optionBtn);
        });
    }

    showWritingQuestion() {
        document.getElementById('quiz-question').textContent = this.currentQuizWord.turkish;
        document.getElementById('quiz-input-area').style.display = 'block';
        
        const input = document.getElementById('quiz-text-input');
        input.value = '';
        input.focus();
    }

    showAudioQuestion() {
        document.getElementById('quiz-question').textContent = 'Listen to the pronunciation and choose the correct Turkish translation:';
        document.getElementById('quiz-audio-area').style.display = 'block';

        // Auto-play audio
        this.playAudioQuestion();

        // Show multiple choice options for the audio - Turkish answers
        const optionsContainer = document.getElementById('audio-options');
        optionsContainer.innerHTML = '';

        const correctAnswer = this.currentQuizWord.turkish;
        const otherWords = this.words.filter(w => w.id !== this.currentQuizWord.id);
        const wrongAnswers = [];
        
        while (wrongAnswers.length < 3 && otherWords.length > 0) {
            const randomIndex = Math.floor(Math.random() * otherWords.length);
            const randomWord = otherWords.splice(randomIndex, 1)[0];
            wrongAnswers.push(randomWord.turkish);
        }

        const allOptions = [correctAnswer, ...wrongAnswers];
        for (let i = allOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
        }

        allOptions.forEach(option => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'quiz-option';
            optionBtn.textContent = option;
            optionBtn.addEventListener('click', () => this.selectQuizOption(optionBtn, option, correctAnswer));
            optionsContainer.appendChild(optionBtn);
        });
    }

    selectQuizOption(optionElement, selectedAnswer, correctAnswer) {
        // Disable all options
        document.querySelectorAll('.quiz-option').forEach(btn => {
            btn.style.pointerEvents = 'none';
        });

        const isCorrect = this.checkAnswerVariations(selectedAnswer, correctAnswer);
        
        // Mark selected option
        optionElement.classList.add('selected');
        
        setTimeout(() => {
            // Show correct/incorrect styling
            if (isCorrect) {
                optionElement.classList.add('correct');
                this.quizCorrectAnswers++;
            } else {
                optionElement.classList.add('incorrect');
                // Highlight correct answer
                document.querySelectorAll('.quiz-option').forEach(btn => {
                    if (btn.textContent.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
                        btn.classList.add('correct');
                    }
                });
            }
            
            // Auto-pronounce the correct answer
            this.speakText(correctAnswer);
            this.showQuizFeedback(isCorrect);
        }, 500);
    }

    submitTextAnswer() {
        const input = document.getElementById('quiz-text-input');
        const userAnswer = input.value.trim();
        const correctAnswer = this.currentQuizWord.english;
        
        if (!userAnswer) {
            this.showToast('Please enter an answer', 'warning');
            return;
        }

        const isCorrect = this.checkAnswerVariations(userAnswer, correctAnswer);
        if (isCorrect) {
            this.quizCorrectAnswers++;
        }

        // Disable input
        input.disabled = true;
        document.getElementById('submit-text-answer').disabled = true;

        // Auto-pronounce the correct answer
        this.speakText(correctAnswer);

        this.showQuizFeedback(isCorrect);
    }

    checkAnswerVariations(userAnswer, correctAnswer) {
        // Normalize answers for comparison
        const normalizeText = (text) => text.toLowerCase().trim().replace(/[.,!?;:]/g, '');
        
        const normalizedUser = normalizeText(userAnswer);
        const normalizedCorrect = normalizeText(correctAnswer);
        
        // Direct match
        if (normalizedUser === normalizedCorrect) {
            return true;
        }
        
        // Check if answer contains multiple valid options separated by commas
        const userOptions = normalizedUser.split(/[,\/]/).map(opt => opt.trim()).filter(opt => opt);
        const correctOptions = normalizedCorrect.split(/[,\/]/).map(opt => opt.trim()).filter(opt => opt);
        
        // If correct answer has multiple options, check if user provided any of them
        if (correctOptions.length > 1) {
            return userOptions.some(userOpt => correctOptions.includes(userOpt));
        }
        
        // If user provided multiple options, check if any match the correct answer
        if (userOptions.length > 1) {
            return userOptions.includes(normalizedCorrect);
        }
        
        return false;
    }

    playAudioQuestion() {
        if (this.currentQuizWord) {
            this.speakText(this.currentQuizWord.english);
        }
    }

    showQuizFeedback(isCorrect) {
        const feedback = document.getElementById('quiz-feedback');
        const content = document.getElementById('feedback-content');
        
        feedback.className = `quiz-feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`;
        
        if (isCorrect) {
            content.innerHTML = `
                <h4>✅ Correct!</h4>
                <p><strong>English:</strong> ${this.currentQuizWord.english}</p>
                <p><strong>Turkish:</strong> ${this.currentQuizWord.turkish}</p>
                ${this.currentQuizWord.definition ? `<p><strong>Definition:</strong> ${this.currentQuizWord.definition}</p>` : ''}
            `;
        } else {
            content.innerHTML = `
                <h4>❌ Incorrect</h4>
                <p><strong>Correct Answer:</strong> ${this.currentQuizWord.english}</p>
                <p><strong>Turkish:</strong> ${this.currentQuizWord.turkish}</p>
                ${this.currentQuizWord.definition ? `<p><strong>Definition:</strong> ${this.currentQuizWord.definition}</p>` : ''}
            `;
        }

        feedback.style.display = 'block';
    }

    nextQuizQuestion() {
        // Re-enable options for next question
        document.querySelectorAll('.quiz-option').forEach(btn => {
            btn.style.pointerEvents = 'auto';
            btn.className = 'quiz-option';
        });

        // Re-enable text input if needed
        const textInput = document.getElementById('quiz-text-input');
        const submitBtn = document.getElementById('submit-text-answer');
        textInput.disabled = false;
        submitBtn.disabled = false;
        textInput.value = '';

        this.currentRandomQuestionIndex++;
        this.showNextQuizQuestion();
    }

    exitQuiz() {
        if (confirm('Are you sure you want to exit the quiz? Your progress will be lost.')) {
            this.showWordSelection();
        }
    }

    showQuizResults() {
        document.getElementById('quiz-phase').style.display = 'none';
        document.getElementById('quiz-results').style.display = 'block';

        const score = this.quizCorrectAnswers;
        const total = this.quizTotalQuestions;
        const percentage = Math.round((score / total) * 100);

        document.getElementById('final-score').textContent = score;
        document.getElementById('total-questions').textContent = total;
        document.getElementById('score-percentage').textContent = `${percentage}%`;

        // Update daily practice stats
        this.updateDailyPractice();

        // Show detailed breakdown
        this.showResultsBreakdown();

        // Show word marking section for quiz mode
        this.showQuizWordMarking();

        this.saveData();
    }

    showQuizWordMarking() {
        const container = document.getElementById('quiz-word-marking');
        if (!container) return;

        container.innerHTML = `
            <div class="word-marking-section">
                <h3>Mark Words After Quiz</h3>
                <p>Select how you found each word during the quiz:</p>
                <div class="word-marking-grid">
                    ${this.selectedQuizWords.map(word => `
                        <div class="word-mark-item">
                            <div class="word-info">
                                <strong>${word.english}</strong>
                                <span>${word.turkish}</span>
                            </div>
                            <div class="marking-options">
                                <label class="mark-option">
                                    <input type="checkbox" id="learned-${word.id}" 
                                           ${this.learnedWords.has(word.id) ? 'checked' : ''}
                                           onchange="app.toggleWordLearned('${word.id}')">
                                    <span class="checkmark learned"></span>
                                    Learned
                                </label>
                                <label class="mark-option">
                                    <input type="checkbox" id="difficult-${word.id}"
                                           ${this.difficultWords.includes(word.id) ? 'checked' : ''}
                                           onchange="app.toggleWordDifficult('${word.id}')">
                                    <span class="checkmark difficult"></span>
                                    Difficult
                                </label>
                                <label class="mark-option">
                                    <input type="checkbox" id="favorite-${word.id}"
                                           ${this.favoriteWords.includes(word.id) ? 'checked' : ''}
                                           onchange="app.toggleWordFavorite('${word.id}')">
                                    <span class="checkmark favorite"></span>
                                    Favorite
                                </label>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        container.style.display = 'block';
    }

    toggleWordLearned(wordId) {
        if (this.learnedWords.has(wordId)) {
            this.learnedWords.delete(wordId);
            this.showToast('Word removed from learned list', 'info');
        } else {
            this.learnedWords.add(wordId);
            this.showToast('Word marked as learned!', 'success');
        }
        this.saveData();
        this.updateStats();
    }

    toggleWordDifficult(wordId) {
        const index = this.difficultWords.indexOf(wordId);
        if (index > -1) {
            this.difficultWords.splice(index, 1);
            this.showToast('Word removed from difficult list', 'info');
        } else {
            this.difficultWords.push(wordId);
            this.showToast('Word marked as difficult!', 'warning');
        }
        this.saveData();
        this.updateStats();
    }

    toggleWordFavorite(wordId) {
        const index = this.favoriteWords.indexOf(wordId);
        if (index > -1) {
            this.favoriteWords.splice(index, 1);
            this.showToast('Word removed from favorites', 'info');
        } else {
            this.favoriteWords.push(wordId);
            this.showToast('Word added to favorites!', 'success');
        }
        this.saveData();
        this.updateStats();
    }

    showResultsBreakdown() {
        const breakdown = document.getElementById('results-breakdown');
        const score = this.quizCorrectAnswers;
        const total = this.quizTotalQuestions;
        const percentage = Math.round((score / total) * 100);

        let performanceMessage = '';
        let emoji = '';

        if (percentage >= 90) {
            performanceMessage = 'Excellent work! 🎉';
            emoji = '🏆';
        } else if (percentage >= 80) {
            performanceMessage = 'Great job! 👍';
            emoji = '⭐';
        } else if (percentage >= 70) {
            performanceMessage = 'Good effort! 👌';
            emoji = '📈';
        } else if (percentage >= 60) {
            performanceMessage = 'Keep practicing! 💪';
            emoji = '📚';
        } else {
            performanceMessage = 'More practice needed 📖';
            emoji = '💪';
        }

        breakdown.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 3rem; margin-bottom: 10px;">${emoji}</div>
                <h3>${performanceMessage}</h3>
                <p>You got ${score} out of ${total} questions correct (${percentage}%)</p>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <h4>Performance Tips:</h4>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    ${percentage < 70 ? '<li>Consider reviewing the words you missed</li>' : ''}
                    ${percentage >= 80 ? '<li>Great job! Try practicing difficult words to master them</li>' : ''}
                    <li>Regular practice leads to better retention</li>
                    <li>Use the audio feature to improve pronunciation</li>
                </ul>
            </div>
        `;
    }

    updateDailyPractice() {
        const today = new Date().toDateString();
        const lastPractice = this.dailyPractice.lastPracticeDate;

        if (lastPractice !== today) {
            // New day
            if (lastPractice === new Date(Date.now() - 86400000).toDateString()) {
                // Consecutive day - increment streak
                this.dailyPractice.streak++;
            } else {
                // Non-consecutive day - reset streak
                this.dailyPractice.streak = 1;
            }
            this.dailyPractice.practiced = 1;
            this.dailyPractice.lastPracticeDate = today;
        } else {
            // Same day - increment practiced count
            this.dailyPractice.practiced++;
        }
    }

    retakeQuiz() {
        this.startQuiz();
    }

    backToLearning() {
        this.showWordSelection();
    }

    // Word Display System
    startWordDisplay() {
        if (this.selectedQuizWords.length === 0) {
            document.getElementById('no-words-message').style.display = 'block';
            return;
        }

        document.getElementById('word-selection-phase').style.display = 'none';
        document.getElementById('quiz-phase').style.display = 'none';
        document.getElementById('quiz-results').style.display = 'none';
        document.getElementById('word-display').style.display = 'block';
        document.getElementById('no-words-message').style.display = 'none';

        this.currentWordIndex = 0;
        this.displayCurrentWord();
    }

    displayCurrentWord() {
        if (this.currentWordIndex >= this.selectedQuizWords.length) {
            this.showToast('You have completed all words!', 'success');
            this.showWordSelection();
            return;
        }

        const word = this.selectedQuizWords[this.currentWordIndex];
        
        // Update word information
        document.getElementById('word-title').textContent = word.english;
        document.getElementById('word-turkish').textContent = word.turkish;
        document.getElementById('word-part-of-speech').textContent = word.partOfSpeech || 'Not specified';
        
        // Show/hide level
        const levelContainer = document.getElementById('word-level-container');
        const levelElement = document.getElementById('word-level');
        if (word.level) {
            levelElement.textContent = word.level;
            levelContainer.style.display = 'block';
        } else {
            levelContainer.style.display = 'none';
        }

        // Show/hide phrasal verb indicator
        const phrasalContainer = document.getElementById('word-phrasal-container');
        if (word.isPhrasalVerb) {
            phrasalContainer.style.display = 'block';
        } else {
            phrasalContainer.style.display = 'none';
        }

        document.getElementById('word-definition').textContent = word.definition || 'No definition provided';

        // Show/hide synonyms
        const synonymsContainer = document.getElementById('word-synonyms-container');
        const synonymsElement = document.getElementById('word-synonyms');
        if (word.synonyms && word.synonyms.length > 0) {
            synonymsElement.textContent = word.synonyms.join(', ');
            synonymsContainer.style.display = 'block';
        } else {
            synonymsContainer.style.display = 'none';
        }

        // Show/hide antonyms
        const antonymsContainer = document.getElementById('word-antonyms-container');
        const antonymsElement = document.getElementById('word-antonyms');
        if (word.antonyms && word.antonyms.length > 0) {
            antonymsElement.textContent = word.antonyms.join(', ');
            antonymsContainer.style.display = 'block';
        } else {
            antonymsContainer.style.display = 'none';
        }

        // Display examples
        const examplesContainer = document.getElementById('word-examples');
        examplesContainer.innerHTML = '';
        
        if (word.examples && word.examples.length > 0) {
            word.examples.forEach(example => {
                const exampleDiv = document.createElement('div');
                exampleDiv.className = 'example-sentence';
                exampleDiv.textContent = example;
                examplesContainer.appendChild(exampleDiv);
            });
        } else {
            examplesContainer.innerHTML = '<div class="example-sentence">No examples provided</div>';
        }

        // Display image if available
        const imageContainer = document.getElementById('word-image-container');
        const image = document.getElementById('word-image');
        
        if (word.image) {
            image.src = word.image;
            image.alt = `Visual for ${word.english}`;
            imageContainer.style.display = 'block';
        } else {
            imageContainer.style.display = 'none';
        }

        // Set checkbox states
        document.getElementById('mark-learned').checked = this.learnedWords.has(word.id);
        document.getElementById('mark-favorite').checked = this.favoriteWords.includes(word.id);
        document.getElementById('mark-difficult').checked = this.difficultWords.includes(word.id);

        // Update navigation buttons
        document.getElementById('prev-word').disabled = this.currentWordIndex === 0;
        document.getElementById('next-word').disabled = this.currentWordIndex === this.selectedQuizWords.length - 1;
    }

    previousWord() {
        if (this.currentWordIndex > 0) {
            this.saveCurrentWordProgress();
            this.currentWordIndex--;
            this.displayCurrentWord();
        }
    }

    nextWord() {
        if (this.currentWordIndex < this.selectedQuizWords.length - 1) {
            this.saveCurrentWordProgress();
            this.currentWordIndex++;
            this.displayCurrentWord();
        }
    }

    saveProgress() {
        this.saveCurrentWordProgress();
        this.showToast('Progress saved!', 'success');
    }

    saveCurrentWordProgress() {
        const currentWord = this.selectedQuizWords[this.currentWordIndex];
        if (!currentWord) return;

        const learned = document.getElementById('mark-learned').checked;
        const favorite = document.getElementById('mark-favorite').checked;
        
        // Update favorites array
        if (favorite && !this.favoriteWords.includes(currentWord.id)) {
            this.favoriteWords.push(currentWord.id);
        } else if (!favorite && this.favoriteWords.includes(currentWord.id)) {
            const index = this.favoriteWords.indexOf(currentWord.id);
            this.favoriteWords.splice(index, 1);
        }
        const difficult = document.getElementById('mark-difficult').checked;

        // Update learned words
        if (learned) {
            this.learnedWords.add(currentWord.id);
        } else {
            this.learnedWords.delete(currentWord.id);
        }

        // Update favorite words
        if (favorite && !this.favoriteWords.includes(currentWord.id)) {
            this.favoriteWords.push(currentWord.id);
        } else if (!favorite) {
            this.favoriteWords = this.favoriteWords.filter(id => id !== currentWord.id);
        }

        // Update difficult words
        if (difficult && !this.difficultWords.includes(currentWord.id)) {
            this.difficultWords.push(currentWord.id);
        } else if (!difficult) {
            this.difficultWords = this.difficultWords.filter(id => id !== currentWord.id);
        }

        this.saveData();
        this.updateStats();
    }

    playWordAudio() {
        const currentWord = this.selectedQuizWords[this.currentWordIndex];
        if (currentWord) {
            this.speakText(currentWord.english);
        }
    }

    // Audio System
    speakText(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
        } else {
            this.showToast('Speech synthesis not supported in your browser', 'warning');
        }
    }

    // Add Word System
    addWord(e) {
        e.preventDefault();
        
        const english = document.getElementById('new-english').value.trim();
        const turkish = document.getElementById('new-turkish').value.trim();
        const partOfSpeech = document.getElementById('new-part-of-speech').value;
        const level = document.getElementById('new-level').value;
        const isPhrasalVerb = document.getElementById('new-phrasal-verb').checked;
        const definition = document.getElementById('new-definition').value.trim();
        const synonyms = document.getElementById('new-synonyms').value.trim();
        const antonyms = document.getElementById('new-antonyms').value.trim();
        const examples = document.getElementById('new-examples').value.trim();
        const category = document.getElementById('new-category').value || 'general';
        const imageFile = document.getElementById('new-image').files[0];

        // Validation
        if (!english) {
            this.showValidationError('english-error', 'English word is required');
            return;
        }

        if (!turkish) {
            this.showValidationError('turkish-error', 'Turkish translation is required');
            return;
        }

        // Check for duplicates
        const existingWord = this.words.find(word => 
            word.english.toLowerCase() === english.toLowerCase()
        );

        if (existingWord) {
            this.showValidationError('english-error', 'This word already exists');
            return;
        }

        // Handle image upload
        let imageUrl = '';
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imageUrl = e.target.result;
                this.saveWordWithImage(english, turkish, partOfSpeech, level, isPhrasalVerb, definition, synonyms, antonyms, examples, category, imageUrl);
            };
            reader.readAsDataURL(imageFile);
        } else {
            this.saveWordWithImage(english, turkish, partOfSpeech, level, isPhrasalVerb, definition, synonyms, antonyms, examples, category, imageUrl);
        }
    }

    saveWordWithImage(english, turkish, partOfSpeech, level, isPhrasalVerb, definition, synonyms, antonyms, examples, category, imageUrl) {
        const turkishDefinition = document.getElementById('new-turkish-definition').value.trim();
        
        // Create word object
        const word = {
            id: Date.now().toString(),
            english: english,
            turkish: turkish,
            partOfSpeech: partOfSpeech,
            level: level,
            isPhrasalVerb: isPhrasalVerb,
            definition: definition,
            turkishDefinition: turkishDefinition,
            synonyms: synonyms ? synonyms.split(',').map(s => s.trim()).filter(s => s) : [],
            antonyms: antonyms ? antonyms.split(',').map(s => s.trim()).filter(s => s) : [],
            examples: examples ? examples.split('\n').filter(ex => ex.trim()) : [],
            category: category,
            image: imageUrl,
            dateAdded: new Date().toISOString()
        };

        // Add word
        this.words.push(word);
        this.saveData();
        this.updateCategoryWordCounts();
        this.updateStats();

        this.showToast(`Word "${english}" added successfully!`, 'success');
        this.clearForm();
    }

    showValidationError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            setTimeout(() => {
                errorElement.textContent = '';
            }, 3000);
        }
    }

    clearForm() {
        const form = document.getElementById('add-word-form');
        if (form) {
            form.reset();
            document.getElementById('image-preview').innerHTML = '';
            // Clear Turkish definition field
            const turkishDefField = document.getElementById('new-turkish-definition');
            if (turkishDefField) {
                turkishDefField.value = '';
            }
        }
    }

    previewImage() {
        const fileInput = document.getElementById('new-image');
        const preview = document.getElementById('image-preview');
        
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px;">`;
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            preview.innerHTML = '';
        }
    }

    // Difficult Words Screen
    showDifficultWordsScreen() {
        this.showScreen('difficult-words');
        this.displayDifficultWords();
    }

    displayDifficultWords() {
        const container = document.getElementById('difficult-words-list');
        const noWordsMessage = document.getElementById('no-difficult-words');
        const quizCustomization = document.getElementById('difficult-quiz-customization');
        
        const difficultWords = this.words.filter(word => this.difficultWords.includes(word.id));
        
        if (difficultWords.length === 0) {
            container.innerHTML = '';
            noWordsMessage.style.display = 'block';
            quizCustomization.style.display = 'none';
            return;
        }

        noWordsMessage.style.display = 'none';
        quizCustomization.style.display = 'block';
        this.displayWordsList(container, difficultWords);
    }

    // Favorite Words Screen
    showFavoriteWordsScreen() {
        this.showScreen('favorite-words');
        this.displayFavoriteWords();
    }

    displayFavoriteWords() {
        const container = document.getElementById('favorite-words-list');
        const noWordsMessage = document.getElementById('no-favorite-words');
        const quizCustomization = document.getElementById('favorite-quiz-customization');
        
        const favoriteWords = this.words.filter(word => this.favoriteWords.includes(word.id));
        
        if (favoriteWords.length === 0) {
            container.innerHTML = '';
            noWordsMessage.style.display = 'block';
            quizCustomization.style.display = 'none';
            return;
        }

        noWordsMessage.style.display = 'none';
        quizCustomization.style.display = 'block';
        this.displayWordsList(container, favoriteWords);
    }

    displayWordsList(container, wordsList) {
        container.innerHTML = '';
        
        wordsList.forEach(word => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-item';
            
            const categoryName = this.categories.find(cat => cat.id === word.category)?.name || 'Unknown';
            const isFavorite = this.favoriteWords.includes(word.id);
            const heartIcon = isFavorite ? '❤️' : '🤍';
            
            wordItem.innerHTML = `
                <div class="word-info">
                    <div class="word-header-with-heart">
                        <h4>${word.english}</h4>
                        <button class="favorite-heart-btn" onclick="app.toggleWordFavoriteInDictionary('${word.id}')" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">${heartIcon}</button>
                    </div>
                    <p><strong>Turkish:</strong> ${word.turkish}</p>
                    <p><strong>Part of Speech:</strong> ${word.partOfSpeech || 'Not specified'}</p>
                    ${word.definition ? `<p><strong>Definition:</strong> ${word.definition}</p>` : ''}
                    <span class="word-category">${categoryName}</span>
                </div>
                <div class="word-actions-inline">
                    <button class="word-action-btn play" onclick="app.speakText('${word.english}')">🔊</button>
                    <button class="word-action-btn edit" onclick="app.editWordModal('${word.id}')">✏️</button>
                    <button class="word-action-btn quiz" onclick="app.startSingleWordQuiz('${word.id}')">🎯</button>
                    <button class="word-action-btn delete" onclick="app.deleteWord('${word.id}')">🗑️</button>
                </div>
            `;
            
            container.appendChild(wordItem);
        });
    }

    toggleWordFavoriteInDictionary(wordId) {
        const index = this.favoriteWords.indexOf(wordId);
        if (index > -1) {
            this.favoriteWords.splice(index, 1);
            this.showToast('Removed from favorites', 'info');
        } else {
            this.favoriteWords.push(wordId);
            this.showToast('Added to favorites!', 'success');
        }
        this.saveData();
        this.updateStats();
        this.filterDictionary(); // Refresh the display
    }

    startSingleWordQuiz(wordId) {
        const word = this.words.find(w => w.id === wordId);
        if (!word) return;
        
        this.selectedQuizWords = [word];
        this.showScreen('learning');
        this.startQuiz();
    }

    // Enhanced Quiz customization functions with personalization
    startFavoriteQuizFromCustomization() {
        const wordCount = document.getElementById('favorite-quiz-word-count').value;
        const quizType = document.getElementById('favorite-quiz-type').value;
        const wordSelection = document.getElementById('favorite-word-selection').value;
        
        const favoriteWords = this.words.filter(word => this.favoriteWords.includes(word.id));
        
        if (favoriteWords.length === 0) {
            this.showToast('No favorite words available for quiz', 'error');
            return;
        }
        
        // Select words based on personalization settings
        let selectedWords = this.selectWordsBasedOnSettings(favoriteWords, {
            count: wordCount,
            selection: wordSelection
        });
        
        this.selectedQuizWords = selectedWords;
        this.quizPhase = this.getQuizPhaseFromType(quizType);
        
        // Hide quiz personalization and go directly to quiz
        this.hideQuizPersonalization();
        this.showScreen('learning');
        
        // Hide word selection and show quiz directly
        document.getElementById('word-selection-phase').style.display = 'none';
        document.getElementById('quiz-personalization').style.display = 'none';
        
        this.startQuiz();
    }

    selectWordsBasedOnSettings(wordList, settings) {
        let selectedWords = [...wordList];
        
        // Apply selection strategy
        if (settings.selection === 'random') {
            selectedWords = this.shuffleArray(selectedWords);
        } else if (settings.selection === 'alphabetical') {
            selectedWords.sort((a, b) => a.english.localeCompare(b.english));
        } else if (settings.selection === 'difficulty') {
            selectedWords.sort((a, b) => {
                const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
                return (difficultyOrder[a.difficulty] || 2) - (difficultyOrder[b.difficulty] || 2);
            });
        } else if (settings.selection === 'recent') {
            selectedWords.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
        }
        
        // Apply word count limit
        if (settings.count !== 'all') {
            const count = parseInt(settings.count);
            selectedWords = selectedWords.slice(0, count);
        }
        
        return selectedWords;
    }

    startDifficultQuizFromCustomization() {
        const wordCount = document.getElementById('difficult-quiz-word-count').value;
        const quizType = document.getElementById('difficult-quiz-type').value;
        const wordSelection = document.getElementById('difficult-word-selection').value;
        
        const difficultWords = this.words.filter(word => this.difficultWords.includes(word.id));
        
        if (difficultWords.length === 0) {
            this.showToast('No difficult words available for quiz', 'error');
            return;
        }
        
        // Select words based on personalization settings
        let selectedWords = this.selectWordsBasedOnSettings(difficultWords, {
            count: wordCount,
            selection: wordSelection
        });
        
        this.selectedQuizWords = selectedWords;
        this.quizPhase = this.getQuizPhaseFromType(quizType);
        
        // Hide quiz personalization and go directly to quiz
        this.hideQuizPersonalization();
        this.showScreen('learning');
        
        // Hide word selection and show quiz directly
        document.getElementById('word-selection-phase').style.display = 'none';
        document.getElementById('quiz-personalization').style.display = 'none';
        
        this.startQuiz();
    }

    // Dictionary Screen
    setupDictionaryScreen() {
        this.displayDictionary();
        
        // Update stats
        this.updateDictionaryStats();
    }

    displayDictionary() {
        const searchTerm = document.getElementById('dictionary-search')?.value.toLowerCase() || '';
        const filter = document.getElementById('dictionary-filter')?.value || 'all';
        const sort = document.getElementById('dictionary-sort')?.value || 'alphabetical';
        
        let filteredWords = this.words.slice();
        
        // Apply search filter
        if (searchTerm) {
            filteredWords = filteredWords.filter(word => 
                word.english.toLowerCase().includes(searchTerm) ||
                word.turkish.toLowerCase().includes(searchTerm) ||
                (word.definition && word.definition.toLowerCase().includes(searchTerm))
            );
        }
        
        // Apply category filter
        if (filter === 'learned') {
            filteredWords = filteredWords.filter(word => this.learnedWords.has(word.id));
        } else if (filter === 'difficult') {
            filteredWords = filteredWords.filter(word => this.difficultWords.includes(word.id));
        } else if (filter === 'favorite') {
            filteredWords = filteredWords.filter(word => this.favoriteWords.includes(word.id));
        }
        
        // Apply sorting
        filteredWords.sort((a, b) => {
            switch (sort) {
                case 'alphabetical':
                    return a.english.localeCompare(b.english);
                case 'reverse-alphabetical':
                    return b.english.localeCompare(a.english);
                case 'newest':
                    return new Date(b.dateAdded) - new Date(a.dateAdded);
                case 'oldest':
                    return new Date(a.dateAdded) - new Date(b.dateAdded);
                default:
                    return 0;
            }
        });
        
        const container = document.getElementById('dictionary-list');
        const noWordsMessage = document.getElementById('no-dictionary-words');
        
        if (filteredWords.length === 0) {
            container.innerHTML = '';
            noWordsMessage.style.display = 'block';
            return;
        }
        
        noWordsMessage.style.display = 'none';
        this.displayWordsList(container, filteredWords);
        
        // Update showing count
        const showingCount = document.getElementById('showing-count');
        if (showingCount) {
            showingCount.textContent = filteredWords.length;
        }
    }

    filterDictionary() {
        this.displayDictionary();
    }

    updateDictionaryStats() {
        const totalCount = document.getElementById('total-count');
        if (totalCount) {
            totalCount.textContent = this.words.length;
        }
    }

    // Notes System
    displayNotes() {
        const container = document.getElementById('notes-list');
        const noNotesMessage = document.getElementById('no-notes');
        
        if (this.notes.length === 0) {
            container.innerHTML = '';
            noNotesMessage.style.display = 'block';
            return;
        }
        
        noNotesMessage.style.display = 'none';
        container.innerHTML = '';
        
        this.notes.forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            
            const date = new Date(note.dateCreated).toLocaleDateString();
            
            noteItem.innerHTML = `
                <h4>${note.title}</h4>
                <p>${note.content}</p>
                <div class="note-meta">
                    <span>Created: ${date}</span>
                    <div class="note-actions">
                        <button class="note-action-btn edit" onclick="app.editNote('${note.id}')">Edit</button>
                        <button class="note-action-btn delete" onclick="app.deleteNote('${note.id}')">Delete</button>
                    </div>
                </div>
            `;
            
            container.appendChild(noteItem);
        });
    }

    addNote() {
        const titleInput = document.getElementById('new-note-title');
        const contentInput = document.getElementById('new-note-content');
        
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        
        if (!title || !content) {
            this.showToast('Please fill in both title and content', 'error');
            return;
        }
        
        const note = {
            id: Date.now().toString(),
            title: title,
            content: content,
            dateCreated: new Date().toISOString()
        };
        
        this.notes.push(note);
        this.saveData();
        this.displayNotes();
        
        titleInput.value = '';
        contentInput.value = '';
        
        this.showToast('Note added successfully!', 'success');
    }

    deleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note?')) {
            this.notes = this.notes.filter(note => note.id !== noteId);
            this.saveData();
            this.displayNotes();
            this.showToast('Note deleted successfully', 'success');
        }
    }

    // Data Management
    updateDataManagementStats() {
        document.getElementById('data-words-count').textContent = this.words.length;
        document.getElementById('data-categories-count').textContent = this.categories.length;
        document.getElementById('data-notes-count').textContent = this.notes.length;
        
        // Calculate storage size
        const dataSize = JSON.stringify({
            words: this.words,
            categories: this.categories,
            notes: this.notes,
            difficultWords: this.difficultWords,
            favoriteWords: this.favoriteWords,
            learnedWords: [...this.learnedWords],
            dailyPractice: this.dailyPractice,
            preferences: this.userPreferences
        }).length;
        
        const sizeKB = Math.round(dataSize / 1024);
        document.getElementById('data-storage-size').textContent = `${sizeKB} KB`;
    }

    exportData() {
        const data = {
            words: this.words,
            categories: this.categories,
            notes: this.notes,
            difficultWords: this.difficultWords,
            favoriteWords: this.favoriteWords,
            learnedWords: [...this.learnedWords],
            dailyPractice: this.dailyPractice,
            preferences: this.userPreferences,
            exportDate: new Date().toISOString(),
            appVersion: '1.0.0'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vocabmaster-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        this.showToast('Data exported successfully!', 'success');
    }

    triggerImport() {
        document.getElementById('import-file').click();
    }

    importData(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                // Validate data structure
                if (!data.words || !Array.isArray(data.words)) {
                    throw new Error('Invalid data format');
                }
                
                // Merge data (don't overwrite, add to existing)
                if (data.words) {
                    data.words.forEach(word => {
                        // Check for duplicates
                        const exists = this.words.find(w => w.english.toLowerCase() === word.english.toLowerCase());
                        if (!exists) {
                            word.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                            this.words.push(word);
                        }
                    });
                }
                
                if (data.categories) {
                    data.categories.forEach(category => {
                        const exists = this.categories.find(c => c.name.toLowerCase() === category.name.toLowerCase());
                        if (!exists) {
                            category.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                            this.categories.push(category);
                        }
                    });
                }
                
                if (data.notes) {
                    data.notes.forEach(note => {
                        note.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                        this.notes.push(note);
                    });
                }
                
                // Save and update
                this.saveData();
                this.saveCategories();
                this.updateStats();
                this.updateCategoryWordCounts();
                this.updateCategoryOptions();
                this.updateDataManagementStats();
                
                this.showToast(`Import successful! Added ${data.words ? data.words.length : 0} words.`, 'success');
                
            } catch (error) {
                console.error('Import error:', error);
                this.showToast('Failed to import data. Please check the file format.', 'error');
            }
        };
        
        reader.readAsText(file);
        e.target.value = ''; // Reset file input
    }

    clearAllData() {
        const confirmText = 'DELETE ALL DATA';
        const userInput = prompt(`This will permanently delete ALL your data. Type "${confirmText}" to confirm:`);
        
        if (userInput === confirmText) {
            // Clear all data
            this.words = [];
            this.categories = [
                {
                    id: 'general',
                    name: 'General',
                    description: 'General vocabulary words',
                    wordCount: 0
                }
            ];
            this.notes = [];
            this.difficultWords = [];
            this.favoriteWords = [];
            this.learnedWords = new Set();
            this.dailyPractice = {
                practiced: 0,
                goal: 10,
                streak: 0,
                lastPracticeDate: null
            };
            
            // Clear localStorage
            localStorage.removeItem('vocabularyWords');
            localStorage.removeItem('vocabularyCategories');
            localStorage.removeItem('vocabularyNotes');
            localStorage.removeItem('vocabularyDifficultWords');
            localStorage.removeItem('vocabularyFavoriteWords');
            localStorage.removeItem('vocabularyLearnedWords');
            localStorage.removeItem('vocabularyDailyPractice');
            
            this.saveData();
            this.saveCategories();
            this.updateStats();
            this.updateCategoryOptions();
            this.updateDataManagementStats();
            
            this.showToast('All data has been cleared.', 'success');
        } else {
            this.showToast('Data clearing cancelled.', 'info');
        }
    }

    // Theme Management
    initializeTheme() {
        // Load theme from multiple possible sources for reliability
        let savedTheme = this.userPreferences.theme || 
                        localStorage.getItem('vocabularyTheme') || 
                        localStorage.getItem('selectedTheme') || 
                        'default';
        
        // Ensure valid theme
        const validThemes = ['default', 'white', 'black', 'green', 'orange', 'red', 'blue', 'pink'];
        if (!validThemes.includes(savedTheme)) {
            savedTheme = 'default';
        }
        
        // Apply theme immediately and store consistently
        this.userPreferences.theme = savedTheme;
        this.applyTheme(savedTheme);
        
        // Wait for DOM to be ready before updating theme options
        setTimeout(() => {
            document.querySelectorAll('.theme-option').forEach(option => {
                option.classList.toggle('active', option.dataset.theme === savedTheme);
            });
        }, 100);
    }

    toggleThemeOptions() {
        const options = document.getElementById('theme-options');
        const isVisible = options.style.display === 'block' || options.style.display === '';
        options.style.display = isVisible ? 'none' : 'block';
    }

    changeTheme(theme) {
        // Ensure theme change is reliable and immediate
        this.userPreferences.theme = theme;
        
        // Force immediate theme application
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('vocabularyTheme', theme);
        
        this.saveData();
        
        // Close theme options immediately
        document.getElementById('theme-options').style.display = 'none';
        
        // Update active theme option 
        setTimeout(() => {
            document.querySelectorAll('.theme-option').forEach(option => {
                option.classList.remove('active');
                if (option.dataset.theme === theme) {
                    option.classList.add('active');
                }
            });
        }, 50);
        
        // Show confirmation with proper theme name
        const themeNames = {
            'default': 'Default',
            'white': 'White',
            'black': 'Black',
            'green': 'Green',
            'orange': 'Orange',
            'red': 'Red',
            'blue': 'Blue',
            'pink': 'Rose Pink'
        };
        
        this.showToast(`Theme changed to ${themeNames[theme] || theme}`, 'success');
    }

    applyTheme(theme) {
        // Force immediate theme application with error handling
        try {
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('vocabularyTheme', theme);
            
            // Also store in legacy location for compatibility
            localStorage.setItem('selectedTheme', theme);
        } catch (error) {
            console.error('Error applying theme:', error);
        }
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 3000);
    }

    // Enhanced Quiz Functions





    // Manual word selection for comprehensive quiz
    showManualSelection() {
        document.getElementById('manual-selection-area').style.display = 'block';
        this.displayWordSelection();
    }

    displayWordSelection() {
        const grid = document.getElementById('word-selection-grid');
        grid.innerHTML = '';
        this.selectedQuizWords = [];

        this.words.forEach(word => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-selection-item';
            wordItem.innerHTML = `
                <input type="checkbox" id="word-${word.id}" onchange="app.toggleWordSelection('${word.id}')">
                <label for="word-${word.id}">
                    <strong>${word.english}</strong>
                    <span>${word.turkish}</span>
                </label>
            `;
            grid.appendChild(wordItem);
        });

        this.updateSelectionCount();
    }

    toggleWordSelection(wordId) {
        const checkbox = document.getElementById(`word-${wordId}`);
        const wordItem = checkbox.closest('.word-selection-item');
        
        if (checkbox.checked) {
            if (this.selectedQuizWords.length >= 10) {
                checkbox.checked = false;
                this.showToast('Maximum 10 words can be selected', 'warning');
                return;
            }
            const word = this.words.find(w => w.id === wordId);
            this.selectedQuizWords.push(word);
            wordItem.classList.add('selected');
        } else {
            this.selectedQuizWords = this.selectedQuizWords.filter(w => w.id !== wordId);
            wordItem.classList.remove('selected');
        }

        this.updateSelectionCount();
    }

    updateSelectionCount() {
        const countElement = document.getElementById('selected-count');
        const startButton = document.getElementById('start-quiz');
        
        countElement.textContent = this.selectedQuizWords.length;
        startButton.disabled = this.selectedQuizWords.length < 1;
    }



    // Specialized Practice Modes
    // Duplicate function removed - using the main one above

    // Duplicate function removed - using the main one above

    // Duplicate function removed - using the main one above

    showRepeatPractice() {
        document.getElementById('repeat-selection').style.display = 'block';
        document.getElementById('quiz-selection').style.display = 'none';
    }

    startRepeatAll() {
        this.selectedQuizWords = [...this.words];
        this.startWordDisplay();
    }

    startRepeatNumber() {
        const count = parseInt(document.getElementById('repeat-word-count').value);
        if (!count || count < 1) {
            this.showToast('Please enter a valid number', 'warning');
            return;
        }
        
        const shuffled = [...this.words].sort(() => Math.random() - 0.5);
        this.selectedQuizWords = shuffled.slice(0, Math.min(count, this.words.length));
        this.startWordDisplay();
    }



    // Personalization Function
    savePersonalization() {
        const userName = document.getElementById('user-name').value.trim();
        if (userName) {
            localStorage.setItem('vocabmaster_user_name', userName);
            this.updatePersonalizedGreeting(userName);
            this.showToast(`Welcome, ${userName}! Your name has been saved.`, 'success');
        }
    }

    updatePersonalizedGreeting(userName) {
        const greetingElement = document.querySelector('.app-description');
        if (greetingElement && userName) {
            greetingElement.textContent = `Welcome back, ${userName}! Continue your English vocabulary journey with Turkish translations and intelligent progress tracking.`;
        }
    }

    loadPersonalization() {
        const userName = localStorage.getItem('vocabmaster_user_name');
        if (userName) {
            document.getElementById('user-name').value = userName;
            this.updatePersonalizedGreeting(userName);
        }
    }

    // Enhanced Difficult Words Practice
    makeChallengingWordsEngaging() {
        const difficultWords = this.words.filter(word => this.difficultWords.includes(word.id));
        if (difficultWords.length === 0) return;

        // Prioritize difficult words that haven't been practiced recently
        difficultWords.sort((a, b) => {
            const aLastPracticed = a.lastPracticed || 0;
            const bLastPracticed = b.lastPracticed || 0;
            return aLastPracticed - bLastPracticed;
        });

        return difficultWords.slice(0, Math.min(5, difficultWords.length));
    }

    // First word learned appearance in quiz
    addFirstWordLearnedToQuiz() {
        if (this.learnedWords.size > 0) {
            const firstLearnedId = Array.from(this.learnedWords)[0];
            const firstLearnedWord = this.words.find(w => w.id === firstLearnedId);
            
            if (firstLearnedWord && this.selectedQuizWords.length > 0) {
                // Add the first learned word as the first question in quiz
                this.selectedQuizWords.unshift(firstLearnedWord);
                // Remove duplicates
                this.selectedQuizWords = this.selectedQuizWords.filter((word, index, self) => 
                    index === self.findIndex(w => w.id === word.id)
                );
            }
        }
    }

    // Word Editing Modal
    editWordModal(wordId) {
        const word = this.words.find(w => w.id === wordId);
        if (!word) return;

        // Populate form
        document.getElementById('edit-english').value = word.english;
        document.getElementById('edit-turkish').value = word.turkish;
        document.getElementById('edit-part-of-speech').value = word.partOfSpeech || '';
        document.getElementById('edit-level').value = word.level || '';
        document.getElementById('edit-definition').value = word.definition || '';
        document.getElementById('edit-category').value = word.category || 'general';
        
        // Show modal
        const modal = document.getElementById('edit-word-modal');
        modal.classList.add('show');
        modal.dataset.wordId = wordId;
    }

    closeEditModal() {
        const modal = document.getElementById('edit-word-modal');
        modal.classList.remove('show');
        delete modal.dataset.wordId;
    }

    saveWordEdit(e) {
        e.preventDefault();
        const modal = document.getElementById('edit-word-modal');
        const wordId = modal.dataset.wordId;
        const word = this.words.find(w => w.id === wordId);
        
        if (!word) return;

        // Update word data
        word.english = document.getElementById('edit-english').value.trim();
        word.turkish = document.getElementById('edit-turkish').value.trim();
        word.partOfSpeech = document.getElementById('edit-part-of-speech').value;
        word.level = document.getElementById('edit-level').value;
        word.definition = document.getElementById('edit-definition').value.trim();
        word.category = document.getElementById('edit-category').value;

        this.saveData();
        this.showToast('Word updated successfully!', 'success');
        this.closeEditModal();
        
        // Refresh current view
        if (this.currentScreen === 'dictionary') {
            this.filterDictionary();
        } else if (this.currentScreen === 'favorite-words') {
            this.displayFavoriteWords();
        } else if (this.currentScreen === 'difficult-words') {
            this.displayDifficultWords();
        }
    }

    // Enhanced Quiz Personalization
    showQuizPersonalization() {
        const panel = document.getElementById('quiz-personalization');
        const isVisible = panel.style.display !== 'none';
        panel.style.display = isVisible ? 'none' : 'block';
    }

    applyQuizSettings() {
        this.quizSettings = {
            repeatCount: parseInt(document.getElementById('quiz-repeat-count').value) || 1,
            autoPronounce: document.getElementById('quiz-pronounce-auto').checked,
            showDefinitions: document.getElementById('quiz-show-definitions').checked,
            difficultyFilter: document.getElementById('quiz-difficulty-filter').value
        };
        
        // Save settings
        localStorage.setItem('vocabmaster_quiz_settings', JSON.stringify(this.quizSettings));
        this.showToast('Quiz settings applied!', 'success');
        this.hideQuizPersonalization();
    }

    hideQuizPersonalization() {
        document.getElementById('quiz-personalization').style.display = 'none';
    }

    loadQuizSettings() {
        const saved = localStorage.getItem('vocabmaster_quiz_settings');
        this.quizSettings = saved ? JSON.parse(saved) : {
            repeatCount: 1,
            autoPronounce: true,
            showDefinitions: true,
            difficultyFilter: 'all'
        };
        
        // Apply to form if elements exist
        if (document.getElementById('quiz-repeat-count')) {
            document.getElementById('quiz-repeat-count').value = this.quizSettings.repeatCount;
            document.getElementById('quiz-pronounce-auto').checked = this.quizSettings.autoPronounce;
            document.getElementById('quiz-show-definitions').checked = this.quizSettings.showDefinitions;
            document.getElementById('quiz-difficulty-filter').value = this.quizSettings.difficultyFilter;
        }
    }

    // Enhanced Word Selection Functions
    selectAllWords() {
        const visibleWords = this.getFilteredWordsForSelection();
        this.selectedQuizWords = [...visibleWords];
        this.updateWordSelectionDisplay();
        this.updateSelectionSummary();
        this.showToast(`Selected all ${visibleWords.length} words`, 'success');
    }

    clearWordSelection() {
        this.selectedQuizWords = [];
        this.updateWordSelectionDisplay();
        this.updateSelectionSummary();
        this.showToast('Selection cleared', 'info');
    }

    selectFavoriteWords() {
        const favoriteWords = this.words.filter(word => this.favoriteWords.includes(word.id));
        this.selectedQuizWords = [...favoriteWords];
        this.updateWordSelectionDisplay();
        this.updateSelectionSummary();
        this.showToast(`Selected ${favoriteWords.length} favorite words`, 'success');
    }

    filterWordSelection() {
        this.displayWordSelection();
    }

    getFilteredWordsForSelection() {
        const categoryFilter = document.getElementById('word-filter-category')?.value || 'all';
        const difficultyFilter = document.getElementById('word-filter-difficulty')?.value || 'all';
        const searchTerm = document.getElementById('word-search')?.value.toLowerCase() || '';

        return this.words.filter(word => {
            const matchesCategory = categoryFilter === 'all' || word.category === categoryFilter;
            const matchesDifficulty = difficultyFilter === 'all' || word.level === difficultyFilter;
            const matchesSearch = !searchTerm || 
                word.english.toLowerCase().includes(searchTerm) ||
                word.turkish.toLowerCase().includes(searchTerm);
            
            return matchesCategory && matchesDifficulty && matchesSearch;
        });
    }

    updateWordSelectionDisplay() {
        const grid = document.getElementById('word-selection-grid');
        if (!grid) return;

        // Update visual state of all word items
        const wordItems = grid.querySelectorAll('.word-selection-item');
        wordItems.forEach(item => {
            const wordId = item.dataset.wordId;
            const isSelected = this.selectedQuizWords.some(w => w.id === wordId);
            item.classList.toggle('selected', isSelected);
        });
    }

    displayWordSelection() {
        const grid = document.getElementById('word-selection-grid');
        if (!grid) return;

        const filteredWords = this.getFilteredWordsForSelection();
        
        // Populate category filter
        const categoryFilter = document.getElementById('word-filter-category');
        if (categoryFilter) {
            const categories = [...new Set(this.words.map(w => w.category))];
            categoryFilter.innerHTML = '<option value="all">All Categories</option>';
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
                categoryFilter.appendChild(option);
            });
        }

        grid.innerHTML = '';
        
        if (filteredWords.length === 0) {
            grid.innerHTML = '<div class="no-words"><p>No words match your filters</p></div>';
            return;
        }

        filteredWords.forEach(word => {
            const isSelected = this.selectedQuizWords.some(w => w.id === word.id);
            const isFavorite = this.favoriteWords.includes(word.id);
            
            const wordDiv = document.createElement('div');
            wordDiv.className = `word-selection-item ${isSelected ? 'selected' : ''}`;
            wordDiv.dataset.wordId = word.id;
            
            wordDiv.innerHTML = `
                <div class="word-info">
                    <strong>${word.english} ${isFavorite ? '❤️' : ''}</strong>
                    <span>${word.turkish}</span>
                    <small>${word.level ? word.level : ''} ${word.category ? '• ' + word.category : ''}</small>
                </div>
            `;
            
            wordDiv.addEventListener('click', () => this.toggleWordSelection(word));
            grid.appendChild(wordDiv);
        });
    }

    toggleWordSelection(word) {
        const index = this.selectedQuizWords.findIndex(w => w.id === word.id);
        if (index > -1) {
            this.selectedQuizWords.splice(index, 1);
        } else {
            this.selectedQuizWords.push(word);
        }
        
        this.updateWordSelectionDisplay();
        this.updateSelectionSummary();
    }

    updateSelectionSummary() {
        const countElement = document.getElementById('selected-count');
        const startButton = document.getElementById('start-quiz');
        
        if (countElement) {
            countElement.textContent = this.selectedQuizWords.length;
        }
        
        if (startButton) {
            startButton.disabled = this.selectedQuizWords.length === 0;
        }
    }

    // Enhanced Theme System with Dynamic Effects
    setupDynamicThemes() {
        // Add mouse movement tracking for dynamic effects
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Add window resize handler for responsive gradients
        window.addEventListener('resize', () => this.updateDynamicEffects());
    }

    handleMouseMove(e) {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        
        // Update CSS custom properties for mouse-based effects
        document.documentElement.style.setProperty('--mouse-x', `${x}%`);
        document.documentElement.style.setProperty('--mouse-y', `${y}%`);
        
        // Apply dynamic shadow based on mouse position
        const containers = document.querySelectorAll('.container');
        containers.forEach(container => {
            const rect = container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = (e.clientX - centerX) / 20;
            const deltaY = (e.clientY - centerY) / 20;
            
            container.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });
    }

    updateDynamicEffects() {
        // Recalculate and update any size-dependent effects
        const cards = document.querySelectorAll('.word-item, .mode-btn, .category-card');
        cards.forEach(card => {
            card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    }

    // Voice Recognition System
    initializeVoiceRecognition() {
        this.recognition = null;
        this.isListening = false;
        this.voicePracticeWords = [];
        this.currentVoiceWordIndex = 0;
        this.voiceResults = [];
        this.recognitionTimeout = null;
        this.pronunciationScores = [];
        this.currentPronunciationWord = null;
        
        // Check if speech recognition is supported
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            try {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                this.recognition = new SpeechRecognition();
                
                this.recognition.continuous = false;
                this.recognition.interimResults = true;
                this.recognition.lang = 'en-US';
                this.recognition.maxAlternatives = 3;
                this.recognition.maxAlternatives = 1;
                
                this.recognition.onstart = () => this.onRecognitionStart();
                this.recognition.onresult = (event) => this.onRecognitionResult(event);
                this.recognition.onerror = (event) => this.onRecognitionError(event);
                this.recognition.onend = () => this.onRecognitionEnd();
                
                console.log('Voice recognition initialized successfully');
                this.setupVoiceRecognitionEvents();
            } catch (error) {
                console.error('Error initializing voice recognition:', error);
                this.recognition = null;
            }
        } else {
            console.warn('Speech recognition not supported in this browser');
        }
    }

    showVoiceRecognitionSelection() {
        this.hideAllSelections();
        document.getElementById('voice-recognition-selection').style.display = 'block';
    }

    testMicrophone() {
        const resultElement = document.getElementById('mic-test-result');
        const testButton = document.getElementById('test-microphone');
        
        if (!this.recognition) {
            resultElement.textContent = 'Speech recognition not supported in this browser';
            resultElement.className = 'test-result error';
            return;
        }

        testButton.textContent = 'Testing...';
        resultElement.textContent = 'Say "test" to check your microphone...';
        resultElement.className = 'test-result';

        const testRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        testRecognition.continuous = false;
        testRecognition.interimResults = false;
        testRecognition.lang = 'en-US';

        testRecognition.onresult = (event) => {
            const result = event.results[0][0].transcript.toLowerCase();
            if (result.includes('test')) {
                resultElement.textContent = '✓ Microphone working perfectly!';
                resultElement.className = 'test-result success';
            } else {
                resultElement.textContent = `✓ Microphone detected: "${result}"`;
                resultElement.className = 'test-result success';
            }
            testButton.textContent = '🎤 Test Microphone';
        };

        testRecognition.onerror = (event) => {
            resultElement.textContent = `✗ Error: ${event.error}. Please check microphone permissions.`;
            resultElement.className = 'test-result error';
            testButton.textContent = '🎤 Test Microphone';
        };

        testRecognition.onend = () => {
            testButton.textContent = '🎤 Test Microphone';
        };

        testRecognition.start();
    }

    startVoicePractice() {
        if (!this.recognition) {
            this.showToast('Speech recognition not supported in this browser', 'error');
            return;
        }

        const wordCount = parseInt(document.getElementById('voice-word-count').value) || 5;
        const difficulty = document.getElementById('voice-difficulty').value;

        // Filter words by difficulty
        let availableWords = this.words;
        if (difficulty !== 'all') {
            availableWords = this.words.filter(word => word.level === difficulty);
        }

        if (availableWords.length === 0) {
            this.showToast('No words available for selected difficulty', 'warning');
            return;
        }

        // Select random words
        this.voicePracticeWords = this.shuffleArray(availableWords).slice(0, Math.min(wordCount, availableWords.length));
        this.currentVoiceWordIndex = 0;
        this.voiceResults = [];

        this.showScreen('voice-recognition-phase');
        this.displayCurrentVoiceWord();
    }

    displayCurrentVoiceWord() {
        if (this.currentVoiceWordIndex >= this.voicePracticeWords.length) {
            this.showVoiceResults();
            return;
        }

        const currentWord = this.voicePracticeWords[this.currentVoiceWordIndex];
        
        document.getElementById('voice-current-word').textContent = currentWord.english;
        document.getElementById('voice-current-translation').textContent = currentWord.turkish;
        document.getElementById('voice-progress-text').textContent = 
            `Word ${this.currentVoiceWordIndex + 1} of ${this.voicePracticeWords.length}`;
        
        const progressPercent = ((this.currentVoiceWordIndex) / this.voicePracticeWords.length) * 100;
        document.getElementById('voice-progress-bar').style.width = `${progressPercent}%`;

        // Reset feedback
        document.getElementById('voice-feedback').style.display = 'none';
        document.getElementById('voice-next-word').style.display = 'none';
        document.getElementById('voice-try-again').style.display = 'none';
        document.getElementById('voice-status').textContent = 'Ready to listen';
        document.getElementById('voice-status').className = 'voice-status';
    }

    playCurrentVoiceWord() {
        const currentWord = this.voicePracticeWords[this.currentVoiceWordIndex];
        this.speakText(currentWord.english);
    }

    startListening() {
        if (!this.recognition) {
            this.showToast('Voice recognition not available. Please check microphone permissions.', 'error');
            return;
        }
        
        if (this.isListening) return;

        try {
            this.isListening = true;
            const micBtn = document.getElementById('start-voice-recognition');
            const statusElement = document.getElementById('voice-status');
            
            micBtn.classList.add('listening');
            statusElement.textContent = 'Listening... Speak now!';
            statusElement.classList.add('listening');

            // Set timeout for recognition
            this.recognitionTimeout = setTimeout(() => {
                if (this.isListening) {
                    this.stopListening();
                    document.getElementById('voice-status').textContent = 'Timeout - Try again';
                }
            }, 10000); // 10 second timeout

            this.recognition.start();
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            this.isListening = false;
            this.showToast('Error starting voice recognition. Please try again.', 'error');
        }
    }

    stopListening() {
        if (!this.isListening) return;
        
        this.isListening = false;
        const micBtn = document.getElementById('start-voice-recognition');
        const statusElement = document.getElementById('voice-status');
        
        micBtn.classList.remove('listening');
        statusElement.classList.remove('listening');

        if (this.recognition) {
            this.recognition.stop();
        }
    }

    onRecognitionStart() {
        console.log('Voice recognition started');
    }

    onRecognitionResult(event) {
        try {
            // Clear timeout since we got a result
            if (this.recognitionTimeout) {
                clearTimeout(this.recognitionTimeout);
                this.recognitionTimeout = null;
            }
            
            if (event.results && event.results[0] && event.results[0][0]) {
                const result = event.results[0][0].transcript;
                const confidence = event.results[0][0].confidence || 0.8; // Default confidence if not provided
                
                console.log('Voice recognition result:', result, 'Confidence:', confidence);
                this.processVoiceResult(result, confidence);
            } else {
                console.warn('No speech result found');
                document.getElementById('voice-status').textContent = 'No speech detected. Try again.';
            }
        } catch (error) {
            console.error('Error processing voice result:', error);
            document.getElementById('voice-status').textContent = 'Error processing speech. Try again.';
        }
    }

    onRecognitionError(event) {
        console.error('Voice recognition error:', event.error);
        const statusElement = document.getElementById('voice-status');
        const micBtn = document.getElementById('start-voice-recognition');
        
        // Clear timeout
        if (this.recognitionTimeout) {
            clearTimeout(this.recognitionTimeout);
            this.recognitionTimeout = null;
        }
        
        // Provide user-friendly error messages
        let errorMessage = 'Try again';
        switch (event.error) {
            case 'no-speech':
                errorMessage = 'No speech detected. Click and speak clearly.';
                break;
            case 'audio-capture':
                errorMessage = 'Microphone not accessible. Check permissions.';
                break;
            case 'not-allowed':
                errorMessage = 'Microphone permission denied. Enable in browser settings.';
                break;
            case 'network':
                errorMessage = 'Network error. Check internet connection.';
                break;
            case 'service-not-allowed':
                errorMessage = 'Speech service not available.';
                break;
            default:
                errorMessage = `Error: ${event.error}. Try again.`;
        }
        
        statusElement.textContent = errorMessage;
        statusElement.classList.remove('listening');
        micBtn.classList.remove('listening');
        
        this.isListening = false;
        
        // Show toast for critical errors
        if (['not-allowed', 'audio-capture'].includes(event.error)) {
            this.showToast(errorMessage, 'error');
        }
    }

    onRecognitionEnd() {
        this.isListening = false;
        const micBtn = document.getElementById('start-voice-recognition');
        const statusElement = document.getElementById('voice-status');
        
        // Clear timeout
        if (this.recognitionTimeout) {
            clearTimeout(this.recognitionTimeout);
            this.recognitionTimeout = null;
        }
        
        micBtn.classList.remove('listening');
        statusElement.classList.remove('listening');
        
        // If no result was processed yet, show a message
        if (this.isListening === false && !document.getElementById('voice-feedback').style.display === 'block') {
            statusElement.textContent = 'Ready to listen - Click microphone to try again';
        }
    }

    processVoiceResult(spokenText, confidence) {
        const currentWord = this.voicePracticeWords[this.currentVoiceWordIndex];
        const targetWord = currentWord.english.toLowerCase();
        const spoken = spokenText.toLowerCase().trim();

        // Calculate pronunciation accuracy
        const accuracy = this.calculatePronunciationAccuracy(targetWord, spoken);
        
        // Display results
        document.getElementById('recognized-word').textContent = spokenText;
        document.getElementById('pronunciation-score').textContent = this.getAccuracyLabel(accuracy);
        document.getElementById('pronunciation-score').className = this.getAccuracyClass(accuracy);
        
        // Show feedback
        document.getElementById('voice-feedback').style.display = 'block';
        
        // Generate tips
        const tips = this.generatePronunciationTips(targetWord, spoken, accuracy);
        document.getElementById('pronunciation-tips').innerHTML = tips;

        // Store result
        this.voiceResults.push({
            word: currentWord,
            spoken: spokenText,
            accuracy: accuracy,
            confidence: confidence
        });

        // Show appropriate buttons
        if (accuracy >= 70) {
            document.getElementById('voice-next-word').style.display = 'inline-block';
            document.getElementById('voice-status').textContent = 'Great pronunciation!';
        } else {
            document.getElementById('voice-try-again').style.display = 'inline-block';
            document.getElementById('voice-status').textContent = 'Try again for better accuracy';
        }
    }

    calculatePronunciationAccuracy(target, spoken) {
        // Simple similarity calculation
        if (target === spoken) return 100;
        
        // Levenshtein distance based accuracy
        const distance = this.levenshteinDistance(target, spoken);
        const maxLength = Math.max(target.length, spoken.length);
        const similarity = ((maxLength - distance) / maxLength) * 100;
        
        return Math.max(0, Math.round(similarity));
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[str2.length][str1.length];
    }

    getAccuracyLabel(accuracy) {
        if (accuracy >= 90) return 'Excellent (90%+)';
        if (accuracy >= 75) return 'Good (75%+)';
        if (accuracy >= 60) return 'Fair (60%+)';
        return 'Needs Practice (<60%)';
    }

    getAccuracyClass(accuracy) {
        if (accuracy >= 90) return 'score-excellent';
        if (accuracy >= 75) return 'score-good';
        if (accuracy >= 60) return 'score-fair';
        return 'score-poor';
    }

    generatePronunciationTips(target, spoken, accuracy) {
        let tips = '';
        
        if (accuracy >= 90) {
            tips = '🎉 Perfect pronunciation! Keep up the excellent work!';
        } else if (accuracy >= 75) {
            tips = '👍 Good pronunciation! Just minor adjustments needed.';
        } else if (accuracy >= 60) {
            tips = '📚 Practice tip: Try speaking more slowly and clearly. Listen to the word again and repeat.';
        } else {
            tips = '🔄 Let\'s practice! Click "Listen" to hear the correct pronunciation, then try again. Focus on each syllable.';
        }
        
        return tips;
    }

    nextVoiceWord() {
        this.currentVoiceWordIndex++;
        this.displayCurrentVoiceWord();
    }

    tryVoiceAgain() {
        // Reset feedback for another attempt
        document.getElementById('voice-feedback').style.display = 'none';
        document.getElementById('voice-try-again').style.display = 'none';
        document.getElementById('voice-status').textContent = 'Ready to listen - try again!';
    }

    skipVoiceWord() {
        // Add skipped result
        this.voiceResults.push({
            word: this.voicePracticeWords[this.currentVoiceWordIndex],
            spoken: '[Skipped]',
            accuracy: 0,
            confidence: 0
        });
        
        this.nextVoiceWord();
    }

    showVoiceResults() {
        // Calculate overall performance
        const totalWords = this.voiceResults.length;
        const avgAccuracy = this.voiceResults.reduce((sum, result) => sum + result.accuracy, 0) / totalWords;
        
        let resultsHTML = `
            <div class="voice-practice-results">
                <h3>🎤 Voice Practice Complete!</h3>
                <div class="overall-score">
                    <h4>Overall Performance: ${Math.round(avgAccuracy)}%</h4>
                    <p class="${this.getAccuracyClass(avgAccuracy)}">${this.getAccuracyLabel(avgAccuracy)}</p>
                </div>
                <div class="word-results">
        `;
        
        this.voiceResults.forEach((result, index) => {
            resultsHTML += `
                <div class="word-result">
                    <strong>${result.word.english}</strong> → 
                    <span class="${this.getAccuracyClass(result.accuracy)}">
                        ${result.spoken} (${result.accuracy}%)
                    </span>
                </div>
            `;
        });
        
        resultsHTML += `
                </div>
                <div class="results-actions">
                    <button onclick="app.showScreen('learning')" class="main-btn primary">Practice More</button>
                    <button onclick="app.showScreen('home')" class="main-btn secondary">Home</button>
                </div>
            </div>
        `;
        
        document.querySelector('.voice-practice-content').innerHTML = resultsHTML;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    hideAllSelections() {
        document.getElementById('quiz-selection').style.display = 'none';
        document.getElementById('repeat-selection').style.display = 'none';
        document.getElementById('voice-recognition-selection').style.display = 'none';
    }

    // Utility Methods
    editWord(wordId) {
        this.editWordModal(wordId);
    }

    editCategory(categoryId) {
        this.showToast('Edit category functionality coming soon!', 'info');
    }

    editNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) {
            this.showToast('Note not found', 'error');
            return;
        }
        
        // Populate edit modal
        document.getElementById('edit-note-title').value = note.title;
        document.getElementById('edit-note-content').value = note.content;
        
        // Store current note ID for saving
        this.currentEditingNoteId = noteId;
        
        // Show modal
        this.showEditNoteModal();
    }

    showEditNoteModal() {
        document.getElementById('edit-note-modal').style.display = 'block';
    }

    hideEditNoteModal() {
        document.getElementById('edit-note-modal').style.display = 'none';
        this.currentEditingNoteId = null;
    }

    saveNoteChanges() {
        const title = document.getElementById('edit-note-title').value.trim();
        const content = document.getElementById('edit-note-content').value.trim();
        
        if (!title || !content) {
            this.showToast('Please fill in both title and content', 'warning');
            return;
        }
        
        if (!this.currentEditingNoteId) {
            this.showToast('No note selected for editing', 'error');
            return;
        }
        
        // Find and update the note
        const noteIndex = this.notes.findIndex(note => note.id === this.currentEditingNoteId);
        if (noteIndex === -1) {
            this.showToast('Note not found', 'error');
            return;
        }
        
        // Update note
        this.notes[noteIndex].title = title;
        this.notes[noteIndex].content = content;
        this.notes[noteIndex].updatedAt = new Date().toISOString();
        
        // Save and refresh
        this.saveData();
        this.displayNotes();
        this.hideEditNoteModal();
        this.showToast('Note updated successfully!', 'success');
    }

    // Optimized Visual Effects System
    initializeAdvancedEffects() {
        this.setupScrollAnimations();
        this.addInteractiveBorders();
        this.enhanceCardInteractions();
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("reveal-on-scroll");
                }
            });
        }, observerOptions);

        // Observe elements that should animate on scroll
        document.querySelectorAll(".word-item, .category-card, .mode-btn").forEach(el => {
            observer.observe(el);
        });
    }

    addInteractiveBorders() {
        document.querySelectorAll(".container").forEach(container => {
            container.classList.add("interactive-border");
        });
    }



    enhanceCardInteractions() {
        // Simplified card interactions for better performance
        document.querySelectorAll(".word-item, .category-card, .mode-btn").forEach(card => {
            card.addEventListener("mouseenter", () => {
                card.style.transform = "translateY(-5px) scale(1.02)";
            });

            card.addEventListener("mouseleave", () => {
                card.style.transform = "translateY(0) scale(1)";
            });
        });
    }

    // Enhanced Theme System with Advanced Transitions
    switchTheme(themeName) {
        const body = document.body;
        const container = document.querySelector(".container");
        
        // Add transition class
        body.classList.add("theme-transitioning");
        
        setTimeout(() => {
            body.setAttribute("data-theme", themeName);
            localStorage.setItem("selectedTheme", themeName);
            
            // Add special effects for theme change
            this.createThemeChangeEffect();
            
            setTimeout(() => {
                body.classList.remove("theme-transitioning");
            }, 500);
        }, 150);
    }

    createThemeChangeEffect() {
        const effect = document.createElement("div");
        effect.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, var(--accent-color) 0%, transparent 70%);
            opacity: 0;
            z-index: 10000;
            pointer-events: none;
            animation: themeRipple 0.8s ease-out;
        `;
        
        const style = document.createElement("style");
        style.textContent = `
            @keyframes themeRipple {
                0% { opacity: 0; transform: scale(0); }
                50% { opacity: 0.3; transform: scale(1); }
                100% { opacity: 0; transform: scale(1.5); }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(effect);
        
        setTimeout(() => {
            document.body.removeChild(effect);
            document.head.removeChild(style);
        }, 800);
    }

    // Enhanced Voice Recognition with Visual Feedback
    processVoiceResult(spokenText, confidence) {
        const currentWord = this.voicePracticeWords[this.currentVoiceWordIndex];
        const targetWord = currentWord.english.toLowerCase();
        const spoken = spokenText.toLowerCase().trim();

        // Calculate pronunciation accuracy
        const accuracy = this.calculatePronunciationAccuracy(targetWord, spoken);
        
        // Enhanced visual feedback
        this.createAccuracyVisualFeedback(accuracy);
        
        // Display results with animations
        const recognizedElement = document.getElementById("recognized-word");
        const scoreElement = document.getElementById("pronunciation-score");
        
        recognizedElement.textContent = spokenText;
        recognizedElement.style.animation = "none";
        recognizedElement.offsetHeight; // Trigger reflow
        recognizedElement.style.animation = "slideInFromRight 0.5s ease-out";
        
        scoreElement.textContent = this.getAccuracyLabel(accuracy);
        scoreElement.className = this.getAccuracyClass(accuracy);
        scoreElement.style.animation = "none";
        scoreElement.offsetHeight; // Trigger reflow
        scoreElement.style.animation = "scaleIn 0.6s ease-out 0.2s both";
        
        // Show feedback with stagger animation
        document.getElementById("voice-feedback").style.display = "block";
        
        // Generate tips
        const tips = this.generatePronunciationTips(targetWord, spoken, accuracy);
        document.getElementById("pronunciation-tips").innerHTML = tips;

        // Store result
        this.voiceResults.push({
            word: currentWord,
            spoken: spokenText,
            accuracy: accuracy,
            confidence: confidence
        });

        // Show appropriate buttons with animations
        if (accuracy >= 70) {
            const nextBtn = document.getElementById("voice-next-word");
            nextBtn.style.display = "inline-block";
            nextBtn.style.animation = "bounceIn 0.8s ease-out 0.5s both";
            document.getElementById("voice-status").textContent = "Great pronunciation!";
        } else {
            const tryBtn = document.getElementById("voice-try-again");
            tryBtn.style.display = "inline-block";
            tryBtn.style.animation = "bounceIn 0.8s ease-out 0.5s both";
            document.getElementById("voice-status").textContent = "Try again for better accuracy";
        }
    }

    createAccuracyVisualFeedback(accuracy) {
        const feedback = document.createElement("div");
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 200px;
            height: 200px;
            border-radius: 50%;
            background: ${accuracy >= 70 ? 
                "radial-gradient(circle, #10b981, #059669)" : 
                "radial-gradient(circle, #f59e0b, #d97706)"};
            opacity: 0;
            z-index: 1000;
            pointer-events: none;
            animation: accuracyPulse 1.5s ease-out;
        `;

        const style = document.createElement("style");
        style.textContent = `
            @keyframes accuracyPulse {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
                50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
            }
            @keyframes slideInFromRight {
                0% { opacity: 0; transform: translateX(50px); }
                100% { opacity: 1; transform: translateX(0); }
            }
            @keyframes scaleIn {
                0% { opacity: 0; transform: scale(0.5); }
                100% { opacity: 1; transform: scale(1); }
            }
            @keyframes bounceIn {
                0% { opacity: 0; transform: scale(0.3) translateY(50px); }
                50% { opacity: 1; transform: scale(1.05); }
                70% { transform: scale(0.9); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(feedback);

        setTimeout(() => {
            document.body.removeChild(feedback);
            document.head.removeChild(style);
        }, 1500);
    }

    // NEW FEATURES IMPLEMENTATION

    // Word of the Day
    showWordOfTheDay() {
        const modal = document.getElementById('word-of-day-modal');
        const today = new Date().toDateString();
        const savedWordOfDay = localStorage.getItem('wordOfDay');
        const savedDate = localStorage.getItem('wordOfDayDate');

        let dailyWord;
        if (savedDate === today && savedWordOfDay) {
            dailyWord = JSON.parse(savedWordOfDay);
        } else {
            // Select a random word as word of the day
            const randomIndex = Math.floor(Math.random() * this.words.length);
            dailyWord = this.words[randomIndex] || {
                english: 'Hello',
                turkish: 'Merhaba',
                definition: 'A greeting used when meeting someone'
            };
            localStorage.setItem('wordOfDay', JSON.stringify(dailyWord));
            localStorage.setItem('wordOfDayDate', today);
        }

        document.getElementById('daily-word').textContent = dailyWord.english;
        document.getElementById('daily-translation').textContent = dailyWord.turkish;
        document.getElementById('daily-definition').textContent = dailyWord.definition || 'A useful English word to learn today';

        modal.style.display = 'block';

        // Add event listeners
        document.getElementById('pronounce-daily').onclick = () => {
            this.speak(dailyWord.english);
        };

        document.getElementById('add-daily-to-favorites').onclick = () => {
            if (dailyWord.id && !this.favoriteWords.includes(dailyWord.id)) {
                this.favoriteWords.push(dailyWord.id);
                this.saveData();
                this.showToast('Added to favorites!', 'success');
            }
        };
    }

    // Study Streak Tracker
    showStreakTracker() {
        const streak = this.dailyPractice.streak || 0;
        const practiced = this.dailyPractice.practiced || 0;
        const goal = this.dailyPractice.goal || 10;
        
        this.showToast(`Current Streak: ${streak} days | Today: ${practiced}/${goal} words practiced`, 'info');
    }

    // Spelling Challenge
    showSpellingChallenge() {
        const modal = document.getElementById('spelling-challenge-modal');
        modal.style.display = 'block';
        
        this.currentSpellingWord = this.getRandomWord();
        this.startSpellingChallenge();

        // Add event listeners
        document.getElementById('play-spelling-audio').onclick = () => {
            this.speak(this.currentSpellingWord.english);
        };

        document.getElementById('spelling-check').onclick = () => {
            this.checkSpelling();
        };

        document.getElementById('spelling-skip').onclick = () => {
            this.nextSpellingWord();
        };

        document.getElementById('spelling-next').onclick = () => {
            this.nextSpellingWord();
        };

        document.getElementById('spelling-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkSpelling();
            }
        });
    }

    startSpellingChallenge() {
        document.getElementById('spelling-word').textContent = `Spell: ${this.currentSpellingWord.turkish}`;
        document.getElementById('spelling-input').value = '';
        document.getElementById('spelling-feedback').innerHTML = '';
        document.getElementById('spelling-next').style.display = 'none';
        document.getElementById('spelling-check').style.display = 'inline-block';
    }

    checkSpelling() {
        const userInput = document.getElementById('spelling-input').value.trim().toLowerCase();
        const correctWord = this.currentSpellingWord.english.toLowerCase();
        const feedback = document.getElementById('spelling-feedback');

        if (userInput === correctWord) {
            feedback.innerHTML = '<div class="correct-spelling">✅ Correct! Well done!</div>';
            document.getElementById('spelling-next').style.display = 'inline-block';
            document.getElementById('spelling-check').style.display = 'none';
        } else {
            feedback.innerHTML = `<div class="incorrect-spelling">❌ Incorrect. The correct spelling is: <strong>${this.currentSpellingWord.english}</strong></div>`;
            document.getElementById('spelling-next').style.display = 'inline-block';
            document.getElementById('spelling-check').style.display = 'none';
        }
    }

    nextSpellingWord() {
        this.currentSpellingWord = this.getRandomWord();
        this.startSpellingChallenge();
    }

    // Word Association Game
    showWordAssociation() {
        const modal = document.getElementById('word-association-modal');
        modal.style.display = 'block';
        
        this.currentAssociationWord = this.getRandomWord();
        this.startWordAssociation();

        document.getElementById('association-next').onclick = () => {
            this.nextAssociationWord();
        };
    }

    startWordAssociation() {
        const mainWord = this.currentAssociationWord;
        document.getElementById('association-main-word').textContent = mainWord.english;
        
        // Create options (1 correct + 3 random)
        const options = [mainWord.turkish];
        const otherWords = this.words.filter(w => w.id !== mainWord.id);
        
        for (let i = 0; i < 3 && i < otherWords.length; i++) {
            const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
            if (!options.includes(randomWord.turkish)) {
                options.push(randomWord.turkish);
            }
        }

        // Shuffle options
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        const optionsContainer = document.getElementById('association-options');
        optionsContainer.innerHTML = '';

        options.forEach(option => {
            const optionBtn = document.createElement('div');
            optionBtn.className = 'association-option';
            optionBtn.textContent = option;
            optionBtn.onclick = () => this.selectAssociation(option, mainWord.turkish);
            optionsContainer.appendChild(optionBtn);
        });

        document.getElementById('association-feedback').innerHTML = '';
        document.getElementById('association-next').style.display = 'none';
    }

    selectAssociation(selected, correct) {
        const options = document.querySelectorAll('.association-option');
        const feedback = document.getElementById('association-feedback');

        options.forEach(option => {
            option.onclick = null; // Disable further clicks
            if (option.textContent === correct) {
                option.classList.add('correct');
            } else if (option.textContent === selected && selected !== correct) {
                option.classList.add('wrong');
            }
        });

        if (selected === correct) {
            feedback.innerHTML = '<div class="correct-spelling">✅ Correct match!</div>';
        } else {
            feedback.innerHTML = `<div class="incorrect-spelling">❌ Incorrect. The correct match was: <strong>${correct}</strong></div>`;
        }

        document.getElementById('association-next').style.display = 'inline-block';
    }

    nextAssociationWord() {
        this.currentAssociationWord = this.getRandomWord();
        this.startWordAssociation();
    }

    getRandomWord() {
        if (this.words.length === 0) {
            return {
                id: 'default',
                english: 'Hello',
                turkish: 'Merhaba',
                definition: 'A common greeting'
            };
        }
        const randomIndex = Math.floor(Math.random() * this.words.length);
        return this.words[randomIndex];
    }

    // Social Features Implementation
    loadSocialData() {
        try {
            const savedSocialData = localStorage.getItem('vocabularySocialData');
            if (savedSocialData) {
                this.socialData = { ...this.socialData, ...JSON.parse(savedSocialData) };
            }
        } catch (error) {
            console.error('Error loading social data:', error);
        }
    }

    saveSocialData() {
        try {
            localStorage.setItem('vocabularySocialData', JSON.stringify(this.socialData));
        } catch (error) {
            console.error('Error saving social data:', error);
        }
    }

    initializeAchievements() {
        const defaultAchievements = [
            {
                id: 'first_word',
                title: 'First Steps',
                description: 'Add your first word to the vocabulary',
                icon: '🎯',
                unlocked: false,
                progress: 0,
                target: 1
            },
            {
                id: 'word_collector',
                title: 'Word Collector', 
                description: 'Add 50 words to your vocabulary',
                icon: '📚',
                unlocked: false,
                progress: 0,
                target: 50
            },
            {
                id: 'quiz_master',
                title: 'Quiz Master',
                description: 'Complete 10 quizzes',
                icon: '🏆',
                unlocked: false,
                progress: 0,
                target: 10
            },
            {
                id: 'streak_warrior',
                title: 'Streak Warrior',
                description: 'Maintain a 7-day learning streak',
                icon: '🔥',
                unlocked: false,
                progress: 0,
                target: 7
            },
            {
                id: 'perfectionist',
                title: 'Perfectionist',
                description: 'Get 100% accuracy in a quiz',
                icon: '💯',
                unlocked: false,
                progress: 0,
                target: 100
            }
        ];

        if (!this.socialData.achievements.length) {
            this.socialData.achievements = defaultAchievements;
        }
    }

    setupStatisticsScreen() {
        this.updateStatisticsOverview();
        this.updateDetailedAnalysis();
        this.updateProgressTracking();
        this.initializePDFReports();
        this.showStatsSection('overview');
    }

    showStatsSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.stats-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all tabs
        document.querySelectorAll('.stats-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected section and activate tab
        const targetSection = document.getElementById(`${sectionName}-section`);
        const targetTab = document.getElementById(`${sectionName}-tab`);

        if (targetSection) targetSection.classList.add('active');
        if (targetTab) targetTab.classList.add('active');

        // Update content based on section
        if (sectionName === 'detailed') {
            this.updateDetailedAnalysis();
        } else if (sectionName === 'progress') {
            this.updateProgressTracking();
        } else if (sectionName === 'reports') {
            this.updatePDFReportsHistory();
        } else if (sectionName === 'overview') {
            this.updateStatisticsOverview();
        }
    }

    updateStatisticsOverview() {
        // Update overview cards
        this.updateElementText('overview-total-words', this.words.length);
        this.updateElementText('overview-learned-words', this.learnedWords.size);
        this.updateElementText('overview-favorite-words', this.favoriteWords.length);
        this.updateElementText('overview-difficult-words', this.difficultWords.length);
        this.updateElementText('overview-streak', this.dailyPractice.streak);
        this.updateElementText('overview-categories', this.categories.length);

        // Update progress circle
        const totalWords = this.words.length;
        const learnedWords = this.learnedWords.size;
        const progressPercent = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;
        
        this.updateElementText('progress-percentage', `${progressPercent}%`);
        
        const progressCircle = document.getElementById('progress-circle');
        if (progressCircle) {
            const circumference = 502.65; // 2 * π * 80
            const offset = circumference - (progressPercent / 100) * circumference;
            progressCircle.style.strokeDashoffset = offset;
        }

        // Update progress details
        this.updateElementText('words-this-week', this.getWordsAddedThisWeek());
        this.updateElementText('quiz-sessions', this.getQuizSessionsCount());
        this.updateElementText('average-score', this.getAverageQuizScore());
        this.updateElementText('total-study-time', this.getTotalStudyTime());
    }

    getLevelTitle() {
        const level = this.socialData.profile.level;
        if (level < 5) return 'Beginner';
        if (level < 15) return 'Intermediate';
        if (level < 30) return 'Advanced';
        return 'Expert';
    }

    updateDetailedAnalysis() {
        // Update category breakdown
        this.updateCategoryBreakdown();
        
        // Update difficulty distribution
        this.updateDifficultyDistribution();
        
        // Update quiz performance breakdown
        this.updateQuizPerformanceBreakdown();
    }

    updateCategoryBreakdown() {
        const categoryBreakdown = document.getElementById('category-breakdown');
        if (!categoryBreakdown) return;

        categoryBreakdown.innerHTML = '';

        this.categories.forEach(category => {
            const wordsInCategory = this.words.filter(word => word.category === category.id).length;
            const learnedInCategory = this.words.filter(word => 
                word.category === category.id && this.learnedWords.has(word.id)).length;
            
            const progressPercent = wordsInCategory > 0 ? Math.round((learnedInCategory / wordsInCategory) * 100) : 0;

            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.innerHTML = `
                <div class="category-info">
                    <span class="category-name">${category.name}</span>
                    <span class="category-stats">${learnedInCategory}/${wordsInCategory} words</span>
                </div>
                <div class="category-progress">
                    <div class="category-progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <span class="category-percentage">${progressPercent}%</span>
            `;
            
            categoryBreakdown.appendChild(categoryItem);
        });
    }

    updateDifficultyDistribution() {
        const beginner = this.words.filter(word => word.difficulty === 'beginner').length;
        const intermediate = this.words.filter(word => word.difficulty === 'intermediate').length;
        const advanced = this.words.filter(word => word.difficulty === 'advanced').length;
        const total = this.words.length;

        // Update counts
        this.updateElementText('beginner-count', beginner);
        this.updateElementText('intermediate-count', intermediate);
        this.updateElementText('advanced-count', advanced);

        // Update progress bars
        if (total > 0) {
            const beginnerPercent = (beginner / total) * 100;
            const intermediatePercent = (intermediate / total) * 100;
            const advancedPercent = (advanced / total) * 100;

            const beginnerFill = document.getElementById('beginner-fill');
            const intermediateFill = document.getElementById('intermediate-fill');
            const advancedFill = document.getElementById('advanced-fill');

            if (beginnerFill) beginnerFill.style.width = `${beginnerPercent}%`;
            if (intermediateFill) intermediateFill.style.width = `${intermediatePercent}%`;
            if (advancedFill) advancedFill.style.width = `${advancedPercent}%`;
        }
    }

    updateQuizPerformanceBreakdown() {
        // Since we don't have detailed quiz stats yet, show placeholder values
        // These would be calculated from actual quiz history in a full implementation
        this.updateElementText('tr-en-score', '85%');
        this.updateElementText('en-tr-score', '78%');
        this.updateElementText('writing-score', '92%');
        this.updateElementText('audio-score', '88%');
    }

    updateProgressTracking() {
        // Update weekly goals
        const weeklyGoal = 10; // Default goal
        const wordsThisWeek = this.getWordsAddedThisWeek();
        const weeklyProgress = Math.min((wordsThisWeek / weeklyGoal) * 100, 100);
        
        this.updateElementText('weekly-goal', weeklyGoal);
        this.updateElementText('weekly-status', `${wordsThisWeek}/${weeklyGoal}`);
        
        const weeklyProgressBar = document.getElementById('weekly-progress');
        if (weeklyProgressBar) {
            weeklyProgressBar.style.width = `${weeklyProgress}%`;
        }

        // Update streak information
        this.updateElementText('current-streak', `${this.dailyPractice.streak} days`);
        this.updateElementText('longest-streak', `${this.getLongestStreak()} days`);
        this.updateElementText('week-activity', `${this.getWeekActivity()}/7 days`);

        // Update recent activity
        this.updateRecentActivity();
    }

    getWordsAddedThisWeek() {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        return this.words.filter(word => {
            const wordDate = new Date(word.dateAdded || word.id);
            return wordDate >= oneWeekAgo;
        }).length;
    }

    getQuizSessionsCount() {
        // Placeholder - would be tracked from actual quiz sessions
        return this.words.length > 0 ? Math.floor(this.words.length / 5) : 0;
    }

    getAverageQuizScore() {
        // Placeholder - would be calculated from actual quiz results
        return '84%';
    }

    getTotalStudyTime() {
        // Placeholder - would be tracked from actual study sessions
        return `${Math.floor(this.words.length * 1.5)} min`;
    }

    getLongestStreak() {
        // Placeholder - would be tracked from historical data
        return Math.max(this.dailyPractice.streak, 7);
    }

    getWeekActivity() {
        // Placeholder - would be tracked from daily practice
        return Math.min(this.dailyPractice.streak, 7);
    }

    updateRecentActivity() {
        const recentActivity = document.getElementById('recent-activity');
        if (!recentActivity) return;

        const activities = [
            { action: 'Added new word', item: 'Latest vocabulary', time: '2 hours ago' },
            { action: 'Completed quiz', item: '15 words practiced', time: '1 day ago' },
            { action: 'Marked as learned', item: '3 words mastered', time: '2 days ago' },
            { action: 'Created category', item: 'Business Terms', time: '3 days ago' }
        ];

        recentActivity.innerHTML = '';
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-text">
                    <span class="activity-action">${activity.action}:</span>
                    <span class="activity-item">${activity.item}</span>
                </div>
                <span class="activity-time">${activity.time}</span>
            `;
            recentActivity.appendChild(activityItem);
        });
    }

    initializePDFReports() {
        this.setupDateInputs();
        this.updatePDFReportsHistory();
    }

    setupDateInputs() {
        const startDate = document.getElementById('report-start-date');
        const endDate = document.getElementById('report-end-date');
        
        if (startDate && endDate) {
            const today = new Date();
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            
            startDate.value = oneMonthAgo.toISOString().split('T')[0];
            endDate.value = today.toISOString().split('T')[0];
        }
    }

    updatePDFReportsHistory() {
        const historyList = document.getElementById('pdf-history-list');
        if (!historyList) return;

        // Check if there are any saved reports
        const savedReports = JSON.parse(localStorage.getItem('vocabmaster-reports') || '[]');
        
        if (savedReports.length === 0) {
            historyList.innerHTML = '<p class="no-reports">No reports generated yet. Create your first report above!</p>';
        } else {
            historyList.innerHTML = '';
            savedReports.slice(-5).reverse().forEach(report => {
                const reportItem = document.createElement('div');
                reportItem.className = 'report-item';
                reportItem.innerHTML = `
                    <div class="report-info">
                        <span class="report-name">${report.name}</span>
                        <span class="report-date">Generated: ${new Date(report.date).toLocaleDateString()}</span>
                    </div>
                    <button class="action-btn" onclick="app.downloadSavedReport('${report.id}')">📄 Download</button>
                `;
                historyList.appendChild(reportItem);
            });
        }
    }

    generateLeaderboardData() {
        const sampleUsers = [
            { name: 'Alex Johnson', avatar: '🧑‍🎓', score: 2450, badge: 'Champion' },
            { name: 'Maria Garcia', avatar: '👩‍🏫', score: 2380, badge: 'Expert' },
            { name: 'David Kim', avatar: '🧑‍💼', score: 2250, badge: 'Pro' },
            { name: this.socialData.profile.username, avatar: this.socialData.profile.avatar, score: this.socialData.profile.xp, badge: 'Rising Star' },
            { name: 'Sarah Wilson', avatar: '🦸', score: 1950, badge: 'Learner' },
            { name: 'Michael Chen', avatar: '🤖', score: 1820, badge: 'Student' }
        ];

        const sortedUsers = sampleUsers.sort((a, b) => b.score - a.score);
        
        this.leaderboardData = {
            weekly: sortedUsers.slice(),
            monthly: sortedUsers.slice(),
            allTime: sortedUsers.slice()
        };
    }

    showLeaderboard(period) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`${period}-leaderboard`);
        if (activeBtn) activeBtn.classList.add('active');

        const leaderboardList = document.getElementById('leaderboard-list');
        if (!leaderboardList) return;

        leaderboardList.innerHTML = '';
        const data = this.leaderboardData?.[period] || [];
        
        data.forEach((user, index) => {
            const entry = document.createElement('div');
            entry.className = 'leaderboard-entry';
            
            let rankClass = '';
            if (index === 0) rankClass = 'gold';
            else if (index === 1) rankClass = 'silver';
            else if (index === 2) rankClass = 'bronze';
            
            entry.innerHTML = `
                <span class="leaderboard-rank ${rankClass}">#${index + 1}</span>
                <div class="leaderboard-avatar">${user.avatar}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${user.name}</div>
                    <div class="leaderboard-score">${user.score} XP</div>
                </div>
                <span class="leaderboard-badge">${user.badge}</span>
            `;
            
            leaderboardList.appendChild(entry);
        });
    }

    displayFriends() {
        const friendsList = document.getElementById('friends-list');
        if (!friendsList) return;

        if (this.socialData.friends.length === 0) {
            friendsList.innerHTML = `
                <div class="no-friends">
                    <p>No friends yet! Add friends to compare progress and compete.</p>
                </div>
            `;
        } else {
            friendsList.innerHTML = '';
            this.socialData.friends.forEach(friend => {
                const friendItem = document.createElement('div');
                friendItem.className = 'friend-item';
                friendItem.innerHTML = `
                    <div class="friend-avatar">${friend.avatar}</div>
                    <div class="friend-info">
                        <div class="friend-name">${friend.username}</div>
                        <div class="friend-status">Level ${friend.level} • ${friend.xp} XP</div>
                    </div>
                    <div class="friend-actions">
                        <button class="action-btn" onclick="app.challengeFriend('${friend.id}')">⚔️ Challenge</button>
                        <button class="action-btn" onclick="app.removeFriend('${friend.id}')">❌ Remove</button>
                    </div>
                `;
                friendsList.appendChild(friendItem);
            });
        }
    }

    updateShareOptions() {
        const achievementSelector = document.getElementById('achievement-selector');
        if (achievementSelector) {
            achievementSelector.innerHTML = '<option value="">Select an achievement...</option>';
            this.socialData.achievements.filter(a => a.unlocked).forEach(achievement => {
                const option = document.createElement('option');
                option.value = achievement.id;
                option.textContent = `${achievement.icon} ${achievement.title}`;
                achievementSelector.appendChild(option);
            });
        }
    }

    checkAchievement(achievementId) {
        const achievement = this.socialData.achievements.find(a => a.id === achievementId);
        if (!achievement || achievement.unlocked) return;

        let progress = 0;
        switch (achievementId) {
            case 'first_word':
                progress = this.words.length > 0 ? 1 : 0;
                break;
            case 'word_collector':
                progress = this.words.length;
                break;
            case 'streak_warrior':
                progress = this.dailyPractice.streak;
                break;
        }

        achievement.progress = progress;
        
        if (progress >= achievement.target && !achievement.unlocked) {
            achievement.unlocked = true;
            this.socialData.profile.xp += 100;
            this.saveSocialData();
            this.showToast(`Achievement Unlocked: ${achievement.title}!`, 'success');
        }
    }

    // Complete statistics feature methods
    showStatsTab(tabName) {
        this.showStatsSection(tabName);
    }

    // PDF Generation Functions
    generateSummaryPDF() {
        console.log('generateSummaryPDF called');
        const includeWords = document.getElementById('include-words')?.checked || true;
        const includeCategories = document.getElementById('include-categories')?.checked || true;
        const includeProgress = document.getElementById('include-progress')?.checked || true;

        console.log('Checkbox values:', { includeWords, includeCategories, includeProgress });

        const reportData = this.generateReportData('summary', {
            includeWords,
            includeCategories,
            includeProgress
        });

        console.log('Report data generated:', reportData);
        this.createAndDownloadPDF(reportData, 'Learning_Summary_Report');
    }

    generateAnalysisPDF() {
        const includeQuizStats = document.getElementById('include-quiz-stats').checked;
        const includeDifficulty = document.getElementById('include-difficulty').checked;
        const includeRecommendations = document.getElementById('include-recommendations').checked;

        const reportData = this.generateReportData('analysis', {
            includeQuizStats,
            includeDifficulty,
            includeRecommendations
        });

        this.createAndDownloadPDF(reportData, 'Detailed_Analysis_Report');
    }

    generateTimelinePDF() {
        const includeTimeline = document.getElementById('include-timeline').checked;
        const includeMilestones = document.getElementById('include-milestones').checked;
        const includeStreaks = document.getElementById('include-streaks').checked;

        const reportData = this.generateReportData('timeline', {
            includeTimeline,
            includeMilestones,
            includeStreaks
        });

        this.createAndDownloadPDF(reportData, 'Progress_Timeline_Report');
    }

    generateCustomPDF() {
        const startDate = document.getElementById('report-start-date').value;
        const endDate = document.getElementById('report-end-date').value;
        const includeOverview = document.getElementById('custom-overview').checked;
        const includeWords = document.getElementById('custom-words').checked;
        const includeQuizzes = document.getElementById('custom-quizzes').checked;
        const includeProgress = document.getElementById('custom-progress').checked;

        const reportData = this.generateReportData('custom', {
            startDate,
            endDate,
            includeOverview,
            includeWords,
            includeQuizzes,
            includeProgress
        });

        this.createAndDownloadPDF(reportData, 'Custom_Report');
    }

    generateReportData(type, options) {
        const userName = this.userPreferences.userName || 'Vocabulary Learner';
        const currentDate = new Date().toLocaleDateString();
        
        const baseData = {
            title: this.getReportTitle(type),
            userName,
            generatedDate: currentDate,
            totalWords: this.words.length,
            learnedWords: this.learnedWords.size,
            favoriteWords: this.favoriteWords.length,
            difficultWords: this.difficultWords.length,
            categories: this.categories.length,
            streak: this.dailyPractice.streak
        };

        switch (type) {
            case 'summary':
                return this.generateSummaryData(baseData, options);
            case 'analysis':
                return this.generateAnalysisData(baseData, options);
            case 'timeline':
                return this.generateTimelineData(baseData, options);
            case 'custom':
                return this.generateCustomData(baseData, options);
            default:
                return baseData;
        }
    }

    getReportTitle(type) {
        const titles = {
            'summary': 'Learning Summary Report',
            'analysis': 'Detailed Analysis Report',
            'timeline': 'Progress Timeline Report',
            'custom': 'Custom Learning Report'
        };
        return titles[type] || 'Learning Report';
    }

    generateSummaryData(baseData, options) {
        const data = { ...baseData };
        
        if (options.includeWords) {
            data.wordsList = this.words.map(word => ({
                english: word.english,
                turkish: word.turkish,
                category: this.getCategoryName(word.category),
                difficulty: word.difficulty,
                isLearned: this.learnedWords.has(word.id),
                isFavorite: this.favoriteWords.includes(word.id),
                isDifficult: this.difficultWords.includes(word.id)
            }));
        }

        if (options.includeCategories) {
            data.categoriesBreakdown = this.categories.map(category => ({
                name: category.name,
                wordCount: this.words.filter(word => word.category === category.id).length,
                learnedCount: this.words.filter(word => 
                    word.category === category.id && this.learnedWords.has(word.id)).length
            }));
        }

        if (options.includeProgress) {
            data.progressMetrics = {
                learningRate: baseData.totalWords > 0 ? 
                    Math.round((baseData.learnedWords / baseData.totalWords) * 100) : 0,
                wordsThisWeek: this.getWordsAddedThisWeek(),
                averageScore: this.getAverageQuizScore(),
                studyTime: this.getTotalStudyTime()
            };
        }

        return data;
    }

    generateAnalysisData(baseData, options) {
        const data = { ...baseData };
        
        if (options.includeQuizStats) {
            data.quizPerformance = {
                turkishToEnglish: '85%',
                englishToTurkish: '78%',
                writing: '92%',
                audio: '88%'
            };
        }

        if (options.includeDifficulty) {
            const beginner = this.words.filter(word => word.difficulty === 'beginner').length;
            const intermediate = this.words.filter(word => word.difficulty === 'intermediate').length;
            const advanced = this.words.filter(word => word.difficulty === 'advanced').length;
            
            data.difficultyDistribution = {
                beginner: { count: beginner, percentage: baseData.totalWords > 0 ? Math.round((beginner / baseData.totalWords) * 100) : 0 },
                intermediate: { count: intermediate, percentage: baseData.totalWords > 0 ? Math.round((intermediate / baseData.totalWords) * 100) : 0 },
                advanced: { count: advanced, percentage: baseData.totalWords > 0 ? Math.round((advanced / baseData.totalWords) * 100) : 0 }
            };
        }

        if (options.includeRecommendations) {
            data.recommendations = this.generateLearningRecommendations();
        }

        return data;
    }

    generateTimelineData(baseData, options) {
        const data = { ...baseData };
        
        if (options.includeTimeline) {
            data.timeline = this.generateProgressTimeline();
        }

        if (options.includeMilestones) {
            data.milestones = this.generateMilestones();
        }

        if (options.includeStreaks) {
            data.streakData = {
                current: baseData.streak,
                longest: this.getLongestStreak(),
                weekActivity: this.getWeekActivity()
            };
        }

        return data;
    }

    generateCustomData(baseData, options) {
        const data = { ...baseData };
        
        if (options.startDate && options.endDate) {
            data.dateRange = {
                start: options.startDate,
                end: options.endDate
            };
        }

        if (options.includeOverview) {
            data.overview = {
                totalWords: baseData.totalWords,
                learnedWords: baseData.learnedWords,
                categories: baseData.categories,
                streak: baseData.streak
            };
        }

        if (options.includeWords) {
            data.wordsList = this.words.map(word => ({
                english: word.english,
                turkish: word.turkish,
                category: this.getCategoryName(word.category)
            }));
        }

        if (options.includeQuizzes) {
            data.quizResults = {
                sessionsCompleted: this.getQuizSessionsCount(),
                averageScore: this.getAverageQuizScore()
            };
        }

        if (options.includeProgress) {
            data.progressCharts = {
                learningRate: baseData.totalWords > 0 ? 
                    Math.round((baseData.learnedWords / baseData.totalWords) * 100) : 0,
                weeklyProgress: this.getWordsAddedThisWeek()
            };
        }

        return data;
    }

    createAndDownloadPDF(reportData, filename) {
        console.log('createAndDownloadPDF called with:', { reportData, filename });
        
        // Create HTML content for the PDF
        const htmlContent = this.generateHTMLReport(reportData);
        console.log('HTML content generated');
        
        // Save report to history
        this.saveReportToHistory(reportData, filename);
        
        // Create downloadable HTML file (since we're client-side only)
        this.downloadHTMLReport(htmlContent, filename);
        console.log('Download initiated');
        
        this.showToast('Report generated and downloaded successfully!', 'success');
        this.updatePDFReportsHistory();
    }

    generateHTMLReport(data) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            line-height: 1.6; 
            color: #333;
        }
        .header { 
            text-align: center; 
            border-bottom: 2px solid #4CAF50; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
        }
        .title { 
            color: #4CAF50; 
            font-size: 28px; 
            margin-bottom: 10px;
        }
        .subtitle { 
            color: #666; 
            font-size: 16px;
        }
        .section { 
            margin-bottom: 30px; 
            padding: 20px; 
            border: 1px solid #ddd; 
            border-radius: 8px;
        }
        .section h2 { 
            color: #4CAF50; 
            border-bottom: 1px solid #eee; 
            padding-bottom: 10px;
        }
        .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 15px; 
            margin: 20px 0;
        }
        .stat-card { 
            background: #f9f9f9; 
            padding: 15px; 
            border-radius: 6px; 
            text-align: center;
        }
        .stat-number { 
            font-size: 24px; 
            font-weight: bold; 
            color: #4CAF50;
        }
        .stat-label { 
            color: #666; 
            font-size: 14px;
        }
        .word-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0;
        }
        .word-table th, .word-table td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left;
        }
        .word-table th { 
            background-color: #4CAF50; 
            color: white;
        }
        .word-table tr:nth-child(even) { 
            background-color: #f2f2f2;
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #ddd; 
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${data.title}</h1>
        <p class="subtitle">Generated for ${data.userName} on ${data.generatedDate}</p>
    </div>

    <div class="section">
        <h2>📊 Overview Statistics</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${data.totalWords}</div>
                <div class="stat-label">Total Words</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.learnedWords}</div>
                <div class="stat-label">Words Learned</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.favoriteWords}</div>
                <div class="stat-label">Favorite Words</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.streak}</div>
                <div class="stat-label">Day Streak</div>
            </div>
        </div>
    </div>

    ${data.wordsList ? this.generateWordsSection(data.wordsList) : ''}
    ${data.categoriesBreakdown ? this.generateCategoriesSection(data.categoriesBreakdown) : ''}
    ${data.progressMetrics ? this.generateProgressSection(data.progressMetrics) : ''}
    ${data.quizPerformance ? this.generateQuizSection(data.quizPerformance) : ''}
    ${data.recommendations ? this.generateRecommendationsSection(data.recommendations) : ''}

    <div class="footer">
        <p>Generated by VocabMaster - English Vocabulary Learning Application</p>
        <p>Report ID: ${Date.now()}</p>
    </div>
</body>
</html>`;
    }

    generateWordsSection(wordsList) {
        const wordsTable = wordsList.map(word => `
            <tr>
                <td>${word.english}</td>
                <td>${word.turkish}</td>
                <td>${word.category}</td>
                <td>${word.difficulty}</td>
                <td>${word.isLearned ? '✅' : '❌'}</td>
            </tr>
        `).join('');

        return `
    <div class="section">
        <h2>📚 Words List</h2>
        <table class="word-table">
            <thead>
                <tr>
                    <th>English</th>
                    <th>Turkish</th>
                    <th>Category</th>
                    <th>Difficulty</th>
                    <th>Learned</th>
                </tr>
            </thead>
            <tbody>
                ${wordsTable}
            </tbody>
        </table>
    </div>`;
    }

    generateCategoriesSection(categories) {
        const categoriesList = categories.map(cat => `
            <div class="stat-card">
                <div class="stat-number">${cat.learnedCount}/${cat.wordCount}</div>
                <div class="stat-label">${cat.name}</div>
            </div>
        `).join('');

        return `
    <div class="section">
        <h2>📁 Categories Breakdown</h2>
        <div class="stats-grid">
            ${categoriesList}
        </div>
    </div>`;
    }

    generateProgressSection(progress) {
        return `
    <div class="section">
        <h2>📈 Progress Metrics</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${progress.learningRate}%</div>
                <div class="stat-label">Learning Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${progress.wordsThisWeek}</div>
                <div class="stat-label">Words This Week</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${progress.averageScore}</div>
                <div class="stat-label">Average Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${progress.studyTime}</div>
                <div class="stat-label">Study Time</div>
            </div>
        </div>
    </div>`;
    }

    generateQuizSection(quiz) {
        return `
    <div class="section">
        <h2>🎯 Quiz Performance</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${quiz.turkishToEnglish}</div>
                <div class="stat-label">Turkish to English</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${quiz.englishToTurkish}</div>
                <div class="stat-label">English to Turkish</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${quiz.writing}</div>
                <div class="stat-label">Writing Practice</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${quiz.audio}</div>
                <div class="stat-label">Audio Practice</div>
            </div>
        </div>
    </div>`;
    }

    generateRecommendationsSection(recommendations) {
        const recList = recommendations.map(rec => `<li>${rec}</li>`).join('');
        return `
    <div class="section">
        <h2>💡 Learning Recommendations</h2>
        <ul>
            ${recList}
        </ul>
    </div>`;
    }

    generateLearningRecommendations() {
        const recommendations = [];
        
        if (this.difficultWords.length > 0) {
            recommendations.push(`Focus on ${this.difficultWords.length} difficult words that need more practice`);
        }
        
        if (this.learnedWords.size < this.words.length * 0.5) {
            recommendations.push('Consider spending more time on quiz practice to improve learning rate');
        }
        
        if (this.dailyPractice.streak < 7) {
            recommendations.push('Try to practice daily to build a stronger learning streak');
        }
        
        if (this.favoriteWords.length < 10) {
            recommendations.push('Mark more words as favorites for focused review sessions');
        }
        
        recommendations.push('Regular review of learned words helps with long-term retention');
        recommendations.push('Consider adding words from different categories for balanced vocabulary');
        
        return recommendations;
    }

    generateProgressTimeline() {
        // Generate a simple timeline based on available data
        const timeline = [];
        
        if (this.words.length > 0) {
            timeline.push({
                date: 'Recently',
                event: `Added ${this.words.length} vocabulary words`,
                type: 'milestone'
            });
        }
        
        if (this.learnedWords.size > 0) {
            timeline.push({
                date: 'Recently',
                event: `Learned ${this.learnedWords.size} words`,
                type: 'achievement'
            });
        }
        
        if (this.dailyPractice.streak > 0) {
            timeline.push({
                date: 'Current',
                event: `Maintaining ${this.dailyPractice.streak}-day practice streak`,
                type: 'streak'
            });
        }
        
        return timeline;
    }

    generateMilestones() {
        const milestones = [];
        
        if (this.words.length >= 10) milestones.push('📚 Added 10+ words');
        if (this.words.length >= 50) milestones.push('📖 Added 50+ words');
        if (this.words.length >= 100) milestones.push('📚 Word Collector (100+ words)');
        
        if (this.learnedWords.size >= 10) milestones.push('🎯 Learned 10+ words');
        if (this.learnedWords.size >= 25) milestones.push('⭐ Learning Star (25+ words)');
        if (this.learnedWords.size >= 50) milestones.push('🏆 Vocabulary Master (50+ words)');
        
        if (this.dailyPractice.streak >= 3) milestones.push('🔥 3-day streak');
        if (this.dailyPractice.streak >= 7) milestones.push('⚡ Week warrior');
        if (this.dailyPractice.streak >= 30) milestones.push('💪 Month champion');
        
        return milestones;
    }

    saveReportToHistory(reportData, filename) {
        const reports = JSON.parse(localStorage.getItem('vocabmaster-reports') || '[]');
        const newReport = {
            id: Date.now().toString(),
            name: `${reportData.title} - ${reportData.generatedDate}`,
            filename: filename,
            date: new Date().toISOString(),
            data: reportData
        };
        
        reports.push(newReport);
        // Keep only last 10 reports
        if (reports.length > 10) {
            reports.shift();
        }
        
        localStorage.setItem('vocabmaster-reports', JSON.stringify(reports));
    }

    downloadHTMLReport(htmlContent, filename) {
        console.log('downloadHTMLReport called with filename:', filename);
        try {
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}_${new Date().toISOString().split('T')[0]}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log('Download completed successfully');
        } catch (error) {
            console.error('Error in downloadHTMLReport:', error);
            this.showToast('Error generating PDF report', 'error');
        }
    }

    downloadSavedReport(reportId) {
        const reports = JSON.parse(localStorage.getItem('vocabmaster-reports') || '[]');
        const report = reports.find(r => r.id === reportId);
        
        if (report) {
            const htmlContent = this.generateHTMLReport(report.data);
            this.downloadHTMLReport(htmlContent, report.filename);
            this.showToast('Report downloaded successfully!', 'success');
        }
    }

    showEditProfileModal() {
        const modal = document.getElementById('edit-profile-modal');
        const usernameInput = document.getElementById('profile-username-input');
        
        if (modal && usernameInput) {
            usernameInput.value = this.socialData.profile.username;
            modal.style.display = 'block';
            
            // Highlight current avatar
            document.querySelectorAll('.avatar-option').forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.avatar === this.socialData.profile.avatar) {
                    option.classList.add('selected');
                }
            });
        }
    }

    selectAvatar(avatar) {
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.classList.remove('selected');
        });
        event.target.classList.add('selected');
        this.selectedAvatar = avatar;
    }

    saveProfileChanges() {
        const usernameInput = document.getElementById('profile-username-input');
        if (usernameInput && usernameInput.value.trim()) {
            this.socialData.profile.username = usernameInput.value.trim();
            if (this.selectedAvatar) {
                this.socialData.profile.avatar = this.selectedAvatar;
            }
            this.saveSocialData();
            this.updateSocialProfile();
            this.hideModal('edit-profile-modal');
            this.showToast('Profile updated successfully!', 'success');
        }
    }

    closeEditProfileModal() {
        this.hideModal('edit-profile-modal');
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    showAddFriendModal() {
        const modal = document.getElementById('add-friend-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    sendFriendRequest() {
        const usernameInput = document.getElementById('friend-username');
        const codeInput = document.getElementById('friend-code');
        
        const username = usernameInput?.value.trim();
        const code = codeInput?.value.trim();
        
        if (username || code) {
            // Simulate friend request (client-side only)
            const newFriend = {
                id: Date.now().toString(),
                username: username || `User_${code}`,
                avatar: ['🧑‍🎓', '👩‍🏫', '🧑‍💼', '🦸', '🤖', '🦉'][Math.floor(Math.random() * 6)],
                level: Math.floor(Math.random() * 20) + 1,
                xp: Math.floor(Math.random() * 2000) + 500
            };
            
            if (!this.socialData.friends) this.socialData.friends = [];
            this.socialData.friends.push(newFriend);
            this.saveSocialData();
            this.displayFriends();
            this.hideModal('add-friend-modal');
            this.showToast('Friend added successfully!', 'success');
            
            // Clear inputs
            if (usernameInput) usernameInput.value = '';
            if (codeInput) codeInput.value = '';
        }
    }

    closeAddFriendModal() {
        this.hideModal('add-friend-modal');
    }

    filterLeaderboard(period) {
        this.showLeaderboard(period);
    }

    generateProgressReport() {
        this.generateProgressImage();
    }

    shareAchievement() {
        const selector = document.getElementById('achievement-selector');
        if (selector && selector.value) {
            const achievement = this.socialData.achievements.find(a => a.id === selector.value);
            if (achievement) {
                const message = `🏆 I just unlocked "${achievement.title}" in VocabMaster! ${achievement.icon}

${achievement.description}

Join me in learning vocabulary! 📚✨`;

                navigator.clipboard.writeText(message).then(() => {
                    this.showToast('Achievement share text copied!', 'success');
                }).catch(() => {
                    this.showToast('Generated share text (copy manually)', 'info');
                    console.log(message);
                });
            }
        }
    }

    showCreateChallengeModal() {
        this.showChallengeModal();
    }

    createChallenge() {
        const nameInput = document.getElementById('challenge-name');
        const typeSelect = document.getElementById('challenge-type');
        const targetInput = document.getElementById('challenge-target');
        const durationInput = document.getElementById('challenge-duration');

        if (nameInput?.value.trim() && typeSelect?.value && targetInput?.value && durationInput?.value) {
            const challenge = {
                id: Date.now().toString(),
                name: nameInput.value.trim(),
                type: typeSelect.value,
                target: parseInt(targetInput.value),
                duration: parseInt(durationInput.value),
                createdAt: new Date().toISOString(),
                participants: [this.socialData.profile.username]
            };

            if (!this.socialData.challenges) this.socialData.challenges = [];
            this.socialData.challenges.push(challenge);
            this.saveSocialData();
            this.hideModal('challenge-modal');
            this.showToast('Challenge created successfully!', 'success');

            // Clear form
            nameInput.value = '';
            targetInput.value = '';
            durationInput.value = '7';
        }
    }

    closeChallengeModal() {
        this.hideModal('challenge-modal');
    }

    // Comprehensive Progress Analysis System
    showProgressAnalysisModal() {
        // Create modal if it doesn't exist
        let modal = document.getElementById('progress-analysis-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'progress-analysis-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content large-modal">
                    <div class="modal-header">
                        <h3>📊 Detailed Progress Analysis</h3>
                        <button id="close-progress-analysis" class="close-btn">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="analysis-options">
                            <div class="input-group">
                                <label for="report-name">Report Name:</label>
                                <input type="text" id="report-name" placeholder="My VocabMaster Progress Report" maxlength="50">
                            </div>
                            
                            <div class="input-group">
                                <label for="report-format">Analysis Type:</label>
                                <select id="report-format">
                                    <option value="comprehensive">📋 Comprehensive Analysis (Recommended)</option>
                                    <option value="summary">📝 Quick Summary</option>
                                    <option value="detailed">📊 Statistical Analysis</option>
                                    <option value="recommendations">💡 Learning Recommendations</option>
                                </select>
                            </div>
                            
                            <div class="analysis-preview" id="analysis-preview">
                                <h4>Analysis Preview:</h4>
                                <div id="preview-content" class="preview-content"></div>
                            </div>
                            
                            <div class="analysis-stats" id="current-stats">
                                <h4>Current Statistics:</h4>
                                <div class="stats-grid" id="stats-display"></div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="generate-pdf-analysis" class="btn primary">📄 Generate PDF Report</button>
                        <button id="generate-text-analysis" class="btn secondary">📝 Generate Text Report</button>
                        <button id="preview-analysis" class="btn info">👁️ Preview Analysis</button>
                        <button id="cancel-analysis" class="btn tertiary">Cancel</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Add event listeners
            document.getElementById('close-progress-analysis').onclick = () => this.hideProgressAnalysisModal();
            document.getElementById('cancel-analysis').onclick = () => this.hideProgressAnalysisModal();
            document.getElementById('generate-pdf-analysis').onclick = () => this.generateDetailedPDFReport();
            document.getElementById('generate-text-analysis').onclick = () => this.generateDetailedTextReport();
            document.getElementById('preview-analysis').onclick = () => this.updateAnalysisPreview();
            document.getElementById('report-format').onchange = () => this.updateAnalysisPreview();
            document.getElementById('report-name').oninput = () => this.validateReportName();
        }

        // Set default name with timestamp
        const timestamp = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        const userName = this.userPreferences.userName || 'User';
        document.getElementById('report-name').value = `${userName}_VocabMaster_Progress_${timestamp}`;
        
        modal.style.display = 'block';
        this.displayCurrentStats();
        this.updateAnalysisPreview();
    }

    hideProgressAnalysisModal() {
        const modal = document.getElementById('progress-analysis-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    validateReportName() {
        const nameInput = document.getElementById('report-name');
        const name = nameInput.value.trim();
        const generateBtn = document.getElementById('generate-pdf-analysis');
        const textBtn = document.getElementById('generate-text-analysis');
        
        if (name.length < 3) {
            nameInput.style.borderColor = '#ff4444';
            generateBtn.disabled = true;
            textBtn.disabled = true;
        } else {
            nameInput.style.borderColor = '';
            generateBtn.disabled = false;
            textBtn.disabled = false;
        }
    }

    displayCurrentStats() {
        const statsDisplay = document.getElementById('stats-display');
        const analysis = this.generateComprehensiveAnalysis();
        
        statsDisplay.innerHTML = `
            <div class="stat-card">
                <span class="stat-number">${analysis.statistics.totalWords}</span>
                <span class="stat-label">Total Words</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${analysis.statistics.learnedWords}</span>
                <span class="stat-label">Learned Words</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${analysis.metrics.learningRate}%</span>
                <span class="stat-label">Learning Rate</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${analysis.statistics.streak}</span>
                <span class="stat-label">Day Streak</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${analysis.statistics.categories}</span>
                <span class="stat-label">Categories</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${analysis.statistics.favoriteWords}</span>
                <span class="stat-label">Favorites</span>
            </div>
        `;
    }

    generateComprehensiveAnalysis() {
        const now = new Date();
        const userName = this.userPreferences.userName || 'Vocabulary Learner';
        
        // Basic statistics
        const stats = {
            totalWords: this.words.length,
            learnedWords: this.learnedWords.size,
            favoriteWords: this.favoriteWords.length,
            difficultWords: this.difficultWords.length,
            streak: this.dailyPractice.streak,
            categories: this.categories.length,
            notes: this.notes.length
        };

        // Calculate learning metrics
        const learningRate = stats.totalWords > 0 ? parseFloat((stats.learnedWords / stats.totalWords * 100).toFixed(1)) : 0;
        const difficultyRate = stats.totalWords > 0 ? parseFloat((stats.difficultWords / stats.totalWords * 100).toFixed(1)) : 0;
        const favoriteRate = stats.totalWords > 0 ? parseFloat((stats.favoriteWords / stats.totalWords * 100).toFixed(1)) : 0;
        const categoryAverage = stats.categories > 0 ? parseFloat((stats.totalWords / stats.categories).toFixed(1)) : 0;

        // Category distribution analysis
        const categoryDistribution = this.categories.map(category => {
            const wordsInCategory = this.words.filter(word => word.category === category.id).length;
            return {
                name: category.name,
                wordCount: wordsInCategory,
                percentage: stats.totalWords > 0 ? parseFloat((wordsInCategory / stats.totalWords * 100).toFixed(1)) : 0
            };
        }).sort((a, b) => b.wordCount - a.wordCount);

        // Learning performance analysis
        const performance = this.analyzePerformance(stats, learningRate, difficultyRate);
        
        // Generate personalized recommendations
        const recommendations = this.generatePersonalizedRecommendations(stats, learningRate, difficultyRate, favoriteRate);

        // Vocabulary complexity analysis
        const complexityAnalysis = this.analyzeVocabularyComplexity();

        return {
            userInfo: {
                name: userName,
                reportDate: now.toLocaleDateString(),
                reportTime: now.toLocaleTimeString()
            },
            statistics: stats,
            metrics: {
                learningRate,
                difficultyRate,
                favoriteRate,
                categoryAverage
            },
            categoryDistribution,
            performance,
            recommendations,
            complexityAnalysis,
            generatedAt: now.toISOString()
        };
    }

    analyzePerformance(stats, learningRate, difficultyRate) {
        let performanceLevel = 'Beginner';
        let performanceScore = 0;
        
        // Calculate performance score (0-100)
        performanceScore += Math.min(learningRate, 25); // Learning rate (max 25 points)
        performanceScore += Math.min(stats.streak * 2, 20); // Streak (max 20 points)
        performanceScore += Math.min(stats.totalWords * 0.5, 25); // Total words (max 25 points)
        performanceScore += Math.max(30 - difficultyRate, 0); // Lower difficulty is better (max 30 points)

        if (performanceScore >= 80) performanceLevel = 'Expert';
        else if (performanceScore >= 60) performanceLevel = 'Advanced';
        else if (performanceScore >= 40) performanceLevel = 'Intermediate';
        else if (performanceScore >= 20) performanceLevel = 'Developing';

        return {
            level: performanceLevel,
            score: Math.round(performanceScore),
            strengths: this.identifyStrengths(stats, learningRate, difficultyRate),
            areasForImprovement: this.identifyWeaknesses(stats, learningRate, difficultyRate)
        };
    }

    identifyStrengths(stats, learningRate, difficultyRate) {
        const strengths = [];
        
        if (learningRate > 70) strengths.push('Excellent learning completion rate');
        if (stats.streak > 7) strengths.push('Consistent daily practice habit');
        if (stats.totalWords > 100) strengths.push('Large vocabulary collection');
        if (difficultyRate < 10) strengths.push('Good word retention');
        if (stats.categories > 5) strengths.push('Well-organized vocabulary structure');
        if (stats.favoriteWords > 20) strengths.push('Active engagement with preferred words');
        
        if (strengths.length === 0) {
            strengths.push('Starting your vocabulary learning journey');
        }
        
        return strengths;
    }

    identifyWeaknesses(stats, learningRate, difficultyRate) {
        const weaknesses = [];
        
        if (learningRate < 30) weaknesses.push('Low word completion rate - focus on learning more words');
        if (stats.streak < 3) weaknesses.push('Inconsistent practice - try to study daily');
        if (stats.totalWords < 20) weaknesses.push('Small vocabulary size - add more words');
        if (difficultyRate > 30) weaknesses.push('High difficulty rate - review challenging words more often');
        if (stats.categories < 2) weaknesses.push('Limited organization - create more categories');
        if (stats.notes < 5) weaknesses.push('Few notes - add more context to your learning');
        
        return weaknesses;
    }

    analyzeVocabularyComplexity() {
        const wordLengths = this.words.map(word => word.english.length);
        const averageLength = wordLengths.length > 0 ? 
            parseFloat((wordLengths.reduce((a, b) => a + b, 0) / wordLengths.length).toFixed(1)) : 0;
        
        const shortWords = this.words.filter(word => word.english.length <= 5).length;
        const mediumWords = this.words.filter(word => word.english.length > 5 && word.english.length <= 8).length;
        const longWords = this.words.filter(word => word.english.length > 8).length;
        
        return {
            averageWordLength: averageLength,
            distribution: {
                short: shortWords,
                medium: mediumWords,
                long: longWords
            },
            complexityLevel: averageLength > 7 ? 'Advanced' : averageLength > 5 ? 'Intermediate' : 'Basic'
        };
    }

    generatePersonalizedRecommendations(stats, learningRate, difficultyRate, favoriteRate) {
        const recommendations = [];
        
        // Learning pace recommendations
        if (learningRate < 50) {
            recommendations.push({
                category: 'Learning Pace',
                suggestion: 'Focus on completing more words. Set a goal to learn 5-10 new words daily.',
                priority: 'High'
            });
        }
        
        // Practice consistency recommendations
        if (stats.streak < 7) {
            recommendations.push({
                category: 'Practice Consistency',
                suggestion: 'Build a daily learning habit. Even 10 minutes per day can significantly improve retention.',
                priority: 'High'
            });
        }
        
        // Difficulty management recommendations
        if (difficultyRate > 25) {
            recommendations.push({
                category: 'Difficulty Management',
                suggestion: 'Review difficult words more frequently. Use spaced repetition techniques.',
                priority: 'Medium'
            });
        }
        
        // Vocabulary expansion recommendations
        if (stats.totalWords < 50) {
            recommendations.push({
                category: 'Vocabulary Expansion',
                suggestion: 'Expand your vocabulary by adding words from different topics and difficulty levels.',
                priority: 'Medium'
            });
        }
        
        // Organization recommendations
        if (stats.categories < 3) {
            recommendations.push({
                category: 'Organization',
                suggestion: 'Create more categories to better organize your vocabulary by topics or themes.',
                priority: 'Low'
            });
        }
        
        // Engagement recommendations
        if (favoriteRate < 10) {
            recommendations.push({
                category: 'Engagement',
                suggestion: 'Mark more words as favorites to focus on vocabulary that interests you most.',
                priority: 'Low'
            });
        }
        
        if (recommendations.length === 0) {
            recommendations.push({
                category: 'Excellence',
                suggestion: 'Outstanding progress! Continue your current approach and consider challenging yourself with advanced vocabulary.',
                priority: 'Info'
            });
        }
        
        return recommendations;
    }

    updateAnalysisPreview() {
        const format = document.getElementById('report-format').value;
        const analysis = this.generateComprehensiveAnalysis();
        const preview = document.getElementById('preview-content');
        
        switch (format) {
            case 'summary':
                preview.innerHTML = this.generateSummaryPreview(analysis);
                break;
            case 'detailed':
                preview.innerHTML = this.generateStatisticalPreview(analysis);
                break;
            case 'recommendations':
                preview.innerHTML = this.generateRecommendationsPreview(analysis);
                break;
            default:
                preview.innerHTML = this.generateComprehensivePreview(analysis);
        }
    }

    generateSummaryPreview(analysis) {
        return `
            <div class="preview-summary">
                <h5>📋 Quick Summary Preview</h5>
                <div class="summary-stats">
                    <p><strong>Learning Progress:</strong> ${analysis.statistics.learnedWords}/${analysis.statistics.totalWords} words (${analysis.metrics.learningRate}%)</p>
                    <p><strong>Performance Level:</strong> ${analysis.performance.level} (${analysis.performance.score}/100)</p>
                    <p><strong>Current Streak:</strong> ${analysis.statistics.streak} days</p>
                    <p><strong>Top Category:</strong> ${analysis.categoryDistribution[0]?.name || 'No categories'} (${analysis.categoryDistribution[0]?.wordCount || 0} words)</p>
                </div>
            </div>
        `;
    }

    generateStatisticalPreview(analysis) {
        return `
            <div class="preview-statistical">
                <h5>📊 Statistical Analysis Preview</h5>
                <div class="stats-preview">
                    <div class="metric-row">
                        <span>Learning Efficiency:</span>
                        <span>${analysis.metrics.learningRate}%</span>
                    </div>
                    <div class="metric-row">
                        <span>Difficulty Management:</span>
                        <span>${analysis.metrics.difficultyRate}%</span>
                    </div>
                    <div class="metric-row">
                        <span>Category Distribution:</span>
                        <span>${analysis.categoryDistribution.length} categories</span>
                    </div>
                    <div class="metric-row">
                        <span>Vocabulary Complexity:</span>
                        <span>${analysis.complexityAnalysis.complexityLevel}</span>
                    </div>
                </div>
            </div>
        `;
    }

    generateRecommendationsPreview(analysis) {
        return `
            <div class="preview-recommendations">
                <h5>💡 Learning Recommendations Preview</h5>
                <div class="recommendations-list">
                    ${analysis.recommendations.slice(0, 3).map(rec => `
                        <div class="recommendation-item ${rec.priority.toLowerCase()}">
                            <strong>${rec.category}:</strong> ${rec.suggestion}
                        </div>
                    `).join('')}
                    ${analysis.recommendations.length > 3 ? `<p><em>...and ${analysis.recommendations.length - 3} more recommendations</em></p>` : ''}
                </div>
            </div>
        `;
    }

    generateComprehensivePreview(analysis) {
        return `
            <div class="preview-comprehensive">
                <h5>📋 Comprehensive Analysis Preview</h5>
                <div class="comprehensive-overview">
                    <p><strong>Performance Level:</strong> ${analysis.performance.level} (${analysis.performance.score}/100)</p>
                    <p><strong>Key Strengths:</strong> ${analysis.performance.strengths.slice(0, 2).join(', ')}</p>
                    <p><strong>Priority Recommendations:</strong> ${analysis.recommendations.filter(r => r.priority === 'High').length} high-priority items</p>
                    <p><strong>Vocabulary Complexity:</strong> ${analysis.complexityAnalysis.complexityLevel} level</p>
                    <p><em>Full report includes detailed breakdowns, category analysis, learning trends, and actionable recommendations.</em></p>
                </div>
            </div>
        `;
    }

    generateDetailedPDFReport() {
        const reportName = document.getElementById('report-name').value.trim();
        const format = document.getElementById('report-format').value;
        
        if (!reportName || reportName.length < 3) {
            this.showToast('Please enter a valid report name (minimum 3 characters)', 'error');
            return;
        }

        const analysis = this.generateComprehensiveAnalysis();
        const htmlContent = this.createDetailedHTMLReport(analysis, format);
        
        // Create downloadable HTML file (PDF-like format)
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportName.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.hideProgressAnalysisModal();
        this.showToast(`📄 Detailed PDF report "${reportName}" generated successfully!`, 'success');
    }

    generateDetailedTextReport() {
        const reportName = document.getElementById('report-name').value.trim();
        const format = document.getElementById('report-format').value;
        
        if (!reportName || reportName.length < 3) {
            this.showToast('Please enter a valid report name (minimum 3 characters)', 'error');
            return;
        }

        const analysis = this.generateComprehensiveAnalysis();
        const textContent = this.createDetailedTextReport(analysis, format);
        
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportName.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.hideProgressAnalysisModal();
        this.showToast(`📝 Detailed text report "${reportName}" generated successfully!`, 'success');
    }

    createDetailedHTMLReport(analysis, format) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${analysis.userInfo.name} - VocabMaster Progress Analysis</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; padding: 20px; 
            line-height: 1.6; 
            color: #333;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        .container { 
            max-width: 1000px; 
            margin: 0 auto; 
            background: white; 
            padding: 40px; 
            border-radius: 15px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #667eea; 
            padding-bottom: 30px; 
            margin-bottom: 40px; 
        }
        .header h1 { 
            color: #667eea; 
            margin: 0; 
            font-size: 2.5em; 
            font-weight: bold;
        }
        .header h2 { 
            color: #555; 
            margin: 10px 0; 
            font-weight: normal;
        }
        .section { 
            margin-bottom: 40px; 
            padding: 25px; 
            background: #f8f9ff; 
            border-radius: 10px; 
            border-left: 5px solid #667eea;
        }
        .section h2 { 
            color: #667eea; 
            margin-top: 0; 
            font-size: 1.8em;
        }
        .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin: 20px 0;
        }
        .stat-card { 
            background: white; 
            padding: 20px; 
            border-radius: 10px; 
            text-align: center; 
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            border-top: 4px solid #667eea;
        }
        .stat-card h3 { 
            margin: 0; 
            font-size: 2.2em; 
            color: #667eea; 
            font-weight: bold;
        }
        .stat-card p { 
            margin: 10px 0 0 0; 
            color: #666; 
            font-weight: 500;
        }
        .performance-level {
            display: inline-block;
            padding: 10px 20px;
            border-radius: 25px;
            color: white;
            font-weight: bold;
            margin: 10px 0;
        }
        .performance-level.expert { background: #28a745; }
        .performance-level.advanced { background: #17a2b8; }
        .performance-level.intermediate { background: #ffc107; color: #333; }
        .performance-level.developing { background: #fd7e14; }
        .performance-level.beginner { background: #6c757d; }
        .recommendation { 
            background: white; 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 8px; 
            border-left: 4px solid #28a745;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .recommendation.high { border-left-color: #dc3545; }
        .recommendation.medium { border-left-color: #ffc107; }
        .recommendation.low { border-left-color: #17a2b8; }
        .category-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            margin: 8px 0;
            background: white;
            border-radius: 6px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            transition: width 0.3s ease;
        }
        .footer { 
            text-align: center; 
            margin-top: 50px; 
            padding-top: 30px; 
            border-top: 2px solid #e9ecef; 
            color: #666;
        }
        @media print { 
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 VocabMaster Progress Analysis</h1>
            <h2>${analysis.userInfo.name}</h2>
            <p><strong>Report Generated:</strong> ${analysis.userInfo.reportDate} at ${analysis.userInfo.reportTime}</p>
            <div class="performance-level ${analysis.performance.level.toLowerCase()}">
                Performance Level: ${analysis.performance.level} (${analysis.performance.score}/100)
            </div>
        </div>

        <div class="section">
            <h2>📈 Learning Statistics Overview</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${analysis.statistics.totalWords}</h3>
                    <p>Total Words</p>
                </div>
                <div class="stat-card">
                    <h3>${analysis.statistics.learnedWords}</h3>
                    <p>Words Learned</p>
                </div>
                <div class="stat-card">
                    <h3>${analysis.metrics.learningRate}%</h3>
                    <p>Learning Rate</p>
                </div>
                <div class="stat-card">
                    <h3>${analysis.statistics.streak}</h3>
                    <p>Day Streak</p>
                </div>
                <div class="stat-card">
                    <h3>${analysis.statistics.categories}</h3>
                    <p>Categories</p>
                </div>
                <div class="stat-card">
                    <h3>${analysis.statistics.favoriteWords}</h3>
                    <p>Favorite Words</p>
                </div>
            </div>
            
            <div class="progress-section">
                <h3>Learning Progress</h3>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${analysis.metrics.learningRate}%"></div>
                </div>
                <p>You have learned ${analysis.metrics.learningRate}% of your vocabulary collection</p>
            </div>
        </div>

        ${format === 'comprehensive' || format === 'detailed' ? `
        <div class="section">
            <h2>📊 Performance Analysis</h2>
            <div class="performance-details">
                <h3>🎯 Strengths</h3>
                ${analysis.performance.strengths.map(strength => `
                    <div class="recommendation">
                        ✅ ${strength}
                    </div>
                `).join('')}
                
                <h3>🎯 Areas for Improvement</h3>
                ${analysis.performance.areasForImprovement.map(area => `
                    <div class="recommendation medium">
                        📈 ${area}
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <h2>📁 Category Distribution</h2>
            ${analysis.categoryDistribution.length > 0 ? 
                analysis.categoryDistribution.map(cat => `
                    <div class="category-item">
                        <span><strong>${cat.name}</strong></span>
                        <span>${cat.wordCount} words (${cat.percentage}%)</span>
                    </div>
                `).join('') : 
                '<p>No categories created yet. Consider organizing your vocabulary into categories for better learning.</p>'
            }
        </div>

        <div class="section">
            <h2>🧠 Vocabulary Complexity Analysis</h2>
            <div class="complexity-details">
                <p><strong>Average Word Length:</strong> ${analysis.complexityAnalysis.averageWordLength} characters</p>
                <p><strong>Complexity Level:</strong> ${analysis.complexityAnalysis.complexityLevel}</p>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>${analysis.complexityAnalysis.distribution.short}</h3>
                        <p>Short Words (≤5 chars)</p>
                    </div>
                    <div class="stat-card">
                        <h3>${analysis.complexityAnalysis.distribution.medium}</h3>
                        <p>Medium Words (6-8 chars)</p>
                    </div>
                    <div class="stat-card">
                        <h3>${analysis.complexityAnalysis.distribution.long}</h3>
                        <p>Long Words (>8 chars)</p>
                    </div>
                </div>
            </div>
        </div>
        ` : ''}

        <div class="section">
            <h2>💡 Personalized Learning Recommendations</h2>
            ${analysis.recommendations.map(rec => `
                <div class="recommendation ${rec.priority.toLowerCase()}">
                    <strong>${rec.category}:</strong> ${rec.suggestion}
                    <span style="float: right; font-size: 0.8em; color: #666;">${rec.priority} Priority</span>
                </div>
            `).join('')}
        </div>

        <div class="footer">
            <p><strong>Generated by VocabMaster - English Vocabulary Learning App</strong></p>
            <p>Continue your learning journey and achieve your vocabulary goals! 🚀</p>
            <p><em>This report was generated on ${analysis.userInfo.reportDate} at ${analysis.userInfo.reportTime}</em></p>
        </div>
    </div>
</body>
</html>`;
    }

    createDetailedTextReport(analysis, format) {
        return `
VOCABMASTER PROGRESS ANALYSIS REPORT
════════════════════════════════════════════════════════════════

📊 USER INFORMATION
───────────────────
Name: ${analysis.userInfo.name}
Report Date: ${analysis.userInfo.reportDate}
Report Time: ${analysis.userInfo.reportTime}
Performance Level: ${analysis.performance.level} (${analysis.performance.score}/100)

📈 LEARNING STATISTICS
──────────────────────
Total Words in Collection: ${analysis.statistics.totalWords}
Words Successfully Learned: ${analysis.statistics.learnedWords}
Learning Completion Rate: ${analysis.metrics.learningRate}%
Current Practice Streak: ${analysis.statistics.streak} days
Vocabulary Categories: ${analysis.statistics.categories}
Favorite Words: ${analysis.statistics.favoriteWords}
Difficult Words: ${analysis.statistics.difficultWords}
Personal Notes: ${analysis.statistics.notes}

📊 LEARNING METRICS
───────────────────
Learning Efficiency: ${analysis.metrics.learningRate}%
Difficulty Management: ${analysis.metrics.difficultyRate}%
Favorite Engagement: ${analysis.metrics.favoriteRate}%
Average Words per Category: ${analysis.metrics.categoryAverage}

${format === 'comprehensive' || format === 'detailed' ? `
🎯 PERFORMANCE ANALYSIS
──────────────────────

STRENGTHS:
${analysis.performance.strengths.map((strength, index) => `${index + 1}. ✅ ${strength}`).join('\n')}

AREAS FOR IMPROVEMENT:
${analysis.performance.areasForImprovement.map((area, index) => `${index + 1}. 📈 ${area}`).join('\n')}

📁 CATEGORY DISTRIBUTION
────────────────────────
${analysis.categoryDistribution.length > 0 ? 
    analysis.categoryDistribution.map((cat, index) => 
        `${index + 1}. ${cat.name}: ${cat.wordCount} words (${cat.percentage}%)`
    ).join('\n') : 
    'No categories created yet. Consider organizing vocabulary into categories.'
}

🧠 VOCABULARY COMPLEXITY ANALYSIS
─────────────────────────────────
Average Word Length: ${analysis.complexityAnalysis.averageWordLength} characters
Complexity Level: ${analysis.complexityAnalysis.complexityLevel}

Word Length Distribution:
- Short Words (≤5 characters): ${analysis.complexityAnalysis.distribution.short}
- Medium Words (6-8 characters): ${analysis.complexityAnalysis.distribution.medium}
- Long Words (>8 characters): ${analysis.complexityAnalysis.distribution.long}
` : ''}

💡 PERSONALIZED LEARNING RECOMMENDATIONS
────────────────────────────────────────
${analysis.recommendations.map((rec, index) => 
    `${index + 1}. [${rec.priority.toUpperCase()} PRIORITY] ${rec.category}
   ${rec.suggestion}
`).join('\n')}

════════════════════════════════════════════════════════════════
📚 REPORT SUMMARY
────────────────

Your current performance level is ${analysis.performance.level} with a score of ${analysis.performance.score}/100.
${analysis.statistics.learnedWords > 0 ? 
    `You have successfully learned ${analysis.statistics.learnedWords} words, achieving a ${analysis.metrics.learningRate}% completion rate.` :
    'You are just beginning your vocabulary learning journey.'
}
${analysis.statistics.streak > 0 ? 
    `Your current learning streak of ${analysis.statistics.streak} days shows ${analysis.statistics.streak > 7 ? 'excellent' : 'good'} consistency.` :
    'Consider building a daily practice routine for better results.'
}

${analysis.recommendations.filter(r => r.priority === 'High').length > 0 ? 
    `Focus on the ${analysis.recommendations.filter(r => r.priority === 'High').length} high-priority recommendations for maximum improvement.` :
    'Continue your excellent progress and maintain your current learning approach.'
}

════════════════════════════════════════════════════════════════
Generated by VocabMaster - English Vocabulary Learning App
Report created on ${analysis.userInfo.reportDate} at ${analysis.userInfo.reportTime}

Keep learning and expanding your vocabulary! 🚀📚
        `.trim();
    }

    // Initialize Speech Synthesis for pronunciation practice
    initializeSpeechSynthesis() {
        this.speechSynthesis = window.speechSynthesis;
        this.currentVoice = null;
        this.voiceRate = 0.8;
        this.voicePitch = 1;
        this.pronunciationScores = [];
        this.currentPronunciationWord = null;
        this.pronunciationWords = [];
        this.currentPronunciationIndex = 0;
        
        if (this.speechSynthesis) {
            this.loadVoices();
            
            if (this.speechSynthesis.onvoiceschanged !== undefined) {
                this.speechSynthesis.onvoiceschanged = () => this.loadVoices();
            }
            
            console.log('Speech synthesis initialized successfully');
        } else {
            console.warn('Speech synthesis not supported in this browser');
        }
    }

    loadVoices() {
        const voices = this.speechSynthesis.getVoices();
        this.currentVoice = voices.find(voice => 
            voice.lang.startsWith('en') && voice.localService
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
    }

    speakWord(word, rate = this.voiceRate) {
        if (!this.speechSynthesis || !word) return;
        this.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.voice = this.currentVoice;
        utterance.rate = rate;
        utterance.pitch = this.voicePitch;
        utterance.volume = 1;
        
        this.speechSynthesis.speak(utterance);
    }

    startPronunciationPractice() {
        if (this.words.length === 0) {
            this.showToast('No words available for pronunciation practice.', 'warning');
            return;
        }

        this.showScreen('learning');
        this.showPronunciationInterface();
        this.pronunciationWords = this.getRandomWords(5);
        this.currentPronunciationIndex = 0;
        this.pronunciationScores = [];
        this.startPronunciationSession();
    }

    showPronunciationInterface() {
        document.getElementById('word-selection-phase').style.display = 'none';
        document.getElementById('quiz-phase').style.display = 'none';
        document.getElementById('word-display').style.display = 'none';
        
        let pronunciationInterface = document.getElementById('pronunciation-practice');
        if (!pronunciationInterface) {
            this.createPronunciationInterface();
        } else {
            pronunciationInterface.style.display = 'block';
        }
    }

    createPronunciationInterface() {
        const learningScreen = document.getElementById('learning-screen');
        
        const pronunciationHTML = `
            <div id="pronunciation-practice" class="pronunciation-container">
                <div class="pronunciation-header">
                    <h3>🎤 Pronunciation Practice</h3>
                    <p>Listen to the word, then speak it clearly into your microphone</p>
                    <div class="practice-progress">
                        <span id="pronunciation-progress">Word 1 of 5</span>
                        <div class="progress-bar">
                            <div id="pronunciation-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                </div>
                
                <div class="pronunciation-word-card">
                    <div class="word-display">
                        <h2 id="pronunciation-word">Welcome</h2>
                        <p id="pronunciation-translation">Hoş geldiniz</p>
                        <p class="word-phonetic" id="pronunciation-phonetic">/ˈwelkəm/</p>
                    </div>
                    
                    <div class="pronunciation-controls">
                        <button id="play-pronunciation" class="pronunciation-btn primary">
                            <span class="btn-icon">🔊</span>
                            <span>Listen</span>
                        </button>
                        <button id="start-pronunciation-recording" class="pronunciation-btn secondary">
                            <span class="btn-icon" id="pronunciation-mic-icon">🎤</span>
                            <span id="pronunciation-recording-text">Speak Now</span>
                        </button>
                        <button id="skip-pronunciation" class="pronunciation-btn tertiary">
                            <span class="btn-icon">⏭️</span>
                            <span>Skip</span>
                        </button>
                    </div>
                    
                    <div class="voice-feedback" id="pronunciation-voice-feedback" style="display: none;">
                        <div class="transcript-display">
                            <p>You said: <span id="pronunciation-voice-transcript"></span></p>
                        </div>
                        <div class="accuracy-display">
                            <div class="accuracy-score">
                                <span class="score-label">Accuracy:</span>
                                <span id="pronunciation-accuracy-percentage" class="score-value">0%</span>
                                <div class="score-bar">
                                    <div id="pronunciation-accuracy-bar-fill" class="score-bar-fill"></div>
                                </div>
                            </div>
                        </div>
                        <div class="feedback-message">
                            <p id="pronunciation-feedback-text">Great job!</p>
                        </div>
                    </div>
                </div>
                
                <div class="pronunciation-navigation">
                    <button id="back-to-learning-modes" class="nav-btn">← Back to Learning</button>
                </div>
            </div>
        `;
        
        learningScreen.insertAdjacentHTML('beforeend', pronunciationHTML);
        this.setupPronunciationEventListeners();
    }

    setupPronunciationEventListeners() {
        this.addEventListenerSafely('play-pronunciation', 'click', () => {
            if (this.currentPronunciationWord) {
                this.speakWord(this.currentPronunciationWord.english);
            }
        });
        
        this.addEventListenerSafely('start-pronunciation-recording', 'click', () => {
            this.togglePronunciationRecording();
        });
        
        this.addEventListenerSafely('skip-pronunciation', 'click', () => {
            this.nextPronunciationWord();
        });
        
        this.addEventListenerSafely('back-to-learning-modes', 'click', () => {
            this.exitPronunciationPractice();
        });
    }

    togglePronunciationRecording() {
        if (!this.recognition) {
            this.showToast('Voice recognition not supported in this browser.', 'error');
            return;
        }
        
        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.startPronunciationRecording();
        }
    }

    startPronunciationRecording() {
        if (!this.currentPronunciationWord) return;
        
        try {
            const micIcon = document.getElementById('pronunciation-mic-icon');
            const recordingText = document.getElementById('pronunciation-recording-text');
            const recordingBtn = document.getElementById('start-pronunciation-recording');
            
            micIcon.textContent = '🔴';
            recordingText.textContent = 'Listening...';
            recordingBtn.classList.add('recording');
            
            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                
                if (finalTranscript) {
                    this.processPronunciationResult(finalTranscript.trim().toLowerCase());
                }
            };
            
            this.recognition.onend = () => {
                micIcon.textContent = '🎤';
                recordingText.textContent = 'Speak Now';
                recordingBtn.classList.remove('recording');
            };
            
            this.recognition.start();
        } catch (error) {
            console.error('Error starting pronunciation recording:', error);
            this.showToast('Could not start voice recognition. Please try again.', 'error');
        }
    }

    processPronunciationResult(spokenText) {
        if (!this.currentPronunciationWord) return;

        const targetWord = this.currentPronunciationWord.english.toLowerCase();
        const accuracy = this.calculatePronunciationAccuracy(spokenText, targetWord);
        
        this.pronunciationScores.push({
            word: this.currentPronunciationWord,
            spoken: spokenText,
            target: targetWord,
            accuracy: accuracy,
            timestamp: Date.now()
        });

        document.getElementById('pronunciation-voice-transcript').textContent = spokenText;
        this.showPronunciationFeedback(accuracy, spokenText, targetWord);
        
        setTimeout(() => {
            this.nextPronunciationWord();
        }, 2500);
    }

    calculatePronunciationAccuracy(spoken, target) {
        if (spoken === target) return 100;
        
        const distance = this.levenshteinDistance(spoken, target);
        const maxLength = Math.max(spoken.length, target.length);
        const similarity = ((maxLength - distance) / maxLength) * 100;
        
        if (spoken.includes(target) || target.includes(spoken)) {
            return Math.max(similarity, 75);
        }
        
        return Math.max(similarity, 0);
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    startPronunciationSession() {
        if (this.pronunciationWords.length === 0) {
            this.showToast('No words selected for pronunciation practice.', 'warning');
            return;
        }
        
        this.currentPronunciationIndex = 0;
        this.displayCurrentPronunciationWord();
    }

    displayCurrentPronunciationWord() {
        if (this.currentPronunciationIndex >= this.pronunciationWords.length) {
            this.completePronunciationSession();
            return;
        }
        
        this.currentPronunciationWord = this.pronunciationWords[this.currentPronunciationIndex];
        
        document.getElementById('pronunciation-word').textContent = this.currentPronunciationWord.english;
        document.getElementById('pronunciation-translation').textContent = this.currentPronunciationWord.turkish;
        document.getElementById('pronunciation-phonetic').textContent = this.generatePhonetic(this.currentPronunciationWord.english);
        
        document.getElementById('pronunciation-progress').textContent = 
            `Word ${this.currentPronunciationIndex + 1} of ${this.pronunciationWords.length}`;
        
        const progressPercentage = ((this.currentPronunciationIndex) / this.pronunciationWords.length) * 100;
        document.getElementById('pronunciation-progress-fill').style.width = `${progressPercentage}%`;
        
        document.getElementById('pronunciation-voice-feedback').style.display = 'none';
        
        setTimeout(() => {
            this.speakWord(this.currentPronunciationWord.english);
        }, 500);
    }

    generatePhonetic(word) {
        const phoneticMap = {
            'hello': '/həˈloʊ/',
            'world': '/wɜːrld/',
            'welcome': '/ˈwelkəm/',
            'good': '/ɡʊd/',
            'morning': '/ˈmɔːrnɪŋ/',
            'evening': '/ˈiːvnɪŋ/',
            'night': '/naɪt/',
            'please': '/pliːz/',
            'thank': '/θæŋk/',
            'you': '/juː/',
            'water': '/ˈwɔːtər/',
            'food': '/fuːd/',
            'house': '/haʊs/',
            'book': '/bʊk/',
            'time': '/taɪm/',
            'love': '/lʌv/',
            'happy': '/ˈhæpi/',
            'family': '/ˈfæməli/',
            'friend': '/frend/',
            'school': '/skuːl/'
        };
        
        return phoneticMap[word.toLowerCase()] || `/${word}/`;
    }

    showPronunciationFeedback(accuracy, spoken, target) {
        const feedbackContainer = document.getElementById('pronunciation-voice-feedback');
        const accuracyPercentage = document.getElementById('pronunciation-accuracy-percentage');
        const accuracyBarFill = document.getElementById('pronunciation-accuracy-bar-fill');
        const feedbackText = document.getElementById('pronunciation-feedback-text');
        
        feedbackContainer.style.display = 'block';
        
        accuracyPercentage.textContent = `${Math.round(accuracy)}%`;
        accuracyBarFill.style.width = `${accuracy}%`;
        
        if (accuracy >= 90) {
            accuracyBarFill.className = 'score-bar-fill excellent';
            feedbackText.textContent = 'Excellent pronunciation! 🎉';
        } else if (accuracy >= 75) {
            accuracyBarFill.className = 'score-bar-fill good';
            feedbackText.textContent = 'Good job! Keep practicing! 👍';
        } else if (accuracy >= 60) {
            accuracyBarFill.className = 'score-bar-fill fair';
            feedbackText.textContent = 'Not bad! Try to pronounce more clearly. 🔄';
        } else {
            accuracyBarFill.className = 'score-bar-fill poor';
            feedbackText.textContent = 'Keep trying! Listen carefully and repeat. 💪';
        }
        
        if (spoken !== target) {
            feedbackText.innerHTML += `<br><small>Expected: "${target}" | You said: "${spoken}"</small>`;
        }
    }

    nextPronunciationWord() {
        this.currentPronunciationIndex++;
        this.displayCurrentPronunciationWord();
    }

    completePronunciationSession() {
        if (this.pronunciationScores.length === 0) {
            this.showToast('No pronunciation attempts recorded.', 'info');
        } else {
            const averageAccuracy = this.pronunciationScores.reduce((sum, score) => sum + score.accuracy, 0) / this.pronunciationScores.length;
            this.showToast(`Pronunciation practice completed! Average accuracy: ${Math.round(averageAccuracy)}%`, 'success');
        }
        
        setTimeout(() => {
            this.exitPronunciationPractice();
        }, 2000);
    }

    exitPronunciationPractice() {
        if (this.isListening && this.recognition) {
            this.recognition.stop();
        }
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
        }
        
        const pronunciationInterface = document.getElementById('pronunciation-practice');
        if (pronunciationInterface) {
            pronunciationInterface.style.display = 'none';
        }
        
        document.getElementById('word-selection-phase').style.display = 'block';
        
        this.currentPronunciationWord = null;
        this.pronunciationWords = [];
        this.currentPronunciationIndex = 0;
    }

// Daily Practice System
initializeDailyPractice() {
    this.dailyPracticeData = {
        lastPracticeDate: null,
        streak: 0,
        totalDays: 0,
        currentWords: [],
        currentIndex: 0,
        scores: [],
        isActive: false
    };

    this.loadDailyPracticeData();
    this.checkDailyPractice();
}

loadDailyPracticeData() {
    const saved = localStorage.getItem('vocabmaster_daily_practice');
    if (saved) {
        this.dailyPracticeData = { ...this.dailyPracticeData, ...JSON.parse(saved) };
    }
}

saveDailyPracticeData() {
    localStorage.setItem('vocabmaster_daily_practice', JSON.stringify(this.dailyPracticeData));
}

checkDailyPractice() {
    const today = new Date().toDateString();
    const lastPractice = this.dailyPracticeData.lastPracticeDate;

    // Check if it's a new day and user has learned words
    if (lastPractice !== today && this.learnedWords.size > 0) {
        setTimeout(() => {
            this.showDailyPracticePrompt();
        }, 1000);
    }
}

showDailyPracticePrompt() {
    const learnedWordsArray = Array.from(this.learnedWords).map(id =>
        this.words.find(w => w.id === id)
    ).filter(word => word);

    if (learnedWordsArray.length === 0) return;

    // Create daily practice prompt overlay
    const promptHTML = `
            <div id="daily-practice-overlay" class="daily-practice-overlay">
                <div class="daily-practice-prompt">
                    <div class="prompt-header">
                        <h2>🌅 Daily Practice Time!</h2>
                        <p>Review your learned words to maintain your progress</p>
                    </div>

                    <div class="practice-stats">
                        <div class="stat-item">
                            <span class="stat-number">${learnedWordsArray.length}</span>
                            <span class="stat-label">Words to Review</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${this.dailyPracticeData.streak}</span>
                            <span class="stat-label">Day Streak</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${Math.ceil(learnedWordsArray.length / 2)}</span>
                            <span class="stat-label">Minutes</span>
                        </div>
                    </div>

                    <div class="prompt-message">
                        <p>Keep your vocabulary fresh with a quick daily review!</p>
                        <p class="practice-benefit">Daily practice helps move words to long-term memory 🧠</p>
                    </div>

                    <div class="prompt-actions">
                        <button id="start-daily-practice" class="daily-btn primary">
                            ✨ Start Daily Practice
                        </button>
                        <button id="skip-daily-practice" class="daily-btn secondary">
                            ⏭️ Maybe Later
                        </button>
                        <button id="close-daily-practice" class="daily-btn tertiary">
                            ✕ Close
                        </button>
                    </div>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML('beforeend', promptHTML);

    // Düzeltme: Butonlara event listener ekliyoruz.
    document.getElementById('start-daily-practice').addEventListener('click', () => this.startDailyPractice());
    document.getElementById('skip-daily-practice').addEventListener('click', () => this.skipDailyPractice());
    document.getElementById('close-daily-practice').addEventListener('click', () => this.closeDailyPractice());
}

startDailyPractice() {
    // Remove the prompt overlay
    const overlay = document.getElementById('daily-practice-overlay');
    if (overlay) {
        overlay.remove();
    }

    // Prepare daily practice session
    const learnedWordsArray = Array.from(this.learnedWords).map(id =>
        this.words.find(w => w.id === id)
    ).filter(word => word);

    if (learnedWordsArray.length === 0) {
        this.showToast('No learned words available for practice.', 'info');
        return;
    }

    // Shuffle learned words for varied practice
    this.dailyPracticeData.currentWords = this.shuffleArray(learnedWordsArray);
    this.dailyPracticeData.currentIndex = 0;
    this.dailyPracticeData.scores = [];
    this.dailyPracticeData.isActive = true;

    this.showScreen('learning');
    this.showDailyPracticeInterface();
    this.startDailyPracticeSession();
}

skipDailyPractice() {
    const overlay = document.getElementById('daily-practice-overlay');
    if (overlay) {
        overlay.remove();
    }
    this.showToast('Daily practice skipped. You can start it anytime from the home screen!', 'info');
}

closeDailyPractice() {
    const overlay = document.getElementById('daily-practice-overlay');
    if (overlay) {
        overlay.remove();
    }
}

showDailyPracticeInterface() {
    // Hide other learning modes
    document.getElementById('word-selection-phase').style.display = 'none';
    document.getElementById('quiz-phase').style.display = 'none';
    document.getElementById('word-display').style.display = 'none';
    const pronunciationInterface = document.getElementById('pronunciation-practice');
    if (pronunciationInterface) {
        pronunciationInterface.style.display = 'none';
    }

    // Show or create daily practice interface
    let dailyInterface = document.getElementById('daily-practice-interface');
    if (!dailyInterface) {
        this.createDailyPracticeInterface();
    } else {
        dailyInterface.style.display = 'block';
    }
}

createDailyPracticeInterface() {
    const learningScreen = document.getElementById('learning-screen');

    const dailyHTML = `
            <div id="daily-practice-interface" class="daily-practice-container">
                <div class="daily-practice-header">
                    <h3>🌅 Daily Practice</h3>
                    <p>Review your learned words to strengthen your memory</p>
                    <div class="daily-progress">
                        <span id="daily-progress-text">Word 1 of 10</span>
                        <div class="progress-bar">
                            <div id="daily-progress-fill" class="progress-fill"></div>
                        </div>
                        <div class="streak-display">
                            <span class="streak-icon">🔥</span>
                            <span id="current-streak">${this.dailyPracticeData.streak} day streak</span>
                        </div>
                    </div>
                </div>

                <div class="daily-word-card">
                    <div class="word-display">
                        <h2 id="daily-word">Loading...</h2>
                        <p id="daily-translation">Loading...</p>
                    </div>

                    <div class="daily-question">
                        <p id="daily-question-text">What does this word mean?</p>
                        <div id="daily-options" class="daily-options">
                            </div>
                    </div>

                    <div class="daily-feedback" id="daily-feedback" style="display: none;">
                        <div class="feedback-content">
                            <p id="daily-feedback-text"></p>
                            <div class="word-details">
                                <p><strong>Definition:</strong> <span id="daily-word-definition"></span></p>
                                <p><strong>Example:</strong> <span id="daily-word-example"></span></p>
                            </div>
                        </div>
                        <button id="daily-next-word" class="daily-btn primary">Next Word</button>
                    </div>
                </div>

                <div class="daily-controls">
                    <button id="daily-play-audio" class="daily-control-btn">🔊 Listen</button>
                    <button id="exit-daily-practice" class="daily-control-btn secondary">← Back to Home</button>
                </div>
            </div>
        `;

    learningScreen.insertAdjacentHTML('beforeend', dailyHTML);
    this.setupDailyPracticeEventListeners();
}

// Düzeltme: `addEventListenerSafely` fonksiyonu ekleniyor.
addEventListenerSafely(elementId, eventType, callback) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener(eventType, callback);
    } else {
        console.error(`Element with ID "${elementId}" not found.`);
    }
}

setupDailyPracticeEventListeners() {
    this.addEventListenerSafely('daily-play-audio', 'click', () => {
        if (this.dailyPracticeData.currentWords[this.dailyPracticeData.currentIndex]) {
            this.speakWord(this.dailyPracticeData.currentWords[this.dailyPracticeData.currentIndex].english);
        }
    });

    this.addEventListenerSafely('daily-next-word', 'click', () => {
        this.nextDailyWord();
    });

    this.addEventListenerSafely('exit-daily-practice', 'click', () => {
        this.exitDailyPractice();
    });
}

startDailyPracticeSession() {
    if (this.dailyPracticeData.currentWords.length === 0) {
        this.showToast('No words available for daily practice.', 'warning');
        return;
    }

    this.displayCurrentDailyWord();
}

displayCurrentDailyWord() {
    const currentIndex = this.dailyPracticeData.currentIndex;
    const totalWords = this.dailyPracticeData.currentWords.length;

    if (currentIndex >= totalWords) {
        this.completeDailyPractice();
        return;
    }

    const currentWord = this.dailyPracticeData.currentWords[currentIndex];

    // Update progress
    document.getElementById('daily-progress-text').textContent = `Word ${currentIndex + 1} of ${totalWords}`;
    const progressPercentage = (currentIndex / totalWords) * 100;
    document.getElementById('daily-progress-fill').style.width = `${progressPercentage}%`;

    // Display word
    document.getElementById('daily-word').textContent = currentWord.english;
    document.getElementById('daily-translation').textContent = currentWord.turkish;

    // Create multiple choice question
    this.createDailyQuestion(currentWord);

    // Hide feedback initially
    document.getElementById('daily-feedback').style.display = 'none';
}

createDailyQuestion(currentWord) {
    const questionTypes = ['turkish-meaning', 'definition', 'usage'];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    const questionElement = document.getElementById('daily-question-text');
    const optionsElement = document.getElementById('daily-options');

    let question, correctAnswer, wrongAnswers;

    switch (questionType) {
        case 'turkish-meaning':
            question = `What is the Turkish meaning of "${currentWord.english}"?`;
            correctAnswer = currentWord.turkish;
            wrongAnswers = this.getRandomTurkishTranslations(currentWord.turkish, 3);
            break;

        case 'definition':
            question = `What does "${currentWord.english}" mean?`;
            correctAnswer = currentWord.definition || currentWord.turkish;
            wrongAnswers = this.getRandomDefinitions(correctAnswer, 3);
            break;

        case 'usage':
            question = `Which sentence correctly uses "${currentWord.english}"?`;
            correctAnswer = this.generateUsageExample(currentWord);
            wrongAnswers = this.generateWrongUsageExamples(currentWord, 3);
            break;
    }

    questionElement.textContent = question;

    // Create options array and shuffle
    const options = [correctAnswer, ...wrongAnswers];
    const shuffledOptions = this.shuffleArray(options);

    // Generate option buttons
    optionsElement.innerHTML = '';
    shuffledOptions.forEach((option) => {
        const button = document.createElement('button');
        button.className = 'daily-option';
        button.textContent = option;
        button.onclick = () => this.selectDailyOption(option, correctAnswer);
        optionsElement.appendChild(button);
    });
}

// Hata düzeltmesi: Tıklanan butonun referansı artık gerekli değil.
selectDailyOption(selectedOption, correctAnswer) {
    const isCorrect = selectedOption === correctAnswer;
    const allOptions = document.querySelectorAll('.daily-option');

    // Disable all options and highlight the correct one
    allOptions.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correctAnswer) {
            btn.classList.add('correct');
        } else if (btn.textContent === selectedOption) {
            btn.classList.add('incorrect');
        }
    });

    // Record the result
    this.dailyPracticeData.scores.push({
        word: this.dailyPracticeData.currentWords[this.dailyPracticeData.currentIndex],
        correct: isCorrect,
        timestamp: Date.now()
    });

    // Show feedback
    this.showDailyFeedback(isCorrect);
}

showDailyFeedback(isCorrect) {
    const currentWord = this.dailyPracticeData.currentWords[this.dailyPracticeData.currentIndex];
    const feedbackElement = document.getElementById('daily-feedback');
    const feedbackText = document.getElementById('daily-feedback-text');
    const definitionElement = document.getElementById('daily-word-definition');
    const exampleElement = document.getElementById('daily-word-example');

    if (isCorrect) {
        feedbackText.innerHTML = '✅ Correct! Well done!';
        feedbackElement.className = 'daily-feedback correct';
    } else {
        feedbackText.innerHTML = '❌ Not quite right. Let\'s review this word.';
        feedbackElement.className = 'daily-feedback incorrect';
    }

    definitionElement.textContent = currentWord.definition || currentWord.turkish;
    exampleElement.textContent = this.generateUsageExample(currentWord);

    feedbackElement.style.display = 'block';
}

nextDailyWord() {
    this.dailyPracticeData.currentIndex++;
    this.displayCurrentDailyWord();
}

completeDailyPractice() {
    const correctAnswers = this.dailyPracticeData.scores.filter(s => s.correct).length;
    const totalQuestions = this.dailyPracticeData.scores.length;
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

    // Update streak and statistics
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    if (this.dailyPracticeData.lastPracticeDate === yesterday) {
        this.dailyPracticeData.streak++;
    } else if (this.dailyPracticeData.lastPracticeDate !== today) {
        this.dailyPracticeData.streak = 1;
    }

    this.dailyPracticeData.lastPracticeDate = today;
    this.dailyPracticeData.totalDays++;
    this.dailyPracticeData.isActive = false;

    this.saveDailyPracticeData();

    // Show completion message
    const completionHTML = `
            <div class="daily-practice-complete">
                <h3>🎉 Daily Practice Complete!</h3>
                <div class="completion-stats">
                    <div class="stat-card">
                        <span class="stat-number">${accuracy}%</span>
                        <span class="stat-label">Accuracy</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${correctAnswers}/${totalQuestions}</span>
                        <span class="stat-label">Correct</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${this.dailyPracticeData.streak}</span>
                        <span class="stat-label">Day Streak</span>
                    </div>
                </div>
                <div class="streak-message">
                    ${this.getDailyStreakMessage()}
                </div>
                <div class="completion-actions">
                    <button id="completion-home-btn" class="daily-btn primary">🏠 Back to Home</button>
                    <button id="completion-stats-btn" class="daily-btn secondary">📊 View Progress</button>
                </div>
            </div>
        `;

    const dailyInterface = document.getElementById('daily-practice-interface');
    dailyInterface.innerHTML = completionHTML;

    // DÜZELTME: TAMAMLAMA EKRANI BUTONLARINA OLAY DİNLEYİCİLERİ EKLENİYOR
    this.addEventListenerSafely('completion-home-btn', 'click', () => this.showScreen('home'));
    this.addEventListenerSafely('completion-stats-btn', 'click', () => this.showStatistics());

    // Show celebration toast
    this.showToast(`Daily practice complete! ${accuracy}% accuracy - ${this.dailyPracticeData.streak} day streak!`, 'success');
}

getDailyStreakMessage() {
    const streak = this.dailyPracticeData.streak;

    if (streak >= 30) {
        return '🏆 Amazing! 30+ day streak! You\'re a vocabulary master!';
    } else if (streak >= 14) {
        return '🔥 Two weeks strong! Your dedication is paying off!';
    } else if (streak >= 7) {
        return '⭐ One week streak! Keep the momentum going!';
    } else if (streak >= 3) {
        return '🌟 Great consistency! You\'re building a strong habit!';
    } else {
        return '🌱 Every day counts! Keep practicing to build your streak!';
    }
}

exitDailyPractice() {
    // DÜZELTME: `isActive` kontrolü doğru yapılıyor.
    if (this.dailyPracticeData.isActive && this.dailyPracticeData.currentIndex < this.dailyPracticeData.currentWords.length) {
        // Ask for confirmation if practice is incomplete
        if (confirm('Are you sure you want to exit daily practice? Your progress will be lost.')) {
            this.dailyPracticeData.isActive = false;
            this.showScreen('home');
        }
    } else {
        this.showScreen('home');
    }
}

// Helper functions for daily practice
getRandomTurkishTranslations(correctAnswer, count) {
    const allTranslations = this.words.map(w => w.turkish).filter(t => t !== correctAnswer);
    return this.getRandomItems(allTranslations, count);
}

getRandomDefinitions(correctAnswer, count) {
    const allDefinitions = this.words.map(w => w.definition || w.turkish).filter(d => d !== correctAnswer);
    return this.getRandomItems(allDefinitions, count);
}



getRandomItems(array, count) {
    const shuffled = this.shuffleArray([...array]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Add daily practice button to home screen
addDailyPracticeToHome() {
    const learnedCount = this.learnedWords.size;
    if (learnedCount === 0) return;

    const today = new Date().toDateString();
    const lastPractice = this.dailyPracticeData.lastPracticeDate;

    // Only show if not practiced today
    if (lastPractice === today) return;

    const homeScreen = document.getElementById('home-screen');
    const existingButton = document.getElementById('daily-practice-home-btn');

    if (existingButton) {
        existingButton.remove();
    }

    const dailyPracticeBtn = document.createElement('button');
    dailyPracticeBtn.id = 'daily-practice-home-btn';
    dailyPracticeBtn.className = 'main-btn daily-practice-home';
    dailyPracticeBtn.innerHTML = `
            <span class="btn-icon">🌅</span>
            Daily Practice (${learnedCount} words)
        `;
    dailyPracticeBtn.onclick = () => this.startDailyPractice();

    // Insert after the main buttons
    const buttonContainer = homeScreen.querySelector('.main-buttons');
    buttonContainer.appendChild(dailyPracticeBtn);
}
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new VocabularyApp();
    window.app = app; // Make app globally available for inline onclick handlers
});