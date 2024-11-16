// Função para carregar o JSON e popular a tabela
async function loadItems(idComodo) {
    try {
        const response = await fetch(`/get_produtos/${idComodo}`);
        if (!response.ok) throw new Error("Erro ao carregar os produtos");

        const produtos = await response.json();
        const tableBody = document.querySelector('#itemTable tbody');
        tableBody.innerHTML = '';  // Limpa a tabela antes de popular os itens
        produtos.forEach(produto => {
            addRow(produto.produto, produto.qtd_produto);
        });

    } catch (error) {
        console.error("Erro ao carregar os produtos:", error);
    }
}


// Função para mostrar o formulário de adição de itens
function showAddItemForm() {
    document.getElementById('modal').style.display = 'block'; // Exibe o modal
    document.getElementById('nomeProduto').value = ''; // Limpa o campo de nome
    document.getElementById('quantidadeProduto').value = ''; // Limpa o campo de quantidade
}

// Função para cancelar a adição de um novo item
function cancelAddItem() {
    document.getElementById('modal').style.display = 'none'; // Esconde o modal
}

async function submitNewItem() {
    const nomeProduto = document.getElementById('nomeProduto').value;
    const quantidadeProduto = parseInt(document.getElementById('quantidadeProduto').value) || 0;

    const urlParams = new URLSearchParams(window.location.search);
    const idComodo = urlParams.get('comodo');  // Obtém o id_comodo da URL

    if (nomeProduto && idComodo) {
        try {
            const response = await fetch('/add_produtos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nomeProduto: nomeProduto, qtdProduto: quantidadeProduto, idComodo: idComodo })
            });

            const result = await response.json();
            if (response.ok) {
                addRow(nomeProduto, quantidadeProduto);
                cancelAddItem(); // Esconde o modal após a adição
                console.log(result.message); // Para depuração
            } else {
                console.error(result.message);
                alert(result.message); // Exibe a mensagem de erro
            }
        } catch (error) {
            console.error("Erro ao adicionar o produto:", error);
        }
    } else {
        alert("Por favor, insira o nome do produto.");
    }
}


// Função para adicionar uma linha na tabela
function addRow(nome, quantidade) {
    const tableBody = document.querySelector('#itemTable tbody');
    const row = document.createElement('tr');

    // Coluna de Produto (nome)
    const nomeCell = document.createElement('td');
    nomeCell.textContent = nome;
    row.appendChild(nomeCell);

    // Coluna de Quantidade com imagens de adição e subtração
    const quantidadeCell = document.createElement('td');
    quantidadeCell.className = 'quantidade-col';
    quantidadeCell.style.display = 'flex';
    quantidadeCell.style.alignItems = 'center';
    quantidadeCell.style.justifyContent = 'space-between';

    const quantityContainer = document.createElement('div');
    quantityContainer.style.display = 'flex';
    quantityContainer.style.alignItems = 'center';

    const minusButton = document.createElement('img');
    minusButton.src = "/static/img/img_comodo/menos.png";
    minusButton.style.width = '20px';
    minusButton.style.height = '20px';
    minusButton.style.cursor = 'pointer';
    minusButton.onclick = () => updateQuantity(row, -1); // Passa a linha como referência

    const quantityText = document.createElement('span');
    quantityText.textContent = quantidade;
    quantityText.className = 'quantity-text';
    quantityText.style.margin = '0 10px';

    const plusButton = document.createElement('img');
    plusButton.src = "/static/img/img_comodo/mais.png";
    plusButton.style.width = '20px';
    plusButton.style.height = '20px';
    plusButton.style.cursor = 'pointer';
    plusButton.onclick = () => updateQuantity(row, 1); // Passa a linha como referência

    quantityContainer.appendChild(minusButton);
    quantityContainer.appendChild(quantityText);
    quantityContainer.appendChild(plusButton);

    const deleteButton = document.createElement('img');
    deleteButton.src = "/static/img/img_comodo/lixo.png";
    deleteButton.style.width = '20px';
    deleteButton.style.height = '20px';
    deleteButton.style.cursor = 'pointer';
    deleteButton.style.marginLeft = '10px';
    deleteButton.onclick = async () => {
        try {
            const response = await fetch('/delete_produto', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nomeProduto: nome })
            });

            const result = await response.json();
            if (response.ok) {
                row.remove(); // Remove a linha da tabela
                console.log(result.message); // Para depuração
            } else {
                console.error(result.message);
                alert(result.message); // Exibe a mensagem de erro
            }
        } catch (error) {
            console.error("Erro ao excluir o produto:", error);
        }
    };

    quantidadeCell.appendChild(quantityContainer);
    quantidadeCell.appendChild(deleteButton);
    row.appendChild(quantidadeCell);

    tableBody.appendChild(row);
}

// Função para atualizar a quantidade do item e sincronizar com o banco de dados
// Função para atualizar a quantidade do item
async function updateQuantity(row, change) {
    const quantityText = row.querySelector('.quantity-text');
    let currentQuantity = parseInt(quantityText.textContent);

    // Atualiza a quantidade e evita valores negativos
    currentQuantity = Math.max(0, currentQuantity + change);
    quantityText.textContent = currentQuantity;

    const nomeProduto = row.querySelector('td').textContent;  // Assume que o nome do produto está na primeira coluna

    if (currentQuantity === 0) {
        // Se a quantidade for zero, exclui o item do banco de dados
        try {
            const response = await fetch('/delete_produto', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nomeProduto: nomeProduto })
            });

            const result = await response.json();
            if (response.ok) {
                row.remove(); // Remove a linha da tabela
                console.log(result.message); // Para depuração
            } else {
                console.error(result.message);
                alert(result.message); // Exibe a mensagem de erro
            }
        } catch (error) {
            console.error("Erro ao excluir o produto:", error);
        }
    } else {
        // Se a quantidade é maior que zero, atualiza o banco de dados com a nova quantidade
        try {
            const response = await fetch('/update_produtos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nomeProduto: nomeProduto, qtdProduto: currentQuantity })
            });

            const result = await response.json();
            if (!response.ok) {
                console.error(result.message);
                alert(result.message); // Exibe a mensagem de erro
            }
        } catch (error) {
            console.error("Erro ao atualizar a quantidade do produto:", error);
        }
    }
}


// Fecha o modal quando o usuário clicar fora dele
window.onclick = function (event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const idComodo = urlParams.get('comodo');  // Obtém o id_comodo da URL
    if (idComodo) {
        loadItems(idComodo);
    }
};
