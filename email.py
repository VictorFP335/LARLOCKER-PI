import win32com.client as win32

# criar a integração com o outlook
outlook = win32.Dispatch('outlook.application')

# criar um email
email = outlook.CreateItem(0)



# configurar as informações do seu e-mail
email.To = "victorfp335@gmail.com; edsonedu20312031@gmail.com"
email.Subject = "E-mail automático do Python"
email.HTMLBody = f"""
<p>Olá Edson</p>

<p>Esqueceu a senha?</p>
<p></p>
<p></p>

<p>Abs, Victor</p>
<p>Código Python</p>
"""

# anexo = "C://Users/joaop/Downloads/arquivo.xlsx"
# email.Attachments.Add(anexo)

email.Send()
print("Email Enviado")