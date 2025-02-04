import json
import re
import schedule
import time
from collections import Counter

ORDERS_FILE = "ordini.txt"  # Percorso del file con gli ordini

def rimuovi_prezzo(item):
    """Rimuove tutto ciò che è tra parentesi tonde, compreso il prezzo."""
    return re.sub(r"\(.*?\)", "", item).strip()

def genera_recap():
    """Legge il file degli ordini, conta gli elementi e genera il recap."""
    tutti_gli_ordini = []

    try:
        with open(ORDERS_FILE, "r", encoding="ISO-8859-1") as file:
            ordini = file.readlines()  # Legge ogni riga del file (ogni riga è un JSON)

            for ordine in ordini:
                try:
                    data = json.loads(ordine.strip())  # Converte ogni riga in JSON
                    items = data.get("items", [])
                    # Rimuove le informazioni tra parentesi senza eliminare la bibita
                    items_senza_prezzo = [rimuovi_prezzo(item) for item in items]
                    tutti_gli_ordini.extend(items_senza_prezzo)
                except json.JSONDecodeError:
                    print(f"Errore nel parsing JSON: {ordine.strip()}")

    except FileNotFoundError:
        print(f"Errore: Il file {ORDERS_FILE} non esiste.")
        return

    # Conta le occorrenze degli ordini usando Counter
    conteggio_ordini = Counter(tutti_gli_ordini)

    # Genera il messaggio
    messaggio = ""
    for item, quantita in sorted(conteggio_ordini.items(), key=lambda x: x[0].lower()):
        messaggio += f"• {quantita}x {item}\n"

    print(messaggio)  # Puoi inviarlo su WhatsApp se necessario

# Pianifica il recap per le 21:00 ogni giorno
schedule.every().day.at("22:31").do(genera_recap)

# Loop per mantenere attivo lo script
while True:
    schedule.run_pending()
    print("In attesa delle 22:31...")
    time.sleep(60)  # Controlla ogni minuto
