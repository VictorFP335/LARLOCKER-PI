from flask import Flask, render_template, request, redirect, session
from flask_mysql_connector import MySQL
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# Configuração do banco de dados MySQL
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'Tukaninha123'
app.config['MYSQL_DATABASE'] = 'projeto'

mysql = MySQL(app)

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

    if user and check_password_hash(user[2], password):
        session['username'] = username
        return redirect('/dashboard')
    else:
        return 'Login falhou. Usuário ou senha inválidos.'

@app.route('/dashboard')
def dashboard():
    if 'username' in session:
        return f'Bem-vindo, {session["username"]}!'
    else:
        return redirect('/')

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect('/')

if __name__ == "__main__":
    app.run(debug=True)
