document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('formNovoItem');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Coleta dados do CARD (resumo)
        const cardObj = {
            titulo: form.titulo.value,
            descricao: form.descricao.value,
            imagem: form.imagem.value,
            dicas: form.dicas.value || "",
            curiosidades: form.curiosidades.value || "",
            reflexao: form.reflexao.value || ""
        };

        // Adiciona imagens relacionadas (1 a 5)
        for (let i = 1; i <= 5; i++) {
            cardObj[`imagem${i}`] = form[`imagem${i}`].value || "";
            cardObj[`descimg${i}`] = form[`descimg${i}`].value || "";
        }

        try {
            // 1️⃣ Cria o CARD em /cards
            const resCard = await fetch('http://localhost:3000/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cardObj)
            });

            if (!resCard.ok) throw new Error('Erro ao criar card');

            const createdCard = await resCard.json();

            // 2️⃣ Cria o SOBREOCARD em /sobreocard com o MESMO ID
            const sobreObj = { ...cardObj, id: createdCard.id };

            const resSobre = await fetch('http://localhost:3000/sobreocard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sobreObj)
            });

            if (!resSobre.ok) throw new Error('Erro ao criar sobreocard');

            // ✅ Sucesso!
            document.getElementById('status').textContent = "✅ Item criado com sucesso!";
            form.reset();
            
            setTimeout(() => window.location.href = '/public/index.html', 1000);

        } catch (err) {
            console.error('Erro:', err);
            document.getElementById('status').textContent = "❌ Erro ao criar item: " + err.message;
        }
    });
});