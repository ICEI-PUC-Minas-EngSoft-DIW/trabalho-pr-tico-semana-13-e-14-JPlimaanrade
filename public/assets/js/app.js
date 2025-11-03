document.addEventListener("DOMContentLoaded", async () => {
    try {
        // --- CARROSSEL ---
        const resCarousel = await fetch("http://localhost:3000/carrossel");
        const carrossel = await resCarousel.json();

        const carouselInner = document.querySelector(".carousel-inner");
        const carouselIndicators = document.querySelector(".carousel-indicators");
        carouselInner.innerHTML = ""; // Limpa antes de gerar
        carouselIndicators.innerHTML = ""; // Limpa antes de gerar

        carrossel.forEach((item, index) => {
            const carouselItem = document.createElement("div");
            carouselItem.classList.add("carousel-item");
            if (index === 0) carouselItem.classList.add("active");
            carouselItem.innerHTML = `
                <img src="${item.imagem}" class="d-block w-100" alt="${item.titulo}">
                <div class="carousel-caption d-none d-md-block">
                    <h5>${item.titulo}</h5>
                    <p>${item.descricao}</p>
                    <a href="${item.link}" class="btn btn-primary">Saiba Mais</a>
                </div>
            `;
            carouselInner.appendChild(carouselItem);

            const indicator = document.createElement("button");
            indicator.type = "button";
            indicator.setAttribute("data-bs-target", "#carouselExampleCaptions");
            indicator.setAttribute("data-bs-slide-to", index);
            if (index === 0) indicator.classList.add("active");
            carouselIndicators.appendChild(indicator);
        });

        // --- CARDS ---
        const resCards = await fetch("http://localhost:3000/cards");
        const cards = await resCards.json();

        const cardsContainer = document.querySelector(".Cards_top");
        cardsContainer.innerHTML = ""; // Limpa antes de gerar os cards

        cards.forEach(item => {
            const card = document.createElement("div");
            card.classList.add("card", "m-3");
            card.style.width = "18rem";
            card.style.backgroundColor = "rgb(18, 119, 9)";
            card.innerHTML = `
                <img src="${item.imagem}" class="card-img-top" alt="${item.titulo}">
                <div class="card-body">
                    <h4 class="card-title">${item.titulo}</h4>
                    <p class="card-text">${item.descricao}</p>
                    <a href="detalhe.html?id=${item.id}" class="btn btn-primary">Detalhes</a>
                    <a href="editar.html?id=${item.id}" class="btn btn-warning">Editar</a>
                    <button class="btn btn-danger btn-delete">Excluir</button>
                </div>
            `;
            cardsContainer.appendChild(card);

            // --- DELETE FUNCTION ---
            const deleteBtn = card.querySelector(".btn-delete");
            deleteBtn.addEventListener("click", async () => {
                const confirmar = confirm(`Deseja realmente excluir "${item.titulo}"?`);
                if (confirmar) {
                    try {
                        const resDelete = await fetch(`http://localhost:3000/cards/${item.id}`, {
                            method: "DELETE"
                        });
                        if (resDelete.ok) {
                            card.remove();
                            alert("Item excluído com sucesso!");
                        } else {
                            alert("Erro ao excluir o item.");
                        }
                    } catch (err) {
                        console.error("Erro ao excluir:", err);
                        alert("Erro ao excluir o item.");
                    }
                }
            });
        });

        // --- SOBREOCARD ---
        const resSobre = await fetch("http://localhost:3000/sobreocard");
        const sobreocard = await resSobre.json();
        const sobreContainer = document.querySelector(".sobre-container");
        if (sobreContainer && sobreocard.length > 0) {
            sobreContainer.innerHTML = `
                <h2>${sobreocard[0].titulo}</h2>
                <p>${sobreocard[0].descricao}</p>
            `;
        }

    } catch (error) {
        console.error("Erro ao carregar os dados:", error);
    }
});
