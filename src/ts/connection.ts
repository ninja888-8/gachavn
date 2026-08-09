import { toggleQuizMenu } from './learn.ts';
import { QuestionWrapper, setLlmResponse } from './state.ts';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'https://gachavn.onrender.com';

/* make api requests to llm.py */
const uploadMenu = document.getElementById('upload-menu') as HTMLDivElement;
const loadingMenu = document.getElementById('loading-menu') as HTMLDivElement;
const imageInput = document.getElementById('image-picker') as HTMLInputElement;
const preview = document.getElementById('preview') as HTMLImageElement;
const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;

async function sendImageToBackend() {
    const file = imageInput.files?.[0];

    if (!file) {
        console.error('No file selected');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        toggleUploadMenu(); // hide upload menu
        toggleLoadingMenu(); // show loading menu

        const response = await fetch(`${API_BASE}/api/questions`, {
            method: 'POST',
            body: formData
        });

        if (response.status !== 200) {
            console.error('Error from backend:', response.statusText);
        }

        const data = await response.json();
        let answer = data.response;
        console.log('Response from backend:', answer);

        if (typeof answer === 'string') {
            answer = JSON.parse(answer);
        }

        if (!Array.isArray(answer)) {
            console.error('Unexpected response format from backend / llm:', answer);
            return;
        }

        const wrappedResponse = answer.map((item: any) => new QuestionWrapper(item.question, item.options, item.answer));

        setLlmResponse(wrappedResponse);
        console.log('Response from backend:', wrappedResponse);

        toggleLoadingMenu(); // hide loading menu
        toggleQuizMenu(); // show quiz menu

    } catch (error) {
        console.error('Error sending image to backend:', error);

        // display error message to user
        alert('An error occurred while processing your request. Please try again.');
    }
}

export function toggleUploadMenu() {
    if (uploadMenu) {
        uploadMenu.style.display = uploadMenu.style.display === 'none' ? 'block' : 'none';
    }
}

function toggleLoadingMenu() {
    if (loadingMenu) {
        loadingMenu.style.display = loadingMenu.style.display === 'none' ? 'block' : 'none';
    }
}

// shows preview of image
imageInput?.addEventListener('change', function(event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(e: ProgressEvent<FileReader>) {
            if (preview) {
                const placeholder = document.querySelector('.dropzone-placeholder') as HTMLSpanElement | null;
                preview.src = e.target?.result as string;
                preview.style.display = 'block';
                if (placeholder) {
                    placeholder.style.opacity = '0';
                }
                submitBtn.disabled = false;
            }
        }

        reader.readAsDataURL(file);
    }
});

submitBtn?.addEventListener('click', sendImageToBackend);