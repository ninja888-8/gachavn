import { llmResponse } from './connection.js';

const quizMenu = document.getElementById('quiz-menu') as HTMLDivElement;
const questionHeader = document.getElementById('question-header') as HTMLDivElement;
const answerChoices = document.querySelectorAll('#answer-choices button') as NodeListOf<HTMLButtonElement>;
const readyBtn = document.getElementById('ready-btn') as HTMLButtonElement;

let currentQuestionIndex = 0;
let earnedPulls = 0;

export function toggleQuizMenu() {
    if (quizMenu) {
        quizMenu.style.display = quizMenu.style.display == 'none' ? 'block' : 'none';
    }
}

function initQuestion(questionIndex: number = 0) {
    if (llmResponse) {
        readyBtn.style.display = 'none';

        questionHeader.textContent = llmResponse[questionIndex].question;
        const choices = llmResponse[questionIndex].options;

        answerChoices.forEach((button, index) => {
            button.textContent = choices[index];
        });
    }
    else {
        console.log("failed to fetch llmResponse from connection.js");
    }
}

function answerQuestion(buttonId: number) {
    if (llmResponse) {
        if (llmResponse[currentQuestionIndex].options[buttonId - 1] === llmResponse[currentQuestionIndex].answer) {
            earnedPulls++;
            alert("Correct!");
        } else {
            alert(`Incorrect! The correct answer is: ${llmResponse[currentQuestionIndex].answer}`);
        }

        if (currentQuestionIndex < llmResponse.length - 1) {
            currentQuestionIndex++;
            initQuestion(currentQuestionIndex);
        } else {
            questionHeader.textContent = "You've completed all the questions!";
            answerChoices.forEach(button => {
                button.style.display = 'none';
            });
            readyBtn.style.display = 'none';
        }
    }
    else {
        console.log("failed to fetch llmResponse from connection.js");
    }

    // temp
    console.log(`Earned pulls: ${earnedPulls}`);
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
