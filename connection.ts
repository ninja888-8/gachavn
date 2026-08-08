import { toggleQuizMenu } from './learn.js';

/* make api requests to llm.py */
const uploadMenu = document.getElementById('upload-menu') as HTMLDivElement;
const imageInput = document.getElementById('image-picker') as HTMLInputElement;
const preview = document.getElementById('preview') as HTMLImageElement;
const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;

class QuestionWrapper {
    constructor(
        public question: string = '',
        public options: string[] = [],
        public answer: string = ''
    ) {
        this.question = question;
        this.options = [ ...options ];
        this.answer = answer;
    }
}

let llmResponse: QuestionWrapper[] | null = null;
export { llmResponse, QuestionWrapper };

async function sendImageToBackend() {
    const file = imageInput.files?.[0];

    if (!file) {
        console.error('No file selected');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://127.0.0.1:8000/api/questions', {
            method: 'POST',
            body: formData
        });

        if (response.status !== 200) {
            console.error('Error from backend:', response.statusText);
        }

        const data = await response.json();
        let answer = data.response;

        // const answer = 
        // [
        //     {
        //         "question": "What type of bonds connect nucleotides together in a nucleic acid strand?",
        //         "options": [
        //             "Hydrogen bonds",
        //             "Phosphodiester linkages",
        //             "Peptide bonds",
        //             "Ester linkages"
        //         ],
        //         "answer": "Phosphodiester linkages"
        //     },
        //     {
        //         "question": "Which of the following nitrogenous bases is found in RNA but NOT in DNA?",
        //         "options": [
        //             "Adenine",
        //             "Thymine",
        //             "Uracil",
        //             "Cytosine"
        //         ],
        //         "answer": "Uracil"
        //     },
        //     {
        //         "question": "What level of protein structure involves alpha helices and beta-pleated sheets stabilized by hydrogen bonds?",
        //         "options": [
        //             "Primary structure",
        //             "Secondary structure",
        //             "Tertiary structure",
        //             "Quaternary structure"
        //         ],
        //         "answer": "Secondary structure"
        //     },
        //     {
        //         "question": "Which polysaccharide is primarily used for plant cell walls and features beta-1,4 linkages?",
        //         "options": [
        //             "Glycogen",
        //             "Maltose",
        //             "Cellulose",
        //             "Steroid"
        //         ],
        //         "answer": "Cellulose"
        //     },
        //     {
        //         "question": "What type of linkage is formed between a fatty acid and glycerol in a triglyceride?",
        //         "options": [
        //             "Glycosidic linkage",
        //             "Phosphodiester linkage",
        //             "Ester linkage",
        //             "Peptide bond"
        //         ],
        //         "answer": "Ester linkage"
        //     },
        //     {
        //         "question": "What functional groups are attached to the central carbon of a standard amino acid?",
        //         "options": [
        //             "An amino group and a carboxyl group",
        //             "A phosphate group and a hydroxyl group",
        //             "An ester group and a methyl group",
        //             "A sulfhydryl group and an aldehyde group"
        //         ],
        //         "answer": "An amino group and a carboxyl group"
        //     }
        // ]
        
        if (typeof answer === 'string') {
            answer = JSON.parse(answer);
        }

        if (!Array.isArray(answer)) {
            console.error('Unexpected response format from backend / llm:', answer);
            return;
        }

        const wrappedResponse = answer.map((item: any) => new QuestionWrapper(item.question, item.options, item.answer));

        llmResponse = wrappedResponse; // store the response for use in next screen
        console.log('Response from backend:', llmResponse);

        toggleUploadMenu(); // hide upload menu
        toggleQuizMenu(); // show quiz menu

    } catch (error) {
        console.error('Error sending image to backend:', error);

        // display error message to user
        alert('An error occurred while processing your request. Please try again.');
    }
}

function toggleUploadMenu() {
    if (uploadMenu) {
        uploadMenu.style.display = uploadMenu.style.display === 'none' ? 'block' : 'none';
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