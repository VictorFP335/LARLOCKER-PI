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

@app.route('/test-flash')
def test_flash():
    flash("Mensagem de teste!", "error")
    return redirect(url_for('home'))

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
            cursor.execute("INSERT INTO users (nome_usuario, username, password_hash) VALUES (%s, %s, %s)", (fullname, email, password_hash))
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
    return render_template('login.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('email')
        password = request.form.get('password')

        cursor = mysql.connection.cursor()
        cursor.execute("USE pi;") 
        cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
        user = cursor.fetchone()
        cursor.close()

        if user and check_password_hash(user[-1], password):  
            session['fullname'] = user[1]
            session['username'] = username
            session['id'] = user[0]
            return redirect(url_for('dashboard'))
        else:
            flash('Usuário ou senha incorretos', 'error')
            return render_template('login.html')  # Retorne o template com o flash

    return render_template('login.html')

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
    

@app.route('/add_produtos', methods=['POST'])
def add_produtos():
    if 'username' in session:
        data = request.get_json()  # Obtém os dados enviados pelo JSON
        nome_prod = data.get('nomeProduto')
        qtd_prod = data.get('qtdProduto')
        id_comodo = data.get('idComodo')  # Recebe o id_comodo do frontend

        if nome_prod and id_comodo:
            try:
                cursor = mysql.connection.cursor()
                cursor.execute("USE pi;")
                cursor.execute("INSERT INTO produto (nome_prod, qtd_prod, comodo_FK) VALUES (%s, %s, %s)", (nome_prod, qtd_prod, id_comodo))
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
            cursor.execute("SELECT nome_prod, qtd_prod, comodo_FK FROM produto WHERE comodo_FK = %s", (id_comodo,))
            produtos = cursor.fetchall()
            cursor.close()
            prod_list = [{'produto': produto[0], 'qtd_produto': produto[1]} for produto in produtos]
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

        if nome_prod is not None and qtd_prod is not None:
            try:
                cursor = mysql.connection.cursor()
                cursor.execute("USE pi;")
                # Atualiza a quantidade de forma segura usando placeholders para os parâmetros
                cursor.execute("UPDATE produto SET qtd_prod = %s WHERE nome_prod = %s", (qtd_prod, nome_prod))
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

        if nome_prod:
            try:
                cursor = mysql.connection.cursor()
                cursor.execute("USE pi;")
                # Deleta o produto usando um placeholder para segurança
                cursor.execute("DELETE FROM produto WHERE nome_prod = %s", (nome_prod,))
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


@app.route('/dashboard')
def dashboard():
    if 'username' in session:
        flash(f'Bem-vindo, {session["fullname"].split()[0]}!', 'boas vindas')
        return render_template('inicio_comodo.html', img_path=url_for('static', filename='img/img_comodo'))
    else:
        return redirect(url_for('home'))

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('home'))

if __name__ == "__main__":
    app.run(debug=True)
