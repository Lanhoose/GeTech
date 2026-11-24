# GeTech
Desenvolvimento de um sistema de ERP Industrial e Registro de sistema de manutenções.

## Login livre para testes

Nos dois logins, o botão **Login livre** abre uma demonstração no navegador sem exigir configuração. Ela usa dados fictícios e permite testar uma ordem de serviço, revisão, baixa de estoque e histórico.

### ERP completo em ambiente local

Na raiz do projeto, com Firebase CLI, Python 3.9+ e Java para o emulador do Realtime Database, execute no PowerShell:

```powershell
firebase.cmd emulators:exec --only auth,database --project demo-getech "python scripts/ambiente-teste.py"
```

Abra [Login público](http://127.0.0.1:8765/GeTech/site/public/pages/login.html) ou [Login do Site C](http://127.0.0.1:8765/GeTech/site/Site%20C/pages/login.html) e clique em **Login livre**. O botão entra com o perfil gestor no Firebase local. Para testar o fluxo do técnico, use `tecnico@demo.getech.test` com a senha `getech-demo-local` no formulário normal do mesmo ambiente.

As contas e os dados do ERP local são temporários e pertencem aos emuladores. Nesse endereço, o botão entra no ERP local. Os SDKs do Firebase são carregados pelo navegador via CDN, como no restante do projeto.
