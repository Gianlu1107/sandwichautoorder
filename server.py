from http.server import BaseHTTPRequestHandler, HTTPServer
import json

class MyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        # Risponde alle richieste OPTIONS
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        if self.path == "/ordini":
            content_length = int(self.headers["Content-Length"])
            post_data = self.rfile.read(content_length).decode("utf-8")
            
            # Salva l'ordine nel file
            with open("ordini.txt", "a") as f:
                f.write(post_data + "\n")

            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b"Abbiamo ricevuto il tuo ordine! Grazie!")

server = HTTPServer(("0.0.0.0", 8080), MyHandler)
print("Server in ascolto sulla porta 8080...")
server.serve_forever()
