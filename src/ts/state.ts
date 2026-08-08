export class QuestionWrapper {
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

export let llmResponse: QuestionWrapper[] | null = null;

export function setLlmResponse(response: QuestionWrapper[] | null) {
    llmResponse = response;
}
