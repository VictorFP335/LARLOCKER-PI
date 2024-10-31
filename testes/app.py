from flask import Flask
from flask_mysqldb import MySQL
from werkzeug.security import generate_password_hash

app = Flask(__name__)

# Configuração do banco de dados MySQL
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '@Yyl5735'
app.config['MYSQL_DB'] = 'pi'

# Inicializar o MySQL
mysql = MySQL(app)

# Testar a conexão dentro do contexto da aplicação
with app.app_context():
    try:
        cur = mysql.connection.cursor()  # Tenta criar um cursor
        cur.execute("SELECT 1")          # Executa uma consulta simples
        cur.close()                      # Fecha o cursor
        print("Conexão bem-sucedida!")   # Se deu certo, exibe esta mensagem
    except Exception as e:
        print("Erro na conexão:", e)     # Se der erro, exibe a mensagem de erro
        
senha_hash = generate_password_hash("sua_senha")
print(senha_hash)
