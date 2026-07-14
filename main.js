const express = require('express');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectId;
const mongoURL ="mongodb+srv://matteomonti8:Un!mi.0027@cluster0.okkntfo.mongodb.net/";
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());


//===================UTENTE===================\\
app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const client = await MongoClient.connect(mongoURL);
    const coll = client.db('Fastfood').collection('user');
    const filter = {username:username, password: password} //cerca utente con username e password date
  
    const cursor = coll.find(filter);
    const result = await cursor.toArray();

    let id=result[0]._id;
    let tipo=result[0].tipo;

    if (result.length > 0) {
        console.log("Utente trovato:");
        console.log(result);
        res.status(200).json({success: true,id: id, user: tipo});
    } else {
        console.log("Utente non trovato:");
        res.status(401).json({success: false})
    }
});

app.post('/user', async (req, res) => {
    const nome = req.body.nome;
    const cognome = req.body.cognome;
    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;
    const tipo = req.body.tipo;
    let ncarta;
    let datacarta;
    let cvvcarta;
    if(tipo=="cliente"){
        ncarta = req.body.ncarta;
        datacarta = req.body.datacarta;
        cvvcarta = req.body.cvvcarta;
    }

    if (nome.length < 2) {
        console.log("Campo non valido");
        res.status(401).json({success: false, message: "Nome troppo corto"});
    }
    if (cognome.length < 2) {
        console.log("Campo non valido");
        res.status(401).json({success: false, message: "Cognome troppo corto"});
    }
    if (email.length < 6) {
        console.log("Campo non valido");
        res.status(401).json({success: false, message: "email non valida"});
    }
    if (username.length < 2) {
        console.log("Campo non valido");
        res.status(401).json({success: false, message: "Username troppo corto"});
    }
    if (password.length < 2) {
        console.log("Campo non valido");
        res.status(401).json({success: false, message: "Password troppo corta"});
    }

    try {
        const client = await MongoClient.connect(mongoURL);
        const coll = client.db('Fastfood').collection('user');
        const user = {
            nome: nome,
            cognome: cognome,
            username: username,
            email: email,
            password: password,
            tipo: tipo
        };

        if (tipo=="cliente") {
            user.ncarta = ncarta;
            user.datacarta = datacarta;
            user.cvvcarta = cvvcarta;
        }

        const result = await coll.insertOne(user);
        console.log("Utente Creato:");
        console.log(result);
        res.status(201).json({success: true, message: "Utente Creato"});
        await client.close();
      
    } catch (error) {
        console.log(error);
        if (error.code == 11000) { //conflitto sugli indici DB
            res.status(409).json({ success: false, message: "Username o email già in uso" }); //errore di conflitto HTML
        } else {
            res.status(500).json({ success: false, message: "Errore non gestito" });
        }
    }
    res.send();
});

app.get('/user/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const client = await MongoClient.connect(mongoURL);
        const coll = client.db('Fastfood').collection('user');
        const cursor = coll.find(new ObjectID(id));
        const result = await cursor.toArray();
        await client.close();
        if(result.length==0){
            console.log("Utente non trovato:");
            res.status(404).json({success: false, message: "Utente non trovato"});
        }
        else{
            console.log("Utente trovato:");
            console.log(result[0]);
            res.status(200).json({success: true, message: "Utente Trovato", user: JSON.stringify(result[0])});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Errore non gestito" });
    }
})


app.put('/user/:id', async (req, res) => {
    const id = req.params.id;
    const nome = req.body.nome;
    const cognome = req.body.cognome;
    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;
    const tipo = req.body.tipo;
    let ncarta;
    let datacarta;
    let cvvcarta;
    if(tipo=="cliente"){
        ncarta = req.body.ncarta;
        datacarta = req.body.datacarta;
        cvvcarta = req.body.cvvcarta;
    }

    if (nome.length < 2) {
        console.log("Campo non valido");
        res.status(401).json({success: false, message: "Nome troppo corto"});
    }
    if (cognome.length < 2) {
        console.log("Campo non valido");
        res.status(401).json({success: false, message: "Cognome troppo corto"});
    }
    if (email.length < 6) {
        console.log("Campo non valido");
        res.status(401).json({success: false, message: "email non valida"});
    }
    if (username.length < 2) {
        console.log("Campo non valido");
        res.status(401).json({success: false, message: "Username troppo corto"});
    }
    if (password.length < 2) {
        console.log("Campo non valido");
        res.status(401).json({success: false, message: "Password troppo corta"});
    }

    try {
        const client = await MongoClient.connect(mongoURL);
        const coll = client.db('Fastfood').collection('user');

        const user = {
            nome: nome,
            cognome: cognome,
            username: username,
            email: email,
            password: password,
            tipo: tipo
        };

        if (tipo=="cliente") {
            user.ncarta = ncarta;
            user.datacarta = datacarta;
            user.cvvcarta = cvvcarta;
        }

        const cursor = await coll.replaceOne({_id: new ObjectID(id)}, user); //sovrascrive tutti i dati (no ID) con quelli nuovi
        await client.close();

        console.log("Utente modificato:");
        res.status(200).json({success: true, message: "Account modificato"});
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Errore non gestito" });
    }
})

app.delete('/user/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const client = await MongoClient.connect(mongoURL);
        const coll = client.db('Fastfood').collection('user');
        const result = await coll.deleteOne({_id: new ObjectID(id)});

        console.log("Utente cancellato:");
        console.log(result);
        res.status(200).json({success: true, message: "Account cancellato"});
        await client.close();
      
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Errore non gestito" });
    }
})


//===================RISTORANTE===================\\
//per le "relazioni" uso la stringa dell'objectID, non l'objectID intero in quanto causa problemi
app.post('/ristorante/:ristoratore', async (req, res) => {
    const nome = req.body.nome;
    const indirizzo = req.body.indirizzo;
    const citta = req.body.citta;
    const telefono = req.body.telefono;
    const iva = req.body.iva;
    const proprietario = req.params.ristoratore;

    if (nome.length < 3) {
        console.log("Campo non valido");
        res.status(401).json({success: false, message: "Nome troppo corto"});
    }
    if (indirizzo.length < 5) {
        console.log("Campo non valido");
        res.status(401).json({success: false, message: "Indirizzo non valido"});
    }
    if (citta.length < 3) {
        console.log("Campo non valido");
        res.status(401).json({success: false, message: "città non valida"});
    }
    if (telefono.length < 9) {
        console.log("Campo non valido");
        res.status(401).json({success: false, message: "Telefono non valido"});
    }
    if (iva.length < 11) {
        console.log("Campo non valido");
        res.status(401).json({success: false, message: "P. IVA non valida"});
    }

    try {
        const client = await MongoClient.connect(mongoURL);
        const coll = client.db('Fastfood').collection('ristorante');
        const rest = {
            nome: nome,
            indirizzo: indirizzo,
            citta: citta,
            telefono: telefono,
            iva: iva,
            id_proprietario: proprietario
        };

        const result = await coll.insertOne(rest);
        console.log("Ristorante Creato:");
        console.log(result);
        res.status(201).json({success: true, message: "Ristorante Creato"});
        await client.close();
      
    } catch (error) {
        console.log(error);
        if (error.code == 11000) { //conflitto sugli indici DB
            res.status(409).json({ success: false, message: "Ristoratore già in possesso di un ristorante" }); //errore di conflitto HTML
        } else {
            res.status(500).json({ success: false, message: "Errore non gestito" });
        }
    }
    res.send();
});

app.get('/ristorante/:ristoratore', async (req, res) => {
    const id = req.params.ristoratore;
    try {
        const client = await MongoClient.connect(mongoURL);
        const coll = client.db('Fastfood').collection('ristorante');
        const cursor = coll.find({id_proprietario: id});
        const result = await cursor.toArray();
        await client.close();
        if(result.length==0){
            console.log("Ristorante non trovato");
            res.status(404).json({success: false, message: "Ristorante non trovato"});
        }
        else{
            console.log("Ristorante trovato:");
            console.log(result[0]);
            res.status(200).json({success: true, message: "Ristorante Trovato", rest: JSON.stringify(result[0])});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Errore non gestito" });
    }
})


app.put('/ristorante/:ristoratore', async (req, res) => {
    const nome = req.body.nome;
    const indirizzo = req.body.indirizzo;
    const citta = req.body.citta;
    const telefono = req.body.telefono;
    const iva = req.body.iva;
    const proprietario =req.params.ristoratore;

    if (nome.length < 3) {
        console.log("Campo non valido");
        res.status(401).json({success: false, message: "Nome troppo corto"});
    }
    if (indirizzo.length < 5) {
        console.log("Campo non valido");
        res.status(401).json({success: false, message: "Indirizzo non valido"});
    }
    if (citta.length < 3) {
        console.log("Campo non valido");
        res.status(401).json({success: false, message: "città non valida"});
    }
    if (telefono.length < 9) {
        console.log("Campo non valido");
        res.status(401).json({success: false, message: "Telefono non valido"});
    }
    if (iva.length < 11) {
        console.log("Campo non valido");
        res.status(401).json({success: false, message: "P. IVA non valida"});
    }


    try {
        const client = await MongoClient.connect(mongoURL);
        const coll = client.db('Fastfood').collection('ristorante');

        const rest = {
            nome: nome,
            indirizzo: indirizzo,
            citta: citta,
            telefono: telefono,
            iva: iva,
            id_proprietario: proprietario
        };

        const cursor = await coll.replaceOne({id_proprietario: proprietario}, rest); //sovrascrive tutti i dati (no ID) con quelli nuovi
        await client.close();

        console.log("Ristorante modificato:");
        res.status(200).json({success: true, message: "Ristorante modificato"});
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Errore non gestito" });
    }
})

app.delete('/ristorante/:ristoratore', async (req, res) => {
    const id = req.params.ristoratore;
    try {
        const client = await MongoClient.connect(mongoURL);
        const coll = client.db('Fastfood').collection('ristorante');
        const result = await coll.deleteOne({id_proprietario: id});

        console.log("Ristorante cancellato:");
        console.log(result);
        res.status(200).json({success: true, message: "Ristorante cancellato"});
        await client.close();
      
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Errore non gestito" });
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
