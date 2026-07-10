const express = require('express');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectId;
const mongoURL ="mongodb+srv://matteomonti8:Un!mi.0027@cluster0.okkntfo.mongodb.net/";
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const client = await MongoClient.connect(mongoURL);
    const coll = client.db('Fastfood').collection('user');
    const filter = {username:username, password: password}
  
    const cursor = coll.find(filter);
    const result = await cursor.toArray();
    console.log(result)

    let id=result[0]._id;
    let tipo=result[0].tipo;

    if (result.length > 0) {
        res.status(200).json({success: true,id: id, user: tipo});
    } else {
        res.status(401).json({success: false})
    }
});

app.post('/signup', async (req, res) => {
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
    //Inizio logica di controllo dei dati

    if (nome.length < 2) {
        res.status(401).send("Nome troppo corto");
    }
    if (cognome.length < 2) {
        res.status(401).send("Cognome troppo corto");
    }
    if (email.length < 6) {
        res.status(401).send("email non valida");
    }
    if (username.length < 2) {
        res.status(401).send("Username troppo corto");
    }
    if (password.length < 2) {
        res.status(401).send("Password troppo corta");
    }

    try {
        //Fine logica di controllo dei dati
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
        if (error.code == 11000) {
            res.status(409).json({ success: false, message: "Username o email già in uso" });
        } else {
            res.status(500).json({ success: false, message: "Errore non gestito" });
        }
    }
    res.send();
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})