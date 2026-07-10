# Analisi dei Requisiti — Progetto FastFood
### Programmazione Web e Mobile — A.A. 2025/2026
**Modalità di sviluppo:** Progetto Full, individuale

---

## 1. Introduzione e obiettivo del sistema

FastFood è un'applicazione web per l'ordinazione online presso ristoranti di una catena di fast food. Il sistema deve gestire l'intero ciclo di vita di un ordine: dalla registrazione dell'utente, alla configurazione del ristorante e del menu, fino all'ordinazione, preparazione e consegna del cibo.

Essendo la specifica volutamente incompleta, in questo documento vengono esplicitate le interpretazioni adottate, motivandole, ogniqualvolta il testo lasci spazio ad ambiguità. Questo è coerente con quanto richiesto nella premessa del progetto ("il candidato deve essere in grado di valutare eventuali soluzioni alternative e giustificare le scelte implementative adottate").

---

## 2. Attori del sistema

| Attore | Descrizione |
|---|---|
| **Cliente** | Utente finale che si registra per ordinare cibo. Sfoglia ristoranti/piatti, gestisce carrello, effettua ordini, ne segue lo stato, riceve/segnala la consegna. |
| **Ristoratore** | Utente che gestisce un ristorante: anagrafica, menu (piatti in vendita), coda di preparazione degli ordini, statistiche di vendita. |
| **Sistema (attore non umano)** | Componente automatico che calcola tempi di attesa in coda, calcola distanze/costi di consegna tramite OpenStreetMap, gestisce le transizioni di stato automatiche degli ordini. |

**Nota su ambiguità:** la specifica non menziona un ruolo di "amministratore" del sistema con funzioni di supervisione globale (es. gestione utenti su tutta la piattaforma, moderazione). Si assume che tale ruolo non sia richiesto e che il caricamento iniziale dei dati (piatti da `meal.json`) avvenga come fase di **setup/seed del database**, non tramite un'interfaccia amministrativa dedicata.

---

## 3. Requisiti funzionali

Organizzati secondo i 4 macro-scenari indicati nella specifica, con evidenziate le estensioni richieste dalla versione **Full**.

### 3.1 Macro-scenario 1 — Gestione del profilo utente

- **RF1.1** Il sistema deve permettere la registrazione di un nuovo utente, acquisendo almeno: username, email, password, tipologia utente (Cliente o Ristoratore).
- **RF1.2** In base alla tipologia scelta, il sistema deve acquisire dati aggiuntivi specifici:
  - *Cliente*: nome, cognome, metodo di pagamento (carta di credito/prepagata), preferenze di prodotto (per notifiche/offerte in bacheca).
  - *Ristoratore*: nome ristorante, telefono, partita IVA, indirizzo.
- **RF1.3** Il sistema deve permettere il login tramite credenziali (username/email + password).
- **RF1.4** Il sistema deve permettere la modifica dei dati personali/preferenze, sia per Cliente sia per Ristoratore.
- **RF1.5** Il sistema deve permettere la cancellazione del proprio profilo.

**Assunzione:** un ristoratore è associato a **un solo ristorante** (relazione 1:1), poiché la specifica non menziona la possibilità di gestire più punti vendita per lo stesso utente ristoratore.

### 3.2 Macro-scenario 2 — Gestione del ristorante

- **RF2.1** Il ristoratore, autenticato, deve poter inserire/modificare i dati del proprio ristorante (nome, luogo, telefono, P.IVA, indirizzo).
- **RF2.2** Il ristoratore deve poter comporre il proprio menu selezionando piatti da una lista comune fornita da `meal.json` (dati precaricati al setup).
- **RF2.3** Il ristoratore deve poter inserire **piatti personalizzati** (non presenti nella lista comune), specificando per ognuno tutte le informazioni previste: nome, tipologia, prezzo, ingredienti, foto illustrativa.
- **RF2.4** Per ogni piatto (di listino comune o personalizzato) il sistema deve gestire: nome, tipologia, prezzo, elenco ingredienti, immagine.
- **RF2.5** Il ristoratore deve poter modificare/rimuovere piatti dal proprio menu.

**Nota implementativa:** dato che gli ingredienti sono associati ai piatti, questo abilita direttamente due funzionalità obbligatorie per i gruppi ma utili anche in versione singola Full: la *ricerca di piatti per ingredienti* e la *ricerca di piatti per allergie* (un'allergia può essere modellata come "assenza di uno o più ingredienti specifici" nel piatto).

### 3.3 Macro-scenario 3 — Gestione degli ordini

- **RF3.1** Il cliente autenticato deve poter sfogliare i ristoranti e i relativi menu.
- **RF3.2** Il cliente deve poter aggiungere uno o più piatti al carrello, anche di ristoranti diversi (da chiarire, vedi ambiguità sotto) o vincolando il carrello a un solo ristorante per ordine.
- **RF3.3** Il cliente deve poter concludere l'acquisto (checkout) generando un ordine.
- **RF3.4** Ogni ordine deve seguire il flusso di stato:
  `ordinato → in preparazione → in consegna → consegnato`
- **RF3.5** Il cliente, in fase di ordine, deve scegliere la modalità di ritiro:
  - **Ritiro presso il ristorante**: il sistema calcola un tempo di attesa stimato basato sugli ordini già in coda presso quel ristorante. Quando il ristoratore segnala che l'ordine è pronto, l'ordine passa **direttamente** allo stato "consegnato" (bypassando "in consegna") e viene rimosso dalla coda di preparazione.
  - **Consegna a domicilio**: il cliente specifica l'indirizzo di consegna. Il sistema calcola la distanza ristorante–destinazione tramite le API di OpenStreetMap (OSRM/Nominatim) e determina il costo di consegna in funzione dei km.
- **RF3.6** Il ristoratore deve poter visualizzare la coda degli ordini del proprio ristorante e segnalarne il completamento della preparazione.

**Ambiguità rilevata e assunzione adottata:** la specifica afferma che la consegna a domicilio è prevista "solo per gruppi di due persone", ma la elenca anche tra le operazioni **obbligatorie della versione Full** genericamente, senza distinguere tra progetto singolo e di gruppo in quel punto. Poiché il progetto Full richiede esplicitamente la consegna a domicilio con calcolo dei costi tramite OpenStreetMap tra le funzionalità di base da presentare, **si assume che tale funzionalità sia comunque richiesta anche nella versione Full singola**, mentre la frase "solo per gruppi di due persone" viene interpretata come riferita a un **livello di complessità/rifinitura superiore** richiesto ai gruppi (es. gestione di casi multi-corriere, ottimizzazione percorsi), non come esclusione totale della funzionalità per chi lavora da solo. Questa scelta verrà comunque motivata esplicitamente nella relazione finale, segnalando l'ambiguità della traccia.

### 3.4 Macro-scenario 4 — Gestione delle consegne

- **RF4.1** Quando l'ordine è in stato "in consegna", il cliente finale, alla ricezione, deve poter segnalare l'avvenuta consegna.
- **RF4.2** Alla segnalazione, l'ordine transita dallo stato "in consegna" allo stato "consegnato".

**Nota:** la specifica non definisce un attore "corriere/fattorino" distinto. Si assume che la transizione di stato "in consegna" sia impostata dal ristoratore (analogamente alla segnalazione di piatto pronto per il ritiro) e che solo la conferma finale di ricezione sia responsabilità del cliente.

### 3.5 Funzionalità aggiuntive richieste dalla versione Full

- **RF5.1** Visualizzazione delle informazioni su piatti, clienti, ristoratori registrati e acquisti.
- **RF5.2** Ricerca ristoranti per: luogo, nome.
- **RF5.3** Ricerca piatti per: tipologia, nome, prezzo.
- **RF5.4** Ricerca ristorante per piatto offerto (obbligatoria per i gruppi; inclusa comunque per completezza).
- **RF5.5** Ricerca piatti per ingredienti.
- **RF5.6** Ricerca piatti per allergie (esclusione ingredienti).
- **RF5.7** Visualizzazione statistiche per ristorante (es. numero ordini, piatti più venduti, fatturato).
- **RF5.8** Visualizzazione storico acquisti (presenti e passati) per un cliente.
- **RF5.9** Consegna a domicilio con calcolo distanza/costo tramite OpenStreetMap (vedi RF3.5 e ambiguità discussa).

---

## 4. Requisiti non funzionali

- **RNF1 — Architettura**: separazione netta tra frontend (HTML5/CSS3/JS) e backend (Node.js + MongoDB), comunicanti tramite API REST.
- **RNF2 — Documentazione API**: le API REST devono essere documentate tramite Swagger (OpenAPI).
- **RNF3 — Separazione struttura/presentazione**: le pagine HTML5 non devono contenere stili inline; tutto lo stile va demandato ai fogli CSS3.
- **RNF4 — Persistenza**: tutti i dati (utenti, ristoranti, piatti, ordini) devono essere persistiti in MongoDB.
- **RNF5 — Setup iniziale**: all'avvio dell'applicazione, i dati di base (lista piatti comuni da `meal.json`) devono essere già disponibili nel database (fase di seeding).
- **RNF6 — Sicurezza minima**: gestione sicura delle password (es. hashing), gestione di sessione/autenticazione per proteggere le operazioni riservate a Cliente/Ristoratore autenticati.
- **RNF7 — Usabilità**: interfaccia semplice e coerente per i due profili utente, con viste distinte per Cliente e Ristoratore.
- **RNF8 — Integrazione esterna**: dipendenza dal servizio OpenStreetMap (geocoding + calcolo distanza) per il calcolo dei costi di consegna a domicilio.

---

## 5. Entità principali (modello dati preliminare)

| Entità | Attributi principali |
|---|---|
| **Utente** | id, username, email, password (hash), tipo (Cliente/Ristoratore) |
| **Cliente** *(estende Utente)* | nome, cognome, metodo di pagamento, preferenze |
| **Ristoratore** *(estende Utente)* | nome ristorante, telefono, P.IVA, indirizzo, luogo |
| **Piatto** | id, nome, tipologia, prezzo, ingredienti[], foto, origine (comune/personalizzato), id ristorante |
| **Ordine** | id, id cliente, id ristorante, lista piatti/quantità, stato, modalità ritiro, indirizzo consegna (se domicilio), costo consegna, timestamp |
| **Carrello** | id cliente, lista piatti/quantità (temporaneo, pre-ordine) |

**Nota:** modellare `Piatto` come sotto-documento del `Ristoratore` in MongoDB (embedding) oppure come collezione separata referenziata è una scelta implementativa da discutere nella relazione — considerando che i piatti "comuni" (da `meal.json`) sono condivisi da più ristoranti mentre le personalizzazioni sono per-ristorante.

---

## 6. Elenco sintetico dei casi d'uso principali

**Cliente:**
UC1 Registrazione • UC2 Login • UC3 Modifica profilo • UC4 Cancellazione profilo • UC5 Ricerca ristoranti • UC6 Ricerca piatti (per nome/tipo/prezzo/ingredienti/allergie) • UC7 Aggiunta piatto al carrello • UC8 Checkout ordine (scelta ritiro/domicilio) • UC9 Visualizzazione stato ordine • UC10 Visualizzazione storico ordini • UC11 Conferma ricezione consegna

**Ristoratore:**
UC12 Registrazione • UC13 Login • UC14 Modifica profilo/ristorante • UC15 Cancellazione profilo • UC16 Composizione menu (da listino comune) • UC17 Creazione piatto personalizzato • UC18 Modifica/rimozione piatto • UC19 Visualizzazione coda ordini • UC20 Segnalazione ordine pronto • UC21 Visualizzazione statistiche ristorante

**Sistema:**
UC22 Calcolo tempo di attesa in coda • UC23 Calcolo distanza/costo consegna (OSM) • UC24 Transizioni automatiche di stato ordine • UC25 Seeding iniziale dati da `meal.json`

---

## 7. Riepilogo delle assunzioni chiave da riportare in relazione

1. Nessun attore "amministratore di piattaforma": il seeding dati è un processo di setup, non una funzione utente.
2. Un ristoratore gestisce un solo ristorante.
3. La consegna a domicilio è implementata anche nella versione Full singola, interpretando il vincolo "solo per gruppi di due persone" come riferito a un livello di complessità aggiuntivo, non a un'esclusione della funzionalità.
4. Non esiste un attore "corriere": la transizione a "in consegna" è gestita dal ristoratore, la conferma finale dal cliente.
5. Le allergie sono modellate come vincoli di esclusione sugli ingredienti del piatto, non come entità separata con tassonomia propria (semplificazione ragionevole vista l'assenza di indicazioni specifiche nella traccia).
