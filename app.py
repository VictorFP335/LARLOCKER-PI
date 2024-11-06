from flask import Flask, render_template, request, redirect, url_for, session, flash
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

@app.route('/comodo', methods=['GET', 'POST'])
def comodo():
    contatos = [
        {'nome_prod': 'Produto A', 'qtd_prod': '10'},
        {'nome_prod': 'Produto B', 'qtd_prod': '5'}
    ]
    return render_template('comodo.html', contatos=contatos)

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
            return redirect(url_for('dashboard'))
        else:
            flash('Usuário ou senha incorretos', 'error')
            return render_template('login.html')  # Retorne o template com o flash

    return render_template('login.html')



@app.route('/dashboard')
def dashboard():
    if 'username' in session:
        flash(f'Bem-vindo, {session["fullname"].split()[0]}!', 'boas vindas')
        return render_template('comodo.html', img_path=url_for('static', filename='img/img_comodo'))
    else:
        return redirect(url_for('home'))

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('home'))

if __name__ == "__main__":
    app.run(debug=True)
