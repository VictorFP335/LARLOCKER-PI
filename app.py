from flask import Flask, render_template, request, redirect, url_for, session
from flask_mysqldb import MySQL
from config import DB_CONFIG

app = Flask(__name__)


# Configuração do banco de dados MySQL
app.config['MYSQL_HOST'] = DB_CONFIG['MYSQL_HOST']
app.config['MYSQL_USER'] = DB_CONFIG['MYSQL_USER']
app.config['MYSQL_PASSWORD'] = DB_CONFIG['MYSQL_PASSWORD']
app.config['MYSQL_DATABASE'] = DB_CONFIG['MYSQL_DATABASE']

mysql = MySQL(app)
'''
app.route('style.css')
def serve_css():
    css_content = get_asset_content('css')
    return Response(css_content, mimetype='text/css')

# Rota para servir JS
@app.route('script.js')
def serve_js():
    js_content = get_asset_content('js')
    return Response(js_content, mimetype='application/javascript')
'''
@app.route('/cadastro')
def cadastro():
    return render_template('cadastro.html')

@app.route('/recuperar-senha')
def recuperar_senha():
    return render_template('recuperar-senha.html')

@app.route('/comodo', methods=['GET', 'POST'])
def comodo():
    # Verifique se é uma requisição POST
    if request.method == 'POST':
        # Lógica para o que acontece no POST (exemplo: submissão de formulário)
        pass
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
    cursor.close()  # Fechar o cursor após a execução da consulta

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


