import { llmResponse } from './state.ts';
import { getEarnedPulls, incrementEarnedPulls, renderPullCount } from './pull-count.ts';

const quizMenu = document.getElementById('quiz-menu') as HTMLDivElement;
const questionHeader = document.getElementById('question-header') as HTMLDivElement;
const answerChoicesContainer = document.getElementById('answer-choices') as HTMLDivElement | null;
const answerChoices = document.querySelectorAll('#answer-choices button') as NodeListOf<HTMLButtonElement>;
const readyBtn = document.getElementById('ready-btn') as HTMLButtonElement;
const pullCountDisplay = document.getElementById('pull-count-display') as HTMLDivElement | null;
const questionProgress = document.getElementById('question-progress') as HTMLDivElement | null;
const quizFeedback = document.getElementById('quiz-feedback') as HTMLDivElement | null;

const FEEDBACK_DELAY_MS = 900;
const CORRECT_CLASS = 'answer-correct';
const WRONG_CLASS = 'answer-wrong';

function clearAnswerFeedback() {
    answerChoices.forEach((button) => {
        button.classList.remove(CORRECT_CLASS, WRONG_CLASS);
        button.style.backgroundColor = '';
        button.style.color = '';
        button.style.borderColor = '';
    });
}

function markAnswerButton(button: HTMLButtonElement, correct: boolean) {
    button.classList.add(correct ? CORRECT_CLASS : WRONG_CLASS);
    button.style.backgroundColor = correct ? '#3ddc84' : '#e5484d';
    button.style.color = '#ffffff';
    button.style.borderColor = correct ? '#2fb86b' : '#c73a40';
}

let currentQuestionIndex = 0;
let earnedPulls = getEarnedPulls();

export function toggleQuizMenu() {
    if (quizMenu) {
        quizMenu.style.display = quizMenu.style.display == 'none' ? 'block' : 'none';
    }
}

function updatePullSummary(message?: string) {
    earnedPulls = getEarnedPulls();
    renderPullCount(pullCountDisplay);

    if (quizFeedback) {
        quizFeedback.textContent = message ?? `Correct answers add pulls. Your stash is now ${earnedPulls}.`;
    }
}

function initQuestion(questionIndex: number = 0) {
    if (llmResponse) {
        readyBtn.style.display = 'none';

        questionHeader.textContent = llmResponse[questionIndex].question;
        const choices = llmResponse[questionIndex].options;

        if (answerChoicesContainer) {
            answerChoicesContainer.style.display = '';
        }

        answerChoices.forEach((button, index) => {
            button.style.display = 'block';
            button.textContent = choices[index];
        });
        clearAnswerFeedback();

        if (questionProgress) {
            questionProgress.textContent = `Question ${questionIndex + 1} of ${llmResponse.length}`;
        }

        updatePullSummary('Pick the best answer to earn a pull.');
    }
    else {
        console.log("failed to fetch llmResponse from connection.js");
    }
}

function answerQuestion(buttonId: number) {
    if (llmResponse) {
        const correctAnswer = llmResponse[currentQuestionIndex].answer;
        const options = llmResponse[currentQuestionIndex].options;
        const isCorrect = options[buttonId - 1] === correctAnswer;

        answerChoices.forEach((button) => { button.disabled = true; });

        const selectedButton = answerChoices[buttonId - 1];
        if (selectedButton) {
            markAnswerButton(selectedButton, isCorrect);
        }
        if (!isCorrect) {
            const correctIndex = options.indexOf(correctAnswer);
            const correctButton = correctIndex >= 0 ? answerChoices[correctIndex] : null;
            if (correctButton) {
                markAnswerButton(correctButton, true);
            }
        }

        if (isCorrect) {
            incrementEarnedPulls();
            updatePullSummary('Correct! Your pull stash just grew.');
        } else {
            updatePullSummary(`Not quite. The correct answer was: ${correctAnswer}`);
        }

        setTimeout(() => {
            clearAnswerFeedback();
            answerChoices.forEach((button) => { button.disabled = false; });

            if (llmResponse) {
                if (currentQuestionIndex < llmResponse.length - 1) {
                    currentQuestionIndex++;
                    initQuestion(currentQuestionIndex);
                } else {
                    questionHeader.textContent = "You've completed all the questions!";
                    if (answerChoicesContainer) {
                        answerChoicesContainer.style.display = 'none';
                    }
                    answerChoices.forEach(button => {
                        button.style.display = 'none';
                    });
                    readyBtn.style.display = 'none';
                    if (questionProgress) {
                        questionProgress.textContent = 'Quiz complete';
                    }
                    updatePullSummary('You finished the set. Head to the gacha room to spend your pulls.');
                }
            }
        }, FEEDBACK_DELAY_MS);
    }
    else {
        console.log("failed to fetch llmResponse from connection.js");
    }
}

function handleAnswerClick(event: Event) {
    let buttonId = (event.target as HTMLButtonElement).dataset.id;
    if (buttonId) {
        answerQuestion(parseInt(buttonId));
    }
}

readyBtn?.addEventListener('click', () => initQuestion(currentQuestionIndex));
answerChoices.forEach(button => {
    button.addEventListener('click', handleAnswerClick);
});