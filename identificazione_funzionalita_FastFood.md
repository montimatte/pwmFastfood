# Identificazione delle Funzionalità — Progetto FastFood
### Programmazione Web e Mobile — A.A. 2025/2026
**Modalità di sviluppo:** Progetto Full, individuale

---

## 0. Nota di aggiornamento rispetto all'analisi dei requisiti

Rispetto al documento di analisi dei requisiti, si adotta qui la seguente decisione progettuale, da motivare in relazione:

> **La consegna a domicilio non viene implementata.** Il ritiro dell'ordine avviene esclusivamente presso il ristorante, con calcolo del tempo di attesa stimato in base alla coda di preparazione. Questa scelta è motivata dal fatto che la specifica stessa vincola la consegna a domicilio ai gruppi di due persone, rendendo la funzionalità non richiesta (né valutata) per un progetto Full individuale. Di conseguenza vengono meno anche i requisiti RF3.5 (ramo "domicilio"), RF5.9 e RNF8 (integrazione OpenStreetMap) indicati nel documento di analisi.

Il flusso di stato dell'ordine si semplifica quindi in:
`ordinato → in preparazione → consegnato`
(lo stato "in consegna" non viene mai attraversato nel percorso "ritiro al ristorante"; si mantiene comunque nel modello dati per compatibilità futura/estendibilità, ma non è raggiungibile con le funzionalità implementate).

---

## 1. Metodologia

Le funzionalità sono organizzate per **modulo funzionale**, e per ciascuna vengono specificati:
- **ID** univoco
- **Attore** che la richiede
- **Descrizione** puntuale
- **Input** necessari
- **Output / Effetto** prodotto
- **Priorità**: `Core` (necessaria anche per il livello Light/24, dove pertinente) oppure `Full` (richiesta solo dalla versione Full)

Questo elenco costituisce la base diretta per: (a) la progettazione delle pagine web (fase iii), (b) la progettazione delle API REST e schema MongoDB (fase iv).

---

## 2. Modulo A — Autenticazione e Gestione Profilo

| ID | Attore | Funzionalità | Input | Output/Effetto | Priorità |
|---|---|---|---|---|---|
| A1 | Cliente/Ristoratore | Registrazione | username, email, password, tipo utente, dati specifici per tipo | Utente creato, credenziali salvate (hash password) | Core |
| A2 | Cliente/Ristoratore | Login | email/username, password | Sessione autenticata (token/cookie) | Core |
| A3 | Cliente/Ristoratore | Logout | — | Sessione invalidata | Core |
| A4 | Cliente/Ristoratore | Visualizzazione profilo | — | Dati profilo correnti | Core |
| A5 | Cliente/Ristoratore | Modifica profilo | campi da aggiornare | Profilo aggiornato | Core |
| A6 | Cliente/Ristoratore | Cancellazione profilo | conferma | Utente rimosso (con gestione a cascata di ristorante/ordini associati) | Core |
| A7 | Cliente | Gestione metodo di pagamento | dati carta (credito/prepagata) | Metodo di pagamento salvato/aggiornato | Core |
| A8 | Cliente | Gestione preferenze prodotto | tipologia/e preferite | Preferenze salvate, usate per bacheca offerte | Full |

**Nota implementativa:** A6 richiede una decisione: cancellazione "hard" (rimozione fisica) vs "soft delete" (flag `attivo: false`), soprattutto per non perdere lo storico ordini di un cliente cancellato o il menu di un ristoratore cancellato. Si propone **soft delete** per preservare l'integrità referenziale degli ordini storici.

---

## 3. Modulo B — Gestione Ristorante e Menu

| ID | Attore | Funzionalità | Input | Output/Effetto | Priorità |
|---|---|---|---|---|---|
| B1 | Ristoratore | Creazione/completamento anagrafica ristorante | nome, luogo, telefono, P.IVA, indirizzo | Ristorante creato/aggiornato | Core |
| B2 | Ristoratore | Consultazione lista piatti comuni (da `meal.json`) | filtri opzionali | Elenco piatti disponibili al catalogo comune | Core |
| B3 | Ristoratore | Aggiunta piatto da listino comune al proprio menu | id piatto comune, prezzo (personalizzabile?) | Piatto aggiunto al menu del ristorante | Core |
| B4 | Ristoratore | Creazione piatto personalizzato | nome, tipologia, prezzo, ingredienti[], foto | Nuovo piatto creato nel menu | Core |
| B5 | Ristoratore | Modifica piatto (da listino o personalizzato) nel proprio menu | id piatto, campi da modificare | Piatto aggiornato | Core |
| B6 | Ristoratore | Rimozione piatto dal menu | id piatto | Piatto rimosso/disattivato dal menu | Core |
| B7 | Cliente/Ristoratore | Visualizzazione menu di un ristorante | id ristorante | Elenco piatti con dettagli (ingredienti, prezzo, foto) | Core |

**Nota implementativa:** in B3 va deciso se il ristoratore può modificare il prezzo di un piatto "comune" oppure debba mantenerlo fisso come da `meal.json`. Si propone di **permettere la personalizzazione del prezzo** per ristorante (coerente con la logica di business reale di una catena fast food), mantenendo però nome/ingredienti/tipologia/foto ereditati dal catalogo comune salvo per i piatti creati ex novo (B4).

---

## 4. Modulo C — Ricerca

| ID | Attore | Funzionalità | Input | Output | Priorità |
|---|---|---|---|---|---|
| C1 | Cliente | Ricerca ristoranti per luogo | testo luogo | Elenco ristoranti corrispondenti | Full |
| C2 | Cliente | Ricerca ristoranti per nome | testo nome | Elenco ristoranti corrispondenti | Full |
| C3 | Cliente | Ricerca piatti per tipologia | tipologia | Elenco piatti corrispondenti (con ristorante di riferimento) | Full |
| C4 | Cliente | Ricerca piatti per nome | testo nome | Elenco piatti corrispondenti | Full |
| C5 | Cliente | Ricerca piatti per fascia di prezzo | prezzo min/max | Elenco piatti corrispondenti | Full |
| C6 | Cliente | Ricerca ristorante per piatto offerto | nome/id piatto | Elenco ristoranti che offrono quel piatto | Full |
| C7 | Cliente | Ricerca piatti per ingredienti contenuti | elenco ingredienti | Elenco piatti che contengono tutti/alcuni ingredienti indicati | Full |
| C8 | Cliente | Ricerca piatti per allergie (esclusione ingredienti) | elenco ingredienti da escludere | Elenco piatti privi degli ingredienti indicati | Full |

**Nota implementativa:** C6, C7, C8 sono elencate nella specifica come "obbligatorie per i gruppi", ma vengono comunque incluse nel progetto Full individuale poiché rientrano tra le funzionalità di ricerca di base già richieste esplicitamente ("ricerca dei piatti") e sono realizzabili con lo stesso modello dati (nessun costo implementativo aggiuntivo significativo, a differenza della consegna a domicilio che richiede integrazione con servizio esterno OSM).

---

## 5. Modulo D — Gestione Ordini (carrello, checkout, stato)

| ID | Attore | Funzionalità | Input | Output/Effetto | Priorità |
|---|---|---|---|---|---|
| D1 | Cliente | Aggiunta piatto al carrello | id piatto, quantità | Carrello aggiornato | Core |
| D2 | Cliente | Modifica/rimozione piatto dal carrello | id piatto, nuova quantità (o rimozione) | Carrello aggiornato | Core |
| D3 | Cliente | Visualizzazione carrello corrente | — | Elenco piatti nel carrello + totale | Core |
| D4 | Cliente | Checkout / conferma ordine | metodo di pagamento | Ordine creato in stato `ordinato`, carrello svuotato | Core |
| D5 | Sistema | Calcolo tempo di attesa stimato | id ristorante, coda corrente | Tempo stimato restituito al cliente in fase di checkout/monitoraggio | Full |
| D6 | Ristoratore | Visualizzazione coda ordini "in preparazione" | — | Elenco ordini in coda per il proprio ristorante | Core |
| D7 | Ristoratore | Segnalazione "ordine pronto" | id ordine | Stato ordine passa direttamente a `consegnato`; ordine rimosso dalla coda | Core |
| D8 | Cliente | Visualizzazione stato ordine corrente | id ordine | Stato aggiornato dell'ordine | Core |
| D9 | Cliente | Visualizzazione storico ordini (presenti e passati) | — | Elenco ordini con stato e dettagli | Full |
| D10 | Ristoratore | Visualizzazione statistiche ristorante | periodo (opzionale) | Numero ordini, piatti più venduti, fatturato | Full |

**Vincolo di dominio:** dato che non è prevista la consegna a domicilio, l'unico percorso di stato valido è: `ordinato → in preparazione → consegnato` (attivato da D7). Lo stato `in consegna` resta modellato ma non viene mai istanziato dalle funzionalità attuali.

**Nota implementativa D1/D4:** va deciso se un carrello può contenere piatti di ristoranti diversi contemporaneamente. Si propone di **vincolare il carrello a un solo ristorante per volta** (comportamento standard nei sistemi di food delivery reali, e coerente con la generazione di un unico ordine con un'unica coda di preparazione presso un unico ristorante).

---

## 6. Modulo E — Gestione Consegne (semplificato)

| ID | Attore | Funzionalità | Input | Output/Effetto | Priorità |
|---|---|---|---|---|---|
| E1 | Ristoratore | Segnalazione ordine pronto (= D7) | id ordine | Ordine passa a `consegnato` | Core |

**Nota:** poiché la consegna a domicilio è esclusa, il macro-scenario "Gestione delle consegne" collassa interamente nella funzionalità D7 (già vista nel Modulo D): non esiste più un passaggio intermedio "in consegna" da confermare da parte del cliente, dato che il ritiro al ristorante porta l'ordine direttamente allo stato finale.

---

## 7. Tabella riassuntiva per priorità

| Priorità | Numero funzionalità | Moduli coinvolti |
|---|---|---|
| **Core** (necessarie anche per Light) | 16 | A (tranne A8), B, D (tranne D5, D9, D10), E |
| **Full** (aggiuntive) | 11 | A8, C (tutte), D5, D9, D10 |

Totale funzionalità identificate: **27**.

---

## 8. Prossimi passi

Con questo elenco come base, la fase successiva (iii — progettazione struttura e presentazione delle pagine) dovrà definire:
- le pagine/viste necessarie per Cliente e Ristoratore (es. Home, Ricerca, Dettaglio ristorante, Carrello, Storico ordini, Dashboard ristoratore, Gestione menu, Coda ordini, Statistiche);
- la navigazione tra le viste in funzione dello stato di autenticazione e del tipo di utente.

La fase iv (progettazione backend) dovrà invece tradurre ogni funzionalità in uno o più endpoint REST (documentati poi in Swagger) e nelle relative collezioni/schemi MongoDB.

Procedo con una di queste due fasi, se vuoi indicarmi quale preferisci affrontare per prima.
