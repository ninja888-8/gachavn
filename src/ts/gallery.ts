type ImageEntry = {
    name: string;
    src: string;
};

const imageModules = (import.meta as any).glob('../images/*', { eager: true, as: 'url' }) as Record<string, string>;

const excludedFiles = new Set([
    'legendary-flair.png',
    'rare-flair.png',
    'small-star.png',
]);

const images: ImageEntry[] = Object.entries(imageModules)
    .filter(([path]) => !excludedFiles.has(path.split('/').pop() ?? ''))
    .map(([path, src]) => {
        const fileName = path.split('/').pop() ?? path;
        const name = fileName
            .replace(/\.[^.]+$/, '')
            .replace(/[-_]+/g, ' ')
            .replace(/\b\w/g, (letter) => letter.toUpperCase());

        return { name, src };
    });

const container = document.getElementById('image-gallery');

if (container) {
    const cards = images.map((image) => {
        const card = document.createElement('article');
        card.className = 'gallery-card';

        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.name;

        const label = document.createElement('p');
        label.textContent = image.name;

        card.append(img, label);
        return card;
    });

    container.append(...cards);
}
