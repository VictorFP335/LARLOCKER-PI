from flask import Flask, render_template, request, redirect, url_for, session
from flask_mysqldb import MySQL
from werkzeug.security import generate_password_hash, check_password_hash
from config import DB_CONFIG

app = Flask(__name__)

# Configuração do banco de dados MySQL
app.config['MYSQL_HOST'] = DB_CONFIG['MYSQL_HOST']
app.config['MYSQL_USER'] = DB_CONFIG['MYSQL_USER']
app.config['MYSQL_PASSWORD'] = DB_CONFIG['MYSQL_PASSWORD']
app.config['MYSQL_DATABASE'] = DB_CONFIG['MYSQL_DATABASE']
app.secret_key = 'your_secret_key'  # Defina uma chave secreta para sessões

mysql = MySQL(app)

@app.route('/cadastro', methods=['GET', 'POST'])
def cadastro():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # Gerar o hash da senha
        password_hash = generate_password_hash(password)

        # Inserir o usuário no banco de dados
        cursor = mysql.connection.cursor()
        cursor.execute("INSERT INTO users (username, password_hash) VALUES (%s, %s)", (username, password_hash))
        mysql.connection.commit()
        cursor.close()

        return redirect(url_for('home'))

    return render_template('cadastro.html')

@app.route('/recuperar-senha')
def recuperar_senha():
    return render_template('recuperar-senha.html')

@app.route('/comodo', methods=['GET', 'POST'])
def comodo():
    # Lógica para GET ou resposta padrão
    contatos = [
        {'nome_prod': 'Produto A', 'qtd_prod': '10'},
        {'nome_prod': 'Produto B', 'qtd_prod': '5'}
    ]
    return render_template('comodo.html', contatos=contatos)

@app.route('/')
def home():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
    user = cursor.fetchone()
    cursor.close()

    if user and check_password_hash(user[2], password):  # user[2] deve ser o campo de senha
        session['username'] = username
        return redirect(url_for('dashboard'))
    else:
        return 'Login falhou. Usuário ou senha inválidos.'

@app.route('/dashboard')
def dashboard():
    if 'username' in session:
        return f'Bem-vindo, {session["username"]}!'
    else:
        return redirect(url_for('home'))

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('home'))

if __name__ == "__main__":
    app.run(debug=True)
