const searchRoutes = {
    "início": "/",
    "cômodos": "/dashboard",
    "lista de compras": "/lista",
    "ajuda": "/help",
    "conta": "/account"
};

// Função para exibir as buscas recentes
function displayRecentSearches() {
    const recentContainer = document.querySelector(".recent-section");
    const recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];

    // Limpa as buscas recentes anteriores
    recentContainer.innerHTML = "<h2>Recentes</h2>";

    // Exibe cada busca recente como um link clicável
    recentSearches.forEach(term => {
        const recentItem = document.createElement("div");
        recentItem.className = "recent-item";
        recentItem.innerHTML = `<img src="static/img/recente.png" width="20px"> <span>${term}</span>`;

        // Adiciona um evento de clique para realizar a pesquisa
        recentItem.addEventListener("click", () => {
            // Preenche o campo de pesquisa com o termo
            document.getElementById("searchInput").value = term;

            // Realiza a pesquisa automaticamente após preencher o campo
            performSearch(term);
        });

        recentContainer.appendChild(recentItem);
    });
}

// Função para realizar a pesquisa e redirecionar
function performSearch(searchTerm) {
    searchTerm = searchTerm.trim().toLowerCase(); // Garantir que o termo esteja formatado corretamente

    // Salva a busca recente antes de realizar qualquer ação
    saveRecentSearch(searchTerm);

    // Verifica se o termo de busca existe em searchRoutes
    if (searchRoutes[searchTerm]) {
        // Redireciona para a URL correspondente
        window.location.href = searchRoutes[searchTerm];
    } else {
        // Chama a função de busca dinâmica
        searchDynamicResults(searchTerm);
    }
}

function searchDynamicResults(searchTerm) {
    fetch('/search_api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm: searchTerm })
    })
        .then(response => response.json())
        .then(data => {
            const resultsDiv = document.getElementById("searchResults");

            // Limpa os resultados antigos
            resultsDiv.innerHTML = "";

            if (data.status === "success" && data.results.length > 0) {
                // Filtra os resultados para exibir apenas aqueles que começam com o termo
                const filteredResults = data.results.filter(result => 
                    result.name.toLowerCase().startsWith(searchTerm.toLowerCase())
                );

                if (filteredResults.length > 0) {
                    filteredResults.forEach(result => {
                        const resultElement = document.createElement("div");
                        resultElement.innerHTML = `<a href="${result.url}">${result.type}: ${result.name}</a>`;
                        resultsDiv.appendChild(resultElement);
                    });

                    // Esconde o popup de "nenhum resultado"
                    document.getElementById("alertPopup").style.display = "none";
                } else {
                    // Exibe o popup caso não haja resultados
                    resultsDiv.textContent = "Nenhum resultado encontrado.";
                    showPopup();
                }
            } else {
                // Exibe o popup caso não haja resultados
                resultsDiv.textContent = "Nenhum resultado encontrado.";
                showPopup();
            }
        })
        .catch(err => {
            console.error("Erro ao buscar:", err);
        });
}


function showPopup() {
    document.getElementById("alertPopup").style.display = "flex";
}

function closePopup() {
    document.getElementById("alertPopup").style.display = "none";
}

// Função para salvar a busca recente no localStorage
function saveRecentSearch(term) {
    let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];

    // Adiciona o termo de busca ao início da lista, removendo duplicatas
    if (!recentSearches.includes(term)) {
        recentSearches.unshift(term);
    }

    // Limita o número de buscas recentes a 5
    if (recentSearches.length > 5) {
        recentSearches.pop();
    }

    // Salva o array atualizado de buscas recentes no localStorage
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));

    // Atualiza a exibição das buscas recentes
    displayRecentSearches();
}

// Função para limpar as buscas recentes ao fazer logout
function clearRecentSearchesOnLogout() {
    localStorage.removeItem("recentSearches");
    displayRecentSearches(); // Atualiza a interface para refletir a remoção
}

// Adiciona o ouvinte de evento para a tecla Enter no campo de pesquisa
document.getElementById("searchInput").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        const searchTerm = event.target.value.trim();

        if (searchTerm.length > 0) {
            performSearch(searchTerm);
        }
    }
});

// Inicializa as buscas recentes assim que a página for carregada
document.addEventListener("DOMContentLoaded", function () {
    displayRecentSearches();
});

// Função para realizar a pesquisa ao clicar no botão de pesquisa
document.getElementById("searchButton").addEventListener("click", function () {
    const query = document.getElementById("searchInput").value.trim();

    if (query.length > 0) {
        performSearch(query);
    } else {
        alert("Por favor, insira um termo de busca.");
    }
});

// Limpa buscas recentes ao clicar no botão de logout
document.getElementById("logoutButton").addEventListener("click", function () {
    clearRecentSearchesOnLogout();
});
