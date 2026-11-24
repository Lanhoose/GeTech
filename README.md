# GeTech
Desenvolvimento de um sistema de ERP Industrial e Registro de sistema de manutenções.

## Login livre para testes

Nos dois logins, **Login livre** cria uma conta de teste e abre o mesmo painel ERP usado por gestores. O Authentication usa o provedor existente de e-mail e senha com credenciais geradas automaticamente. Os dados são gravados em `ambientesDemo/<uid>`, dentro do mesmo Realtime Database, com regras de acesso por conta. As contas e os dados de teste persistem no Firebase até serem removidos.

Para ativar o botão no site online, publique o código e o `database.rules.json` no projeto Firebase atual. O botão **Entrar** continua usando a área normal.

### ERP completo em ambiente local

Na raiz do projeto, com Firebase CLI, Python 3.9+ e Java para o emulador do Realtime Database, execute no PowerShell:

```powershell
firebase.cmd emulators:exec --only auth,database --project demo-getech "python scripts/ambiente-teste.py"
```

Abra [Login público](http://127.0.0.1:8765/GeTech/site/public/pages/login.html) ou [Login do Site C](http://127.0.0.1:8765/GeTech/site/Site%20C/pages/login.html) e clique em **Login livre**. O botão entra com o perfil gestor no Firebase local. Para testar o fluxo do técnico, use `tecnico@demo.getech.test` com a senha `getech-demo-local` no formulário normal do mesmo ambiente.

As contas e os dados do ERP local são temporários e pertencem aos emuladores. Nesse endereço, o botão entra no ERP local. Os SDKs do Firebase são carregados pelo navegador via CDN, como no restante do projeto.
