from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
import json


RAIZ = Path(__file__).resolve().parent.parent
AUTH = "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts"
BANCO = "http://127.0.0.1:9000"
NAMESPACE = "demo-getech-default-rtdb"


def enviar(url, dados, metodo="POST", admin=False):
    cabecalhos = {"Content-Type": "application/json"}
    if admin:
        cabecalhos["Authorization"] = "Bearer owner"
    req = Request(url, json.dumps(dados).encode(), cabecalhos, method=metodo)
    with urlopen(req, timeout=8) as resposta:
        return json.load(resposta)


def preparar_conta(perfil):
    email = f"{perfil}@demo.getech.test"
    credenciais = {"email": email, "password": "getech-demo-local", "returnSecureToken": True}
    try:
        conta = enviar(f"{AUTH}:signUp?key=demo-getech-local", credenciais)
    except HTTPError as erro:
        if json.load(erro).get("error", {}).get("message") != "EMAIL_EXISTS":
            raise
        conta = enviar(f"{AUTH}:signInWithPassword?key=demo-getech-local", credenciais)
    enviar(f"{BANCO}/usuarios/{conta['localId']}.json?ns={NAMESPACE}",
           {"email": email, "nome": f"{perfil.title()} de teste", "tipo": perfil},
           metodo="PUT", admin=True)


class GeTechLocal(SimpleHTTPRequestHandler):
    def do_GET(self):
        caminho = urlsplit(self.path).path
        if caminho in {"/", "/GeTech", "/GeTech/"}:
            self.send_response(302)
            self.send_header("Location", "/GeTech/site/public/pages/login.html")
            self.end_headers()
        elif caminho.startswith("/GeTech/site/"):
            self.path = self.path.removeprefix("/GeTech")
            super().do_GET()
        else:
            self.send_error(404)

    def list_directory(self, path):
        self.send_error(404)


if __name__ == "__main__":
    preparar_conta("gestor")
    preparar_conta("tecnico")
    with ThreadingHTTPServer(("127.0.0.1", 8765), partial(GeTechLocal, directory=RAIZ)) as servidor:
        print("Site publico: http://127.0.0.1:8765/GeTech/site/public/pages/login.html", flush=True)
        print("Site C: http://127.0.0.1:8765/GeTech/site/Site%20C/pages/login.html", flush=True)
        try:
            servidor.serve_forever()
        except KeyboardInterrupt:
            pass
