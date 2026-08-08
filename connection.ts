/* make api requests to llm.py */
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
        const response = await fetch('http://127.0.0.1:8000/api/questions', {
            method: 'POST',
            body: formData
        });

        if (response.status !== 200) {
            console.error('Error from backend:', response.statusText);
        }
    } catch (error) {
        console.error('Error sending image to backend:', error);
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
                preview.src = e.target?.result as string;
                preview.style.display = 'block';
                submitBtn.disabled = false;
            }
        }

        reader.readAsDataURL(file);
    }
});

submitBtn?.addEventListener('click', sendImageToBackend);