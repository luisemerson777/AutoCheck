
import http.server
import socketserver
import os

PORT = 8000

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

# Parte do servidor de arquivos
if __name__ == "__main__":
    print(f"Servidor iniciado em http://localhost:{PORT}")
    with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
        httpd.serve_forever()
