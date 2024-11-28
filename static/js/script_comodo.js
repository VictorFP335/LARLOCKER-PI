// Função para carregar o JSON e popular a tabela
async function loadItems(idComodo) {
    try {
        const response = await fetch(`/get_produtos/${idComodo}`);
        if (!response.ok) throw new Error("Erro ao carregar os produtos");

        const produtos = await response.json();
        const tableBody = document.querySelector('#itemTable tbody');
        tableBody.innerHTML = '';  // Limpa a tabela antes de popular os itens
        produtos.forEach(produto => {
            addRow(produto.produto, produto.qtd_produto, produto.tipo, produto.validade);
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
    document.getElementById('validade').value = '';
}

// Função para cancelar a adição de um novo item
function cancelAddItem() {
    document.getElementById('modal').style.display = 'none'; // Esconde o modal
}

async function submitNewItem() {
    const nomeProduto = document.getElementById('nomeProduto').value;
    const quantidadeProduto = parseInt(document.getElementById('quantidadeProduto').value) || 0;
    const alimento = document.getElementById('alimento').checked;
    const objeto = document.getElementById('objeto').checked;
    const validade = document.getElementById('validade').value;

    const urlParams = new URLSearchParams(window.location.search);
    const idComodo = urlParams.get('comodo'); // Obtém o id_comodo da URL

    const dataValidade = new Date(validade)
    const dataValidadeFormatada = dataValidade.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

    const dataAtual = new Date();
    const dataAtualFormatada = dataAtual.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
    // Valida o nome do produto (não permite vazio)
    if (!nomeProduto) {
        alert("O nome do produto não pode estar vazio!");
        return;
    }

    if (dataValidade <= dataAtual) {
        alert("Digite uma data válida!")
        return;
    }

    // Valida que apenas uma opção entre perecível e não perecível esteja marcada
    if (!alimento && !objeto) {
        alert("Por favor, selecione o tipo de produto (Alimento ou Objeto).");
        return;
    } else if (alimento && objeto) {
        alert("Por favor, selecione apenas uma opção: Alimento ou Objeto.");
        return;
    }

    // Se for perecível, valida que a data de validade foi preenchida
    if (alimento && !validade) {
        alert("Por favor, informe a validade do alimento.");
        return;
    }

    const tipo = alimento ? "Alimento" : "Objeto";

    if (nomeProduto && idComodo) {
        try {
            const response = await fetch('/add_produtos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nomeProduto: nomeProduto,
                    qtdProduto: quantidadeProduto,
                    idComodo: idComodo,
                    tipo: tipo,
                    validade: validade
                })
            });

            const result = await response.json();
            if (response.ok) {
                addRow(nomeProduto, quantidadeProduto, tipo, validade);
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
function addRow(nome, quantidade, tipo, validade) {
    const urlParams = new URLSearchParams(window.location.search);
    const idComodo = urlParams.get('comodo'); // Obtém o id_comodo da URL

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

    // Coluna de Tipo (sem alterações)
    const tipoCell = document.createElement('td');
    tipoCell.textContent = tipo;
    tipoCell.className = 'tipo-col';

    // Coluna de Validade com formatação
    const validadeCell = document.createElement('td');
    const dataValidade = validade ? new Date(validade) : null;
    validadeCell.textContent = dataValidade ? dataValidade.toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
    validadeCell.className = 'validade-col';

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
            const response = await fetch('/delete_produto', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nomeProduto: nome, idComodo: idComodo })
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
    row.appendChild(tipoCell);
    row.appendChild(validadeCell);


    tableBody.appendChild(row);
}

// Função para formatar a data
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('pt-BR', options);
}

// Função para atualizar a quantidade do item e sincronizar com o banco de dados
async function updateQuantity(row, change) {
    const quantityText = row.querySelector('.quantity-text');
    let currentQuantity = parseInt(quantityText.textContent);

    const urlParams = new URLSearchParams(window.location.search);
    const idComodo = urlParams.get('comodo'); // Obtém o id_comodo da URL

    // Atualiza a quantidade e evita valores negativos
    currentQuantity = Math.max(0, currentQuantity + change);
    quantityText.textContent = currentQuantity;

    const nomeProduto = row.querySelector('td').textContent;  // Assume que o nome do produto está na primeira coluna

    if (currentQuantity === 0) {
        // Se a quantidade for zero, exclui o item do banco de dados
        try {
            const response = await fetch('/m', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nomeProduto: nomeProduto, idComodo: idComodo })
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
                body: JSON.stringify({ nomeProduto: nomeProduto, qtdProduto: currentQuantity, idComodo: idComodo })
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
/* Modo Claro/Escuro */
const chk = document.getElementById('chk')

chk.addEventListener('change', () => {
    document.body.classList.toggle('white');
    const imagem = document.getElementById('imagem');
    imagem.setAttribute('src', "static/img/larlocker_branco.png")
})

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
