// Função para carregar o JSON e popular a tabela
async function loadItems(idLista) {
    try {
        const response = await fetch(`/get_itens/${idLista}`);
        if (!response.ok) throw new Error("Erro ao carregar os itens");

        const itens = await response.json();
        const tableBody = document.querySelector('#itemTable tbody');
        tableBody.innerHTML = '';  // Limpa a tabela antes de popular os itens
        itens.forEach(item => {
            addRow(item.nome, item.qtd_item);
        });

    } catch (error) {
        console.error("Erro ao carregar os itens:", error);
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
    const idLista = urlParams.get('lista'); // Obtém o id_lista da URL

    // Valida o nome do produto (não permite vazio)
    if (!nomeProduto) {
        alert("O nome do produto não pode estar vazio!");
        return;
    }

    if (quantidadeProduto < 0) {
        alert("Defina um valor válido para a quantidade de produtos!")
    }

    if (nomeProduto && idLista && quantidadeProduto) {
        try {
            const response = await fetch('/add_item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nomeProduto: nomeProduto,
                    qtdProduto: quantidadeProduto,
                    idLista: idLista
                })
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
            console.error("Erro ao adicionar o item:", error);
        }
    } else {
        alert("Por favor, insira o nome do item.");
    }
}

// Função para adicionar uma linha na tabela
function addRow(nome, quantidade) {
    const urlParams = new URLSearchParams(window.location.search);
    const idLista = urlParams.get('lista'); // Obtém o id_comodo da URL

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

    // Criar os botões de quantidade
    const quantityContainer = document.createElement('div');
    quantityContainer.style.display = 'flex';
    quantityContainer.style.alignItems = 'center';

    const minusButton = document.createElement('img');
    minusButton.src = "/static/img/menos.png";
    minusButton.style.width = '20px';
    minusButton.style.height = '20px';
    minusButton.style.cursor = 'pointer';
    minusButton.onclick = () => updateQuantity(row, -1); // Passa a linha como referência

    const quantityText = document.createElement('span');
    quantityText.textContent = quantidade;
    quantityText.className = 'quantity-text';
    quantityText.style.margin = '0 10px';

    const plusButton = document.createElement('img');
    plusButton.src = "/static/img/mais.png";
    plusButton.style.width = '20px';
    plusButton.style.height = '20px';
    plusButton.style.cursor = 'pointer';
    plusButton.onclick = () => updateQuantity(row, 1); // Passa a linha como referência

    quantityContainer.appendChild(minusButton);
    quantityContainer.appendChild(quantityText);
    quantityContainer.appendChild(plusButton);

    const deleteButton = document.createElement('img');
    deleteButton.src = "/static/img/lixo.png";
    deleteButton.style.width = '20px';
    deleteButton.style.height = '20px';
    deleteButton.style.cursor = 'pointer';
    deleteButton.style.marginLeft = '10px';
    deleteButton.onclick = async () => {
        try {
            const response = await fetch('/delete_item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nomeProduto: nome, idLista: idLista })
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
            console.error("Erro ao excluir o item:", error);
        }
    };

    quantidadeCell.appendChild(quantityContainer);
    quantidadeCell.appendChild(deleteButton);
    row.appendChild(quantidadeCell);
    tableBody.appendChild(row);
}


// Função para atualizar a quantidade do item
async function updateQuantity(row, change) {
    const quantityText = row.querySelector('.quantity-text');
    let currentQuantity = parseInt(quantityText.textContent);

    const urlParams = new URLSearchParams(window.location.search);
    const idLista = urlParams.get('lista'); // Obtém o id_comodo da URL

    // Atualiza a quantidade e evita valores negativos
    currentQuantity = Math.max(0, currentQuantity + change);
    quantityText.textContent = currentQuantity;

    const nomeProduto = row.querySelector('td').textContent;  // Assume que o nome do produto está na primeira coluna

    if (currentQuantity === 0) {
        try {
            const response = await fetch('/delete_item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nomeProduto: nomeProduto, idLista: idLista })
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
            console.error("Erro ao excluir o item:", error);
        }
    } else {
        // Se a quantidade é maior que zero, atualiza o banco de dados com a nova quantidade
        try {
            const response = await fetch('/update_itens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nomeProduto: nomeProduto, qtdProduto: currentQuantity, idLista: idLista })
            });

            const result = await response.json();
            if (!response.ok) {
                console.error(result.message);
                alert(result.message); // Exibe a mensagem de erro
            }
        } catch (error) {
            console.error("Erro ao atualizar a quantidade do item:", error);
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

const chk = document.getElementById('chk');
const imagem = document.getElementById('imagem');

chk.addEventListener('change', () => {
    document.body.classList.toggle('white'); // Alterna o modo claro/escuro

    // Alterna a imagem da logo com base no modo
    if (document.body.classList.contains('white')) {
        imagem.setAttribute('src', 'static/img/larlocker_branco.png'); // Logo modo claro
    } else {
        imagem.setAttribute('src', 'static/img/larlocker.png'); // Logo modo escuro
    }
});

window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const idLista = urlParams.get('lista');  // Obtém o id_comodo da URL
    if (idLista) {
        loadItems(idLista);
    }
};
