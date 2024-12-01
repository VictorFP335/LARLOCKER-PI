from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from flask_mysqldb import MySQL
from werkzeug.security import generate_password_hash, check_password_hash
from config import DB_CONFIG

app = Flask(__name__)

app.secret_key = 'Yyl1310'

# Configuração do banco de dados MySQL
app.config['MYSQL_HOST'] = DB_CONFIG['MYSQL_HOST']
app.config['MYSQL_USER'] = DB_CONFIG['MYSQL_USER']
app.config['MYSQL_PASSWORD'] = DB_CONFIG['MYSQL_PASSWORD']
app.config['MYSQL_DATABASE'] = DB_CONFIG['MYSQL_DATABASE']


mysql = MySQL(app)

with app.app_context():
    try:
        cur = mysql.connection.cursor()
        cur.execute("USE pi;")  # Força o uso do banco de dados 'pi'
        cur.execute("SELECT DATABASE();")
        db_name = cur.fetchone()
        print("Conexão bem-sucedida com o banco de dados:", db_name[0])
        cur.close()
    except Exception as e:
        print("Erro na conexão:", e)


@app.route('/cadastro', methods=['GET', 'POST'])
def cadastro():
    if request.method == 'POST':
        fullname = request.form.get('fullname')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        # Verifica se algum campo está vazio
        if not fullname or not email or not password or not confirm_password:
            return render_template('cadastro.html', error='Por favor, preencha todos os campos.')

        if password != confirm_password:
            return render_template('cadastro.html', error='As senhas não coincidem. Tente novamente.')

        # Gerar o hash da senha
        password_hash = generate_password_hash(password)

        try:
            # Inserir o usuário no banco de dados
            cursor = mysql.connection.cursor()
            cursor.execute("USE pi;")  # Força o uso do banco de dados 'pi'
            cursor.execute("SELECT DATABASE();")
            cursor.execute("INSERT INTO cliente (nome, email, senha) VALUES (%s, %s, %s)", (fullname, email, password_hash))
            mysql.connection.commit()
            cursor.close()
            return redirect(url_for('home'))
        except Exception as e:
            print("Erro ao inserir no banco de dados:", e)
            return render_template('cadastro.html', error='Erro ao cadastrar usuário. Tente novamente.')

    return render_template('cadastro.html')

@app.route('/recuperar-senha')
def recuperar_senha():
    return render_template('recuperar-senha.html')

@app.route('/')
def home():
    if 'username' not in session: 
        return render_template('inicio.html')
    
    else:
        return redirect(url_for('dashboard'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'username' not in session:
        if request.method == 'POST':
            username = request.form.get('email')
            password = request.form.get('password')

            cursor = mysql.connection.cursor()
            cursor.execute("USE pi;") 
            cursor.execute("SELECT * FROM cliente WHERE email=%s", (username,))
            user = cursor.fetchone()
            cursor.close()

            if user and check_password_hash(user[2], password):  
                session['fullname'] = user[1]
                session['username'] = username
                session['id'] = user[0]
                return redirect(url_for('dashboard'))
            else:
                flash('Usuário ou senha incorretos', 'error')
                return render_template('login.html')  # Retorne o template com o flash

        return render_template('login.html')
    return redirect(url_for('home'))

@app.route('/comodos')
def comodos():
    if 'username' in session:
        return render_template('comodo.html', img_path=url_for('static', filename='img/img_comodo'))
    else:
        return redirect(url_for('home'))
    
@app.route('/add_comodo', methods=['POST'])
def add_comodo():
    if 'username' in session:  # Verifica se o usuário está logado
        data = request.get_json()  # Obtém os dados JSON do pedido
        nome_comodo = data.get('nomeComodo')

        if nome_comodo:
            try:
                cursor = mysql.connection.cursor()
                cursor.execute("USE pi;")  # Seleciona o banco de dados
                cursor.execute("INSERT INTO comodo (nome_comodo, id_cliente) VALUES (%s, %s)", (nome_comodo,session['id'],))
                mysql.connection.commit()
                cursor.close()
                return jsonify({'status': 'success', 'message': 'Cômodo adicionado com sucesso!'}), 201
            except Exception as e:
                print("Erro ao inserir cômodo no banco de dados:", e)
                return jsonify({'status': 'error', 'message': 'Erro ao adicionar cômodo.'}), 500
        else:
            return jsonify({'status': 'error', 'message': 'Nome do cômodo não pode ser vazio.'}), 400
    else:
        return jsonify({'status': 'error', 'message': 'Usuário não autenticado.'}), 403
    
@app.route('/get_ultimo_comodo', methods=['GET'])
def get_ultimo_comodo():
    if 'username' in session:
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("USE pi;")  # Seleciona o banco de dados
            cursor.execute(f"SELECT id_comodo FROM comodo WHERE id_cliente = {session['id']} ORDER BY id_comodo DESC LIMIT 1;")
            ultimo_comodo = cursor.fetchone()  # Retorna uma tupla ou None
            cursor.close()

            if ultimo_comodo:  # Verifica se foi encontrado algum resultado
                return jsonify({'ultimo_id_comodo': ultimo_comodo[0]}), 200  # Retorna um dicionário simples
            else:
                return jsonify({'ultimo_id_comodo': 0}), 200  # Retorna 0 se não houver cômodos
        except Exception as e:
            print("Erro ao carregar o último cômodo do banco de dados:", e)
            return jsonify({'status': 'error', 'message': 'Erro ao carregar cômodo.'}), 500


        
@app.route('/get_comodos', methods=['GET'])
def get_comodos():
    if 'username' in session:  # Verifica se o usuário está logado
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("USE pi;")  # Seleciona o banco de dados
            cursor.execute(f"SELECT nome_comodo, id_comodo FROM comodo WHERE id_cliente = {session['id']}")  # Busca todos os cômodos
            comodos = cursor.fetchall()
            cursor.close()
            # Converte os resultados em uma lista de dicionários
            comodo_list = [{'comodo': comodo[0], 'id_comodo':comodo[1]} for comodo in comodos]
            return jsonify(comodo_list), 200
        except Exception as e:
            print("Erro ao carregar os cômodos do banco de dados:", e)
            return jsonify({'status': 'error', 'message': 'Erro ao carregar cômodos.'}), 500
    else:
        return jsonify({'status': 'error', 'message': 'Usuário não autenticado.'}), 403

@app.route('/delete_comodo', methods=['POST'])
def delete_comodo():
    if 'username' in session:  # Verifica se o usuário está autenticado
        data = request.get_json()  # Obtém os dados enviados pelo JSON
        id_comodo = data.get('idComodo')

        if id_comodo:
            try:
                cursor = mysql.connection.cursor()
                cursor.execute("USE pi;")
                # Deleta o cômodo com base no nome
                cursor.execute("DELETE FROM comodo WHERE id_comodo = %s", (id_comodo,))
                mysql.connection.commit()
                cursor.close()
                return jsonify({'status': 'success', 'message': 'Cômodo excluído com sucesso.'}), 200
            except Exception as e:
                print("Erro ao excluir o cômodo do banco de dados:", e)
                return jsonify({'status': 'error', 'message': 'Erro ao excluir o cômodo, verifique se não há produtos dentro do cômodo antes de excluí-lo.'}), 500
        else:
            return jsonify({'status': 'error', 'message': 'Nome do cômodo inválido.'}), 400
    else:
        return jsonify({'status': 'error', 'message': 'Usuário não autenticado.'}), 403
    
@app.route('/update_comodo', methods=['POST'])
def update_comodo():
    if 'username' in session:
        data = request.get_json()
        id_comodo = data.get('idComodo')
        nome_comodo = data.get('nomeComodo')
        if id_comodo is not None and nome_comodo is not None:
            try:
                cursor = mysql.connection.cursor()
                cursor.execute("USE pi;")
                # Atualiza a quantidade de forma segura usando placeholders para os parâmetros
                cursor.execute("UPDATE comodo SET nome_comodo = %s WHERE id_comodo = %s", (nome_comodo, id_comodo))
                mysql.connection.commit()
                cursor.close()
                return jsonify({'status': 'success', 'message': 'Dados atualizados com sucesso.'}), 200
            except Exception as e:
                print("Erro ao editar o cômodo no banco de dados:", e)
                return jsonify({'status': 'error', 'message': 'Erro ao editar o cômodo.'}), 500
        else:
            return jsonify({'status': 'error', 'message': 'id_como ou nome_comodo faltando'}), 500
    else:
        return jsonify({'status': 'error', 'message': 'Usuário não autenticado.'}), 403
    
@app.route('/alert', methods=['GET'])
def alert():
    if 'username' in session:
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("USE pi;")  # Seleciona o banco de dados
            cursor.execute(f"SELECT c.nome_comodo, p.nome_produto, DATE(p.validade) AS validade, DATE(NOW()) AS data_atual FROM comodo c JOIN produto p ON c.id_comodo = p.id_comodo WHERE c.id_cliente = {session['id']} and DATEDIFF(NOW(), p.validade) <= 7")  # Busca todos os cômodos
            produtos = cursor.fetchall()
            cursor.close()
            # Converte os resultados em uma lista de dicionários
            produto_list = [{'comodo': produto[0], 'nome': produto[1], 'validade': produto[2], 'data_atual':produto[3]} for produto in produtos]
            return jsonify(produto_list), 200
        except Exception as e:
            print("Erro ao carregar os produtos que estão próximos da validade no banco de dados:", e)
            return jsonify({'status': 'error', 'message': 'Erro ao carregar produtos próximos ao vencimento.'}), 500
    else:
        return jsonify({'status': 'error', 'message': 'Usuário não autenticado.'}), 403

@app.route('/listas')
def listas():
    if 'username' in session:
        return render_template('lista.html')
    else:
        return redirect(url_for('home'))

@app.route('/list')
def list():
    if 'username' in session:
        return render_template('inicio_lista.html')
    else:
        return redirect(url_for('home'))

@app.route('/get_lista', methods=['GET'])
def get_lista():
    if 'username' in session:  # Verifica se o usuário está logado
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("USE pi;")  # Seleciona o banco de dados
            cursor.execute(f"SELECT nome_lista, id_lista FROM lista_compra WHERE id_cliente = {session['id']}")  # Busca todos os cômodos
            listas = cursor.fetchall()
            cursor.close()
            # Converte os resultados em uma lista de dicionários
            lists = [{'lista': lista[0], 'id_lista': lista[1]} for lista in listas]
            return jsonify(lists), 200
        except Exception as e:
            print("Erro ao carregar as listas do banco de dados:", e)
            return jsonify({'status': 'error', 'message': 'Erro ao carregar listas.'}), 500
    else:
        return jsonify({'status': 'error', 'message': 'Usuário não autenticado.'}), 403

@app.route('/add_lista', methods=['POST'])
def add_lista():
    if 'username' in session:  # Verifica se o usuário está logado
        data = request.get_json()  # Obtém os dados JSON do pedido
        nome_lista = data.get('nomeLista')

        if nome_lista:
            try:
                cursor = mysql.connection.cursor()
                cursor.execute("USE pi;")  # Seleciona o banco de dados
                cursor.execute("INSERT INTO lista_compra (nome_lista, id_cliente) VALUES (%s, %s)", (nome_lista,session['id'],))
                mysql.connection.commit()
                cursor.close()
                return jsonify({'status': 'success', 'message': 'Lista adicionada com sucesso!'}), 201
            except Exception as e:
                print("Erro ao inserir a lista no banco de dados:", e)
                return jsonify({'status': 'error', 'message': 'Erro ao adicionar a lista.'}), 500
        else:
            return jsonify({'status': 'error', 'message': 'Nome da lista não pode estar vazio.'}), 400
    else:
        return jsonify({'status': 'error', 'message': 'Usuário não autenticado.'}), 403
    
@app.route('/update_lista', methods=['POST'])
def update_lista():
    if 'username' in session:
        data = request.get_json()
        id_lista = data.get('idLista')
        nome_lista = data.get('nomeLista')
        if id_lista is not None and nome_lista is not None:
            try:
                cursor = mysql.connection.cursor()
                cursor.execute("USE pi;")
                # Atualiza a quantidade de forma segura usando placeholders para os parâmetros
                cursor.execute("UPDATE lista_compra SET nome_lista = %s WHERE id_lista = %s", (nome_lista, id_lista))
                mysql.connection.commit()
                cursor.close()
                return jsonify({'status': 'success', 'message': 'Dados atualizados com sucesso.'}), 200
            except Exception as e:
                print("Erro ao editar a lista no banco de dados:", e)
                return jsonify({'status': 'error', 'message': 'Erro ao editar a lista.'}), 500
        else:
            return jsonify({'status': 'error', 'message': 'id_lista ou nome_lista faltando'}), 500
    else:
        return jsonify({'status': 'error', 'message': 'Usuário não autenticado.'}), 403
    
@app.route('/delete_lista', methods=['POST'])
def delete_lista():
    if 'username' in session:  # Verifica se o usuário está autenticado
        data = request.get_json()  # Obtém os dados enviados pelo JSON
        id_lista = data.get('idLista')

        if id_lista:
            try:
                cursor = mysql.connection.cursor()
                cursor.execute("USE pi;")
                cursor.execute("DELETE FROM lista_compra WHERE id_lista = %s", (id_lista,))
                mysql.connection.commit()
                cursor.close()
                return jsonify({'status': 'success', 'message': 'Lista excluído com sucesso.'}), 200
            except Exception as e:
                print("Erro ao excluir a lista do banco de dados:", e)
                return jsonify({'status': 'error', 'message': 'Erro ao excluir a lista, verifique se não há produtos dentro da lista antes de excluí-la.'}), 500
        else:
            return jsonify({'status': 'error', 'message': 'Nome da lista inválido.'}), 400
    else:
        return jsonify({'status': 'error', 'message': 'Usuário não autenticado.'}), 403
    
@app.route('/get_ultima_lista', methods=['GET'])
def get_ultimo_lista():
    if 'username' in session:
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("USE pi;")  # Seleciona o banco de dados
            cursor.execute(f"SELECT id_lista FROM lista_compra WHERE id_cliente = {session['id']} ORDER BY id_lista DESC LIMIT 1;")
            ultima_lista = cursor.fetchone()  # Retorna uma tupla ou None
            cursor.close()

            if ultima_lista:  # Verifica se foi encontrado algum resultado
                return jsonify({'ultimo_id_lista': ultima_lista[0]}), 200  # Retorna um dicionário simples
            else:
                return jsonify({'ultimo_id_lista': 0}), 200  # Retorna 0 se não houver cômodos
        except Exception as e:
            print("Erro ao carregar a última lista do banco de dados:", e)
            return jsonify({'status': 'error', 'message': 'Erro ao carregar a lista.'}), 500

@app.route('/get_itens/<int:id_lista>', methods=['GET']) 
def get_itens(id_lista):
    if 'username' in session:
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("USE pi;")  # Seleciona o banco de dados
            cursor.execute("SELECT nome_item, qtd_compra FROM item WHERE id_lista = %s", (id_lista,))
            items = cursor.fetchall()
            cursor.close()
            item_list = [{'nome': item[0], 'qtd_item': item[1]} for item in items]
            return jsonify(item_list), 200
        except Exception as e:
            print("Erro ao carregar os itens no banco de dados:", e)
            return jsonify({'status': 'error', 'message': 'Erro ao carregar os itens.'}), 500
    else:
        return jsonify({'status': 'error', 'message': 'Usuário não autenticado.'}), 403


@app.route('/add_item', methods=['POST'])
def add_item():
    if 'username' in session:
        data = request.get_json()  # Obtém os dados enviados pelo JSON
        nome_prod = data.get('nomeProduto')
        qtd_prod = data.get('qtdProduto')
        id_lista = data.get('idLista')  # Recebe o id_comodo do frontend

        if nome_prod and id_lista:
            try:
                cursor = mysql.connection.cursor()
                cursor.execute("USE pi;")
                cursor.execute("INSERT INTO item (qtd_compra, nome_item, id_lista) VALUES (%s, %s, %s)",( qtd_prod, nome_prod,id_lista))
                mysql.connection.commit()
                cursor.close()
                return jsonify({'status': 'success', 'message': 'Item adicionado com sucesso!'}), 201
            except Exception as e:
                print("Erro ao inserir o item no banco de dados:", e)
                return jsonify({'status': 'error', 'message': 'Erro ao adicionar o item.'}), 500
        else:
            return jsonify({'status': 'error', 'message': 'Dados inválidos.'}), 400
    else:
        return jsonify({'status': 'error', 'message': 'Usuário não autenticado.'}), 403

@app.route('/update_itens', methods=['POST'])
def update_itens():
    if 'username' in session:
        data = request.get_json()  # Obtém os dados enviados pelo JSON
        nome_prod = data.get('nomeProduto')
        qtd_prod = data.get('qtdProduto')
        id_lista = data.get('idLista')

        if nome_prod is not None and qtd_prod is not None:
            try:
                cursor = mysql.connection.cursor()
                cursor.execute("USE pi;")
                # Atualiza a quantidade de forma segura usando placeholders para os parâmetros
                cursor.execute("UPDATE item SET qtd_compra = %s WHERE nome_item = %s and id_lista = %s", (qtd_prod, nome_prod, id_lista))
                mysql.connection.commit()
                cursor.close()
                return jsonify({'status': 'success', 'message': 'Item atualizado com sucesso.'}), 200
            except Exception as e:
                print("Erro ao alterar o item no banco de dados:", e)
                return jsonify({'status': 'error', 'message': 'Erro ao alterar o item.'}), 500
        else:
            return jsonify({'status': 'error', 'message': 'Dados inválidos.'}), 400
    else:
        return jsonify({'status': 'error', 'message': 'Usuário não autenticado.'}), 403

@app.route('/delete_item', methods=['POST'])
def delete_item():
    if 'username' in session:
        data = request.get_json()  # Obtém os dados enviados pelo JSON
        nome_prod = data.get('nomeProduto')
        id_lista = data.get('idLista')
        if nome_prod:
            try:
                cursor = mysql.connection.cursor()
                cursor.execute("USE pi;")
                # Deleta o produto usando um placeholder para segurança
                cursor.execute("DELETE FROM item WHERE nome_item = %s AND id_lista = %s", (nome_prod, id_lista,))
                mysql.connection.commit()
                cursor.close()
                return jsonify({'status': 'success', 'message': 'Item excluído com sucesso.'}), 200
            except Exception as e:
                print("Erro ao excluir o item do banco de dados:", e)
                return jsonify({'status': 'error', 'message': 'Erro ao excluir o item.'}), 500
        else:
            return jsonify({'status': 'error', 'message': 'Nome do item inválido.'}), 400
    else:
        return jsonify({'status': 'error', 'message': 'Usuário não autenticado.'}), 403
    
@app.route('/add_produtos', methods=['POST'])
def add_produtos():
    if 'username' in session:
        data = request.get_json()  # Obtém os dados enviados pelo JSON
        nome_prod = data.get('nomeProduto')
        qtd_prod = data.get('qtdProduto')
        tipo = data.get('tipo')
        validade = data.get('validade') or None  # Substitui valores vazios por None
        id_comodo = data.get('idComodo')  # Recebe o id_comodo do frontend

        if nome_prod and id_comodo:
            try:
                cursor = mysql.connection.cursor()
                cursor.execute("USE pi;")
                
                # Verifica se o campo validade está vazio e ajusta a query
                if validade:
                    cursor.execute(
                        "INSERT INTO produto (nome_produto, qtd_produto, tipo, validade, id_comodo) VALUES (%s, %s, %s, %s, %s)",
                        (nome_prod, qtd_prod, tipo, validade, id_comodo)
                    )
                else:
                    cursor.execute(
                        "INSERT INTO produto (nome_produto, qtd_produto, tipo, validade, id_comodo) VALUES (%s, %s, %s, NULL, %s)",
                        (nome_prod, qtd_prod, tipo, id_comodo)
                    )

                mysql.connection.commit()
                cursor.close()
                return jsonify({'status': 'success', 'message': 'Produto adicionado com sucesso!'}), 201
            except Exception as e:
                print("Erro ao inserir o produto no banco de dados:", e)
                return jsonify({'status': 'error', 'message': 'Erro ao adicionar o produto.'}), 500
        else:
            return jsonify({'status': 'error', 'message': 'Dados inválidos.'}), 400
    else:
        return jsonify({'status': 'error', 'message': 'Usuário não autenticado.'}), 403


    
@app.route('/get_produtos/<int:id_comodo>', methods=['GET']) 
def get_produtos(id_comodo):
    if 'username' in session:
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("USE pi;")  # Seleciona o banco de dados
            cursor.execute("SELECT nome_produto, qtd_produto, tipo, DATE(validade) as data_validade FROM produto WHERE id_comodo = %s", (id_comodo,))
            produtos = cursor.fetchall()
            cursor.close()
            prod_list = [{'produto': produto[0], 'qtd_produto': produto[1], 'tipo': produto[2], 'validade': produto[3]} for produto in produtos]
            return jsonify(prod_list), 200
        except Exception as e:
            print("Erro ao carregar os produtos no banco de dados:", e)
            return jsonify({'status': 'error', 'message': 'Erro ao carregar os produtos.'}), 500
    else:
        return jsonify({'status': 'error', 'message': 'Usuário não autenticado.'}), 403
 

@app.route('/update_produtos', methods=['POST'])
def update_produtos():
    if 'username' in session:
        data = request.get_json()  # Obtém os dados enviados pelo JSON
        nome_prod = data.get('nomeProduto')
        qtd_prod = data.get('qtdProduto')
        id_comodo = data.get('idComodo')

        if nome_prod is not None and qtd_prod is not None:
            try:
                cursor = mysql.connection.cursor()
                cursor.execute("USE pi;")
                # Atualiza a quantidade de forma segura usando placeholders para os parâmetros
                cursor.execute("UPDATE produto SET qtd_produto = %s WHERE nome_produto = %s and id_comodo = %s", (qtd_prod, nome_prod, id_comodo))
                mysql.connection.commit()
                cursor.close()
                return jsonify({'status': 'success', 'message': 'Produto atualizado com sucesso.'}), 200
            except Exception as e:
                print("Erro ao alterar o produto no banco de dados:", e)
                return jsonify({'status': 'error', 'message': 'Erro ao alterar o produto.'}), 500
        else:
            return jsonify({'status': 'error', 'message': 'Dados inválidos.'}), 400
    else:
        return jsonify({'status': 'error', 'message': 'Usuário não autenticado.'}), 403

@app.route('/delete_produto', methods=['POST'])
def delete_produto():
    if 'username' in session:
        data = request.get_json()  # Obtém os dados enviados pelo JSON
        nome_prod = data.get('nomeProduto')
        id_comodo = data.get('idComodo')
        if nome_prod:
            try:
                cursor = mysql.connection.cursor()
                cursor.execute("USE pi;")
                # Deleta o produto usando um placeholder para segurança
                cursor.execute("DELETE FROM produto WHERE nome_produto = %s AND id_comodo = %s", (nome_prod, id_comodo,))
                mysql.connection.commit()
                cursor.close()
                return jsonify({'status': 'success', 'message': 'Produto excluído com sucesso.'}), 200
            except Exception as e:
                print("Erro ao excluir o produto do banco de dados:", e)
                return jsonify({'status': 'error', 'message': 'Erro ao excluir o produto.'}), 500
        else:
            return jsonify({'status': 'error', 'message': 'Nome do produto inválido.'}), 400
    else:
        return jsonify({'status': 'error', 'message': 'Usuário não autenticado.'}), 403

@app.route('/search')
def search():
    if 'username' in session:
        return render_template('pesquisa.html', img_path=url_for('static', filename='img/img_comodo'))
    else:
        return redirect(url_for('home'))

@app.route('/search_api', methods=['POST'])
def search_api():
    if 'username' in session:
        try:
            data = request.get_json()
            search_query = f"%{data.get('searchTerm', '').lower()}%"  # Obtém o termo de busca

            # Resultados de páginas estáticas
            static_pages = [
                # Cômodos
                {'name': 'Início', 'url': url_for('dashboard')},
                {'name': 'Inicio', 'url': url_for('dashboard')},
                {'name': 'Home', 'url': url_for('dashboard')},
                {'name': 'Cômodos', 'url': url_for('dashboard')},
                {'name': 'Comodos', 'url': url_for('dashboard')},
                {'name': 'Cômodo', 'url': url_for('dashboard')},
                {'name': 'Comodo', 'url': url_for('dashboard')},
                {'name': 'Adicionar comodo', 'url': url_for('dashboard')},
                {'name': 'Adicionar cômodo', 'url': url_for('dashboard')},
                {'name': 'Criar comodo', 'url': url_for('dashboard')},
                {'name': 'Criar cômodo', 'url': url_for('dashboard')},

                # Lista de compras
                {'name': 'Lista de Compras', 'url': url_for('list')},
                {'name': 'Lista de Compra', 'url': url_for('list')},
                {'name': 'Listas de Compras', 'url': url_for('list')},
                {'name': 'Listas de Compra', 'url': url_for('list')},
                {'name': 'Lista', 'url': url_for('list')},
                {'name': 'Compra', 'url': url_for('list')},
                {'name': 'Adicionar lista de compra', 'url': url_for('list')},
                {'name': 'Adicionar lista de compras', 'url': url_for('list')},   
                {'name': 'Adicionar listas de compra', 'url': url_for('list')},
                {'name': 'Adicionar listas de compras', 'url': url_for('list')}, 
                {'name': 'Criar lista de compra', 'url': url_for('list')},
                {'name': 'Criar lista de compras', 'url': url_for('list')},   
                {'name': 'Criar listas de compra', 'url': url_for('list')},
                {'name': 'Criar listas de compras', 'url': url_for('list')},

                # Conta
                {'name': 'Conta', 'url': url_for('account')},
                {'name': 'Account', 'url': url_for('account')},
                {'name': 'Nome', 'url': url_for('account')},
                {'name': 'Alterar nome', 'url': url_for('account')},
                {'name': 'Trocar nome', 'url': url_for('account')},
                {'name': 'Email', 'url': url_for('account')},
                {'name': 'Alterar email', 'url': url_for('account')},
                {'name': 'Trocar email', 'url': url_for('account')},

                # Ajuda
                {'name': 'Ajuda', 'url': url_for('help')},
                {'name': 'Help', 'url': url_for('help')},
                {'name': 'Formulário', 'url': url_for('help')},
                {'name': 'Formulario', 'url': url_for('help')},
                {'name': 'Pergunta', 'url': url_for('help')},
            ]
            
            # Filtrar páginas que correspondem à pesquisa
            filtered_pages = [
                {'name': page['name'], 'url': page['url'], 'type': 'página'}
                for page in static_pages if search_query.strip('%') in page['name'].lower()
            ]

            # Buscar dados dinâmicos do banco de dados
            cursor = mysql.connection.cursor()
            cursor.execute("USE pi;")
            cursor.execute(""" 
                SELECT id_comodo, nome_comodo, 'Cômodo' AS tipo 
                FROM comodo 
                WHERE LOWER(nome_comodo) LIKE %s AND id_cliente = %s
                UNION ALL
                SELECT p.id_comodo, p.nome_produto, 'Produto' AS tipo  -- Ajuste aqui para o nome correto da coluna
                FROM produto p
                JOIN comodo c ON p.id_comodo = c.id_comodo  -- Aqui também, ajuste conforme necessário
                WHERE LOWER(p.nome_produto) LIKE %s AND c.id_cliente = %s;
            """, (search_query, session['id'], search_query, session['id']))
            db_results = cursor.fetchall()
            cursor.close()

            # Processar resultados do banco de dados
            dynamic_results = [
                {'name': result[1], 'url': url_for('comodos', comodo=result[0]), 'type': result[2]} for result in db_results
            ]

            # Mesclar resultados dinâmicos e estáticos
            results = filtered_pages + dynamic_results

            # Armazenar resultados recentes na sessão
            if 'recentes' not in session:
                session['recentes'] = []

            # Limitar o número de resultados recentes para, por exemplo, 5
            max_recent_results = 5
            session['recentes'] = results[:max_recent_results] + session['recentes']

            # Manter apenas os últimos "max_recent_results" resultados
            session['recentes'] = session['recentes'][:max_recent_results]

            # Salvar a sessão
            session.modified = True

            return jsonify({'status': 'success', 'results': results, 'recentes': session['recentes']}), 200
        except Exception as e:
            print("Erro ao buscar dados:", e)
            return jsonify({'status': 'error', 'message': 'Erro ao buscar dados.'}), 500
    else:
        return jsonify({'status': 'error', 'message': 'Usuário não autenticado.'}), 403

@app.route('/account')
def account():
    if 'username' in session:
        return render_template('conta.html', img_path=url_for('static', filename='img/img_conta'))
    else:
        return redirect(url_for('home'))

@app.route('/get_account', methods=['GET'])
def get_account():
    if 'username' in session:
        try:
            cursor = mysql.connection.cursor()
            cursor.execute("USE pi;")  # Seleciona o banco de dados
            cursor.execute("SELECT * FROM cliente WHERE id_cliente = %s", (session['id'],))
            user = cursor.fetchone()  # Usa fetchone() para obter apenas uma linha
            cursor.close()
            
            if user:  # Verifica se a consulta retornou dados
                user_data = {'name': user[1], 'user': user[-1]}  # Ajuste os índices conforme sua tabela
                return jsonify(user_data), 200
            else:
                return jsonify({'status': 'error', 'message': 'Usuário não encontrado.'}), 404
        except Exception as e:
            print('Erro ao carregar o usuário: ', e)
            return jsonify({'status': 'error', 'message': 'Erro interno do servidor.'}), 500
    else:
        return jsonify({'status': 'error', 'message': 'Usuário não autenticado.'}), 403

    
@app.route('/update_account', methods=['POST'])
def update_account():
    if 'username' in session:
        data = request.get_json()
        nome = data.get('nome')
        username = data.get('user')

        try:
            cursor = mysql.connection.cursor()
            cursor.execute("USE pi;")
            cursor.execute(
                'UPDATE cliente SET nome = %s, email = %s WHERE id_cliente = %s',
                (nome, username, session['id'])
            )
            mysql.connection.commit()
            cursor.close()
            return jsonify({'status': 'success', 'message': 'Dados atualizados com sucesso.'}), 200
        except Exception as e:
            print("Erro ao atualizar os dados do usuário: ", e)
            return jsonify({'status': 'error', 'message': 'Erro ao atualizar os dados do usuário.'}), 500
    else:
        return jsonify({'status': 'error', 'message': 'Usuário não autenticado.'}), 403

    
@app.route('/help')
def help():
    if 'username' in session:
        return render_template('ajuda.html', img_path=url_for('static', filename='img/img_conta'))
    else:
        return redirect(url_for('home'))

@app.route('/dashboard')
def dashboard():
    if 'username' in session:
        flash(f'Bem-vindo, {session["fullname"].split()[0]}!', 'boas vindas')
        return render_template('inicio_comodo.html')
    else:
        return redirect(url_for('home'))
    
@app.route('/change')
def change():
    return render_template('trocar_senha.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('home'))

if __name__ == "__main__":
    app.run(debug=True)
