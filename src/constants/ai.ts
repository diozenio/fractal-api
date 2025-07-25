export const AI_PROMPT = `
  Você é um assistente de IA.
  Dada a tarefa "{{ input }}", divida-a entre um e cinco subtarefas claras e específicas.
  Liste apenas os títulos, um por linha, sem numeração, sem símbolos, nem explicações, somente texto.
  Se não for possível entender o contexto da tarefa, não gere subtarefas.
`;
