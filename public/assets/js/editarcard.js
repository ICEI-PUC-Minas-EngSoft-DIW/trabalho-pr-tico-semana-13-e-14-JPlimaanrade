// editarcard.js - edita apenas o recurso /cards/:id
function getIdFromUrl() {
  return new URLSearchParams(window.location.search).get("id");
}

document.addEventListener("DOMContentLoaded", async () => {
  const id = getIdFromUrl();
  const form = document.getElementById("formEditar");
  const status = document.getElementById("status");

  if (!id) { if (status) status.textContent = "ID não informado."; return; }
  if (!form) { console.error("Form #formEditar não encontrado."); return; }

  try {
    const res = await fetch(`http://localhost:3000/cards/${encodeURIComponent(id)}`);
    if (!res.ok) { if (status) status.textContent = "Card não encontrado."; return; }
    const card = await res.json();

    // Preenche
    const elTitulo = document.getElementById("titulo");
    const elDescricao = document.getElementById("descricao");
    const elImagem = document.getElementById("imagem");
    if (elTitulo) elTitulo.value = card.titulo || "";
    if (elDescricao) elDescricao.value = card.descricao || "";
    if (elImagem) elImagem.value = card.imagem || "";

  } catch (err) {
    console.error(err);
    if (status) status.textContent = "Erro ao carregar card.";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (status) status.textContent = "Salvando...";

    const updated = {
      titulo: document.getElementById("titulo") ? document.getElementById("titulo").value.trim() : "",
      descricao: document.getElementById("descricao") ? document.getElementById("descricao").value.trim() : "",
      imagem: document.getElementById("imagem") ? document.getElementById("imagem").value.trim() : ""
    };

    try {
      const res = await fetch(`http://localhost:3000/cards/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (!res.ok) throw new Error("Erro ao salvar card");

      if (status) status.textContent = "Card atualizado com sucesso!";
      setTimeout(() => window.location.href = `detalhes.html?id=${encodeURIComponent(id)}`, 600);
    } catch (err) {
      console.error(err);
      if (status) status.textContent = "Erro ao salvar card.";
      alert("Erro ao salvar card. Veja console.");
    }
  });
});
