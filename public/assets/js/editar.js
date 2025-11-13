// editar.js - edita CARD + SOBREOCARD (tenta atualizar ambos; cria sobreocard se não existir)
function getIdFromUrl() {
  return new URLSearchParams(window.location.search).get("id");
}

document.addEventListener("DOMContentLoaded", async () => {
  const id = getIdFromUrl();
  const form = document.getElementById("formEditar");
  const statusEl = document.getElementById("status");
  const btnDeletar = document.getElementById("btnDeletar");

  if (!id) {
    alert("ID não fornecido na URL.");
    return;
  }
  if (!form) {
    console.error("Form #formEditar não encontrado no HTML.");
    return;
  }

  const safeGet = sel => document.getElementById(sel) || null;

  // Função para preencher campos de card
  async function loadCard() {
    try {
      const res = await fetch(`http://localhost:3000/cards/${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error("Erro ao buscar card:", err);
      return null;
    }
  }

  // Função para preencher campos de sobreocard
  async function loadSobre() {
    try {
      const res = await fetch(`http://localhost:3000/sobreocard/${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error("Erro ao buscar sobreocard:", err);
      return null;
    }
  }

  // Carrega ambos e preenche o formulário
  const [card, sobre] = await Promise.all([loadCard(), loadSobre()]);

  // Preenche campos básicos (card)
  if (card) {
    if (safeGet("titulo")) safeGet("titulo").value = card.titulo || "";
    if (safeGet("descricao")) safeGet("descricao").value = card.descricao || "";
    if (safeGet("imagem")) safeGet("imagem").value = card.imagem || "";
  }

  // Preenche campos de detalhe (sobreocard) — se existir, sobrepõe
  if (sobre) {
    if (safeGet("titulo")) safeGet("titulo").value = sobre.titulo || (card ? card.titulo : "");
    if (safeGet("descricao")) safeGet("descricao").value = sobre.descricao || (card ? card.descricao : "");
    if (safeGet("imagem")) safeGet("imagem").value = sobre.imagem || (card ? card.imagem : "");
    if (safeGet("dicas")) safeGet("dicas").value = sobre.dicas || "";
    if (safeGet("curiosidades")) safeGet("curiosidades").value = sobre.curiosidades || "";
    if (safeGet("reflexao")) safeGet("reflexao").value = sobre.reflexao || "";
    for (let i = 1; i <= 5; i++) {
      const imgEl = safeGet(`imagem${i}`);
      const descEl = safeGet(`descimg${i}`);
      if (imgEl) imgEl.value = sobre[`imagem${i}`] || "";
      if (descEl) descEl.value = sobre[`descimg${i}`] || "";
    }
  } else {
    // se não existe sobre, tenta popular imagens do card (se houver) ou deixar vazio
    for (let i = 1; i <= 5; i++) {
      const imgEl = safeGet(`imagem${i}`);
      const descEl = safeGet(`descimg${i}`);
      if (imgEl) imgEl.value = card && card[`imagem${i}`] ? card[`imagem${i}`] : "";
      if (descEl) descEl.value = card && card[`descimg${i}`] ? card[`descimg${i}`] : "";
    }
  }

  // Submit: atualiza /cards/:id e /sobreocard/:id (cria se necessário)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl && (statusEl.textContent = "Salvando...");

    // Monta objeto do card (resumo)
    const updatedCard = {
      titulo: safeGet("titulo") ? safeGet("titulo").value.trim() : "",
      descricao: safeGet("descricao") ? safeGet("descricao").value.trim() : "",
      imagem: safeGet("imagem") ? safeGet("imagem").value.trim() : ""
    };

    // Monta objeto do sobre (detalhe)
    const updatedSobre = {
      id: id, // garante que o objeto terá o mesmo id
      titulo: updatedCard.titulo,
      descricao: updatedCard.descricao,
      imagem: updatedCard.imagem,
      dicas: safeGet("dicas") ? safeGet("dicas").value.trim() : "",
      curiosidades: safeGet("curiosidades") ? safeGet("curiosidades").value.trim() : "",
      reflexao: safeGet("reflexao") ? safeGet("reflexao").value.trim() : ""
    };

    for (let i = 1; i <= 5; i++) {
      updatedSobre[`imagem${i}`] = safeGet(`imagem${i}`) ? safeGet(`imagem${i}`).value.trim() : "";
      updatedSobre[`descimg${i}`] = safeGet(`descimg${i}`) ? safeGet(`descimg${i}`).value.trim() : "";
    }

    try {
      // 1) Atualiza card (PUT). Se card não existir, cria com POST.
      let resCard = await fetch(`http://localhost:3000/cards/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCard)
      });

      if (!resCard.ok) {
        // se PUT falhar (ex: 404), tenta POST (criar)
        const createCard = Object.assign({ id: id }, updatedCard);
        resCard = await fetch(`http://localhost:3000/cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createCard)
        });
        if (!resCard.ok) throw new Error("Falha ao criar card");
      }

      // 2) Atualiza sobreocard (PUT). Se não existir (404), cria com POST usando id igual.
      let resSobre = await fetch(`http://localhost:3000/sobreocard/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSobre)
      });

      if (!resSobre.ok) {
        // cria com POST e id explícito (garante correspondência)
        resSobre = await fetch(`http://localhost:3000/sobreocard`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedSobre)
        });
        if (!resSobre.ok) throw new Error("Falha ao criar sobreocard");
      }

      statusEl && (statusEl.textContent = "✅ Salvo com sucesso!");
      setTimeout(() => {
        window.location.href = `/public/index.html`;
      }, 700);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      statusEl && (statusEl.textContent = "❌ Erro ao salvar. Veja console.");
      alert("Erro ao salvar. Veja console para detalhes.");
    }
  });

  // 🗑️ DELETAR: Remove tanto /cards/:id quanto /sobreocard/:id
  if (btnDeletar) {
    btnDeletar.addEventListener("click", async () => {
      if (!confirm("⚠️ Tem certeza que deseja deletar este item? Esta ação é irreversível!")) {
        return;
      }

      statusEl && (statusEl.textContent = "Deletando...");

      try {
        // 1) Deleta o card
        const resCard = await fetch(`http://localhost:3000/cards/${encodeURIComponent(id)}`, {
          method: "DELETE"
        });

        if (!resCard.ok) {
          console.warn("Card não encontrado para deletar (pode já ter sido removido)");
        }

        // 2) Deleta o sobreocard
        const resSobre = await fetch(`http://localhost:3000/sobreocard/${encodeURIComponent(id)}`, {
          method: "DELETE"
        });

        if (!resSobre.ok) {
          console.warn("Sobreocard não encontrado para deletar (pode já ter sido removido)");
        }

        statusEl && (statusEl.textContent = "✅ Item deletado com sucesso!");
        setTimeout(() => {
          window.location.href = `/public/index.html`;
        }, 700);
      } catch (err) {
        console.error("Erro ao deletar:", err);
        statusEl && (statusEl.textContent = "❌ Erro ao deletar. Veja console.");
        alert("Erro ao deletar. Veja console para detalhes.");
      }
    });
  }
});