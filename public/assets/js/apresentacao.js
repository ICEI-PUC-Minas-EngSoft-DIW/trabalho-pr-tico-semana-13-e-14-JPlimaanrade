document.addEventListener("DOMContentLoaded", async () => {
try {
const response = await fetch('http://localhost:3000/sobreocard');
const cards = await response.json();

    const palavras = ["Deepwoken", "jogo", "morte","layer","bell","vida"];
    const labels = cards.map(c => c.titulo);

    // Para cada card, contar quantas vezes cada palavra aparece
    const datasets = palavras.map(palavra => {
        return {
            label: palavra,
            data: cards.map(card => {
                const texto = `${card.descricao} ${card.dicas} ${card.curiosidades} ${card.reflexao}`.toLowerCase();
                const regex = new RegExp(`\\b${palavra.toLowerCase()}\\b`, 'g');
                const count = texto.match(regex);
                return count ? count.length : 0;
            }),
            borderWidth: 1
        };
    });

    const ctx = document.getElementById('meuGrafico').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Contagem de palavras por card' }
            },
            scales: {
                y: { beginAtZero: true, stepSize: 1 }
            }
        }
    });
} catch (err) {
    console.error("Erro ao carregar os dados:", err);
}

});