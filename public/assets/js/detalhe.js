// Função para obter o ID da URL
function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

document.addEventListener("DOMContentLoaded", async () => {
    const id = getIdFromUrl();
    if (!id) {
        document.getElementById('titulo').textContent = "ID não fornecido";
        return;
    }

    // Helper para preencher campos com segurança
    const safeSetText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value || "";
    };
    const safeSetImg = (id, src) => {
        const el = document.getElementById(id);
        if (el) el.src = src || "";
    };

    try {
        // tenta buscar direto em /sobreocard/:id
        let res = await fetch(`http://localhost:3000/sobreocard/${encodeURIComponent(id)}`);
        if (res.ok) {
            const item = await res.json();

            safeSetText('titulo', item.titulo);
            safeSetText('descricao', item.descricao);
            safeSetImg('imagem', item.imagem);
            safeSetText('dicas', item.dicas);
            safeSetText('curiosidades', item.curiosidades);
            safeSetText('reflexao', item.reflexao);

            for (let i = 1; i <= 5; i++) {
                safeSetImg(`imagem${i}`, item[`imagem${i}`]);
                safeSetText(`descimg${i}`, item[`descimg${i}`]);
            }
        } else {
            // fallback para /cards/:id (dados básicos)
            res = await fetch(`http://localhost:3000/cards/${encodeURIComponent(id)}`);
            if (res.ok) {
                const item = await res.json();
                safeSetText('titulo', item.titulo);
                safeSetText('descricao', item.descricao);
                safeSetImg('imagem', item.imagem);
                // limpa campos extras
                safeSetText('dicas', "");
                safeSetText('curiosidades', "");
                safeSetText('reflexao', "");
                for (let i = 1; i <= 5; i++) {
                    safeSetImg(`imagem${i}`, "");
                    safeSetText(`descimg${i}`, "");
                }
            } else {
                document.getElementById('titulo').textContent = "Detalhe não encontrado";
            }
        }
    } catch (err) {
        console.error("Erro ao carregar os dados:", err);
        document.getElementById('titulo').textContent = "Erro ao carregar os dados";
    }

    // --- Listener do botão editar (garante que o elemento exista) ---
    const editarBtn = document.getElementById('editarBtn');
    if (editarBtn) {
        editarBtn.addEventListener('click', () => {
            // ajuste o caminho se seu editar.html estiver em outra pasta (ex: /public/editar.html)
            window.location.href = `editar.html?id=${encodeURIComponent(id)}`;
        });
    } else {
        // se você não tiver o botão com id 'editarBtn', descomente a linha abaixo para criar um botão dinamicamente
        // const btn = document.createElement('button'); btn.textContent = 'Editar'; btn.className='btn btn-warning'; btn.addEventListener('click', ()=> window.location.href=`editar.html?id=${encodeURIComponent(id)}`); document.getElementById('detalhes').appendChild(btn);
        console.warn("Botão de editar não encontrado (id='editarBtn'). Adicione id='editarBtn' ao botão ou use criação dinâmica.");
    }
});
