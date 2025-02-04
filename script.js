document.addEventListener("DOMContentLoaded", function () {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const totalElement = document.getElementById("total");
    const orderForm = document.getElementById("orderForm");
    const customerNameInput = document.getElementById("customerName");

    // Lista dei compagni di classe (usiamo la forma con nome e cognome, senza maiuscole)
    const validNames = [
        "tanjimul adi", "dario cappocchin", "giacomo catarinella", "gabriel cheptine", "alessio contin", 
        "badre eddine derouachi", "paolo di bisceglie", "gideon chukuebuka di riogu", "giacomo galligioni", 
        "thomas davide imbrea", "davide lazar", "riccardo levorato", "christian lincetto", "gabriele mazzanti", 
        "giovanni menin", "gianluca morello", "samuele mouadib", "luigi isacco pietrobon", "gioele piva", 
        "alberto rossi", "shayan shahzad mian", "jivaansh sharma", "tommaso tasinato", "filippo zanta"
    ];

    // Definizione delle categorie dei prodotti
    const categories = {
        pizza: ["margherita", "wurstel", "salsiccia", "prosciutto e funghi"],
        panini: ["cotto", "cotto e formaggio", "crudo", "speck", "porchetta", "mortadella", "tacchino", "pancetta affumicata", "soppressa"],
        focaccia: ["olive", "pomodorini", "tonno e olive", "tonno e cipolline"],
        focacciaFarcita: ["crudo e philadelphia", "speck e salsa funghi", "porchetta e salsa tonno", "tacchino e salsa rosa", "mortadella e salsa piccante", "soppressa e salsa piccante", "cotto pomodoro e salsa rosa", "pesto pancetta affumicata e scamorza"],
        toast: ["cotto e formaggio"],
        bibite: ["acqua", "tè", "coca cola", "red bull"]
    };

    // Calcolo del totale in tempo reale durante la selezione
    function calculateTotal() {
        let total = 0;
        let hasPanino = false;

        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                let price = parseFloat(checkbox.value);
                if (checkbox.name === "drink" && hasPanino) {
                    price = parseFloat(checkbox.getAttribute("data-discount"));
                }
                total += price;
            }
            if (checkbox.name !== "drink" && checkbox.checked) {
                hasPanino = true;
            }
        });

        totalElement.textContent = total.toFixed(2);
    }

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", calculateTotal);
    });

    orderForm.addEventListener("submit", function (event) {
        event.preventDefault();
        let customerName = customerNameInput.value.trim().toLowerCase();

        // Verifica se il nome è valido
        if (!isValidName(customerName)) {
            alert("Il tuo nome non è nella lista dei compagni di classe. Non puoi prenotare un panino.");
            return;
        }

        let selectedItems = [];
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                let item = checkbox.parentElement.textContent.trim();
                let formattedItem = formatItem(item);
                if (formattedItem) {
                    selectedItems.push(formattedItem);
                }
            }
        });

        if (selectedItems.length === 0) {
            alert("Seleziona almeno un prodotto!");
            return;
        }

        let orderData = {
            name: customerName,
            items: selectedItems,
            total: totalElement.textContent
        };

        // Invio dati al server Python in ascolto
        fetch("http://192.168.1.111:8080/ordini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
            orderForm.reset();
            totalElement.textContent = "0.00";
        })
        .catch(error => {
            alert("Errore nell'invio dell'ordine!");
            console.error(error);
        });
    });

    // Funzione di validazione del nome (confronto più robusto)
    function isValidName(name) {
    const nameParts = name.split(" "); // Separiamo nome e cognome da uno spazio

    // Se ci sono due parole, cerchiamo la corrispondenza in qualsiasi ordine
    return validNames.some(validName => {
        const validNameParts = validName.split(" ");
        
        // Se il nome e cognome separati non sono corretti, proviamo a fare una verifica
        if (nameParts.length === 1) {
            // Controlla se solo il nome o solo il cognome corrisponde a uno dei nomi nella lista
            return validNameParts.some(part => part.toLowerCase().includes(name.toLowerCase()));
        } else if (nameParts.length === 2) {
            // Se ci sono due parole, cerchiamo la corrispondenza in qualsiasi ordine
            return (validNameParts[0].includes(nameParts[0]) && validNameParts[1].includes(nameParts[1])) ||
                   (validNameParts[1].includes(nameParts[0]) && validNameParts[0].includes(nameParts[1]));
        }
        
        return false;
    });
}


    // Funzione per formattare i nomi degli articoli e aggiungere solo la categoria abbreviata
    function formatItem(item) {
        // Gestione della categoria "bibite"
        if (categories.bibite.some(drink => item.toLowerCase().includes(drink))) {
            return item.split(" (")[0]; // Rimuove il prezzo se presente
        }

        for (let category in categories) {
            if (categories[category].some(food => item.toLowerCase().includes(food))) {
                // Se è una bibita, non aggiungere la categoria
                if (category === 'bibite') {
                    return item.split(" (")[0]; // Rimuove la parte con il prezzo
                }

                // Altrimenti, aggiungi la categoria abbreviata (come "Focaccia" o "Panino")
                if (category === 'pizza') {
                    return "Pizza " + item;
                }
                if (category === 'panini') {
                    return "Panino " + item;
                }
                if (category === 'focaccia') {
                    return "Focaccia " + item;
                }
                if (category === 'toast') {
                    return "Toast " + item;
                }
            }
        }
        return null; // Se non trova l'articolo nella lista delle categorie
    }
});
