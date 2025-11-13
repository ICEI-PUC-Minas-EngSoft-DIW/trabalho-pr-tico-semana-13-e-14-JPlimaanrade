document.addEventListener("DOMContentLoaded", async () => {
    try {
        // 📡 Busca dados do JSON Server
        const resCards = await fetch('http://localhost:3000/cards');
        const resSobre = await fetch('http://localhost:3000/sobreocard');

        if (!resCards.ok || !resSobre.ok) {
            throw new Error('Erro ao buscar dados do servidor');
        }

        const cards = await resCards.json();
        const sobreocards = await resSobre.json();

        // 📊 PROCESSAMENTO DE DADOS

        // 1️⃣ Extrai nomes dos cards (para usar como categorias)
        const nomeCards = cards.map(card => card.titulo || 'Sem título').slice(0, 12);
        
        // 2️⃣ Conta caracteres de cada sobreocard (para medir "quantidade de conteúdo")
        const conteudoPorCard = sobreocards.map(sobre => {
            const totalChars = 
                (sobre.dicas || '').length +
                (sobre.curiosidades || '').length +
                (sobre.reflexao || '').length;
            return Math.round(totalChars / 100); // Normaliza em blocos de 100 chars
        }).slice(0, 12);

        // 3️⃣ Classifica cards por tipo (baseado em palavras-chave do título)
        const tiposCards = {
            'Guia': 0,
            'Builds': 0,
            'Attunements': 0,
            'PvP': 0,
            'Armas': 0,
            'Locais': 0,
            'Bells': 0,
            'Oaths': 0,
            'Monstros': 0,
            'Bosses': 0,
            'Outros': 0
        };

        cards.forEach(card => {
            const titulo = (card.titulo || '').toUpperCase();
            if (titulo.includes('GUIA')) tiposCards['Guia']++;
            else if (titulo.includes('BUILD')) tiposCards['Builds']++;
            else if (titulo.includes('ATTUNEMENT')) tiposCards['Attunements']++;
            else if (titulo.includes('PVP')) tiposCards['PvP']++;
            else if (titulo.includes('ARMA')) tiposCards['Armas']++;
            else if (titulo.includes('ETRIS') || titulo.includes('LOCAL') || titulo.includes('DEEPTH')) tiposCards['Locais']++;
            else if (titulo.includes('BELL')) tiposCards['Bells']++;
            else if (titulo.includes('OATH')) tiposCards['Oaths']++;
            else if (titulo.includes('MONSTRO') || titulo.includes('MOB')) tiposCards['Monstros']++;
            else if (titulo.includes('BOSS')) tiposCards['Bosses']++;
            else tiposCards['Outros']++;
        });

        const tiposLabels = Object.keys(tiposCards).filter(tipo => tiposCards[tipo] > 0);
        const tiposValores = tiposLabels.map(tipo => tiposCards[tipo]);

        // 4️⃣ Dados para gráfico de linha (simulando evolução)
        const mesesLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
        const evoluçãoCards = [3, 5, 8, 10, 12, cards.length];
        const evoluçãoConteúdo = [15, 28, 45, 62, 78, sobreocards.reduce((acc, s) => acc + (s.dicas || '').length, 0) / 100];

        // 5️⃣ ESTATÍSTICAS RESUMIDAS
        const totalCards = cards.length;
        const totalConteudos = sobreocards.length;
        const mediaConteudo = totalCards > 0 ? (conteudoPorCard.reduce((a, b) => a + b, 0) / totalCards).toFixed(1) : 0;

        document.getElementById('totalCards').textContent = totalCards;
        document.getElementById('totalConteudos').textContent = totalConteudos;
        document.getElementById('mediaCard').textContent = mediaConteudo;

        // 🎨 CORES CUSTOMIZADAS (tema Deepwoken)
        const corPrimaria = '#6C63FF';
        const corSecundaria = '#FF6B6B';
        const corTerciaria = '#4ECDC4';
        const corQuarta = '#FFE66D';

        const paleta = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
            '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A8D8EA'
        ];

        // 📈 GRÁFICO 1: PIZZA - Distribuição de Cards por Tipo
        const ctxPizza = document.getElementById('chartPizza').getContext('2d');
        new Chart(ctxPizza, {
            type: 'doughnut',
            data: {
                labels: tiposLabels,
                datasets: [{
                    data: tiposValores,
                    backgroundColor: paleta.slice(0, tiposLabels.length),
                    borderColor: '#1a1a1a',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            font: { size: 12 },
                            padding: 15
                        }
                    }
                }
            }
        });

        // 📊 GRÁFICO 2: BARRAS - Quantidade de Conteúdo por Card
        const ctxBarras = document.getElementById('chartBarras').getContext('2d');
        new Chart(ctxBarras, {
            type: 'bar',
            data: {
                labels: nomeCards,
                datasets: [{
                    label: 'Blocos de Conteúdo (100 chars)',
                    data: conteudoPorCard,
                    backgroundColor: corPrimaria,
                    borderColor: corSecundaria,
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: '#444444' }
                    },
                    y: {
                        ticks: { color: '#ffffff' },
                        grid: { color: '#444444' }
                    }
                }
            }
        });

        // 📉 GRÁFICO 3: LINHA - Visualização Geral de Dados
        const ctxLinha = document.getElementById('chartLinha').getContext('2d');
        new Chart(ctxLinha, {
            type: 'line',
            data: {
                labels: mesesLabels,
                datasets: [
                    {
                        label: 'Cards Criados',
                        data: evoluçãoCards,
                        borderColor: corPrimaria,
                        backgroundColor: 'rgba(108, 99, 255, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointBackgroundColor: corPrimaria,
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Conteúdo (blocos de 100 chars)',
                        data: evoluçãoConteúdo,
                        borderColor: corTerciaria,
                        backgroundColor: 'rgba(78, 205, 196, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointBackgroundColor: corTerciaria,
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff', font: { size: 12 } }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: '#444444' }
                    },
                    y: {
                        ticks: { color: '#ffffff' },
                        grid: { color: '#444444' },
                        beginAtZero: true
                    }
                }
            }
        });

    } catch (error) {
        console.error('Erro ao carregar gráficos:', error);
        document.querySelector('.container').innerHTML = 
            '<div class="alert alert-danger mt-5">Erro ao carregar dados. Verifique se o JSON Server está rodando em http://localhost:3000</div>';
    }
});