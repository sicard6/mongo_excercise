//----------------------------------------------
//Atributos
//----------------------------------------------
/*
obtiene componente express
*/
let express = require('express');

/*
herramienta de modelado
*/
let mongoClient = require('mongodb').MongoClient;

/*
Obtiene el componente de mongo
*/
var conn = mongoClient.connect('mongodb://localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

/*
me permite usar express
*/
let app = express();
//permite que haya un body tipo JSON
app.use(express.json());

//----------------------------------------------
//Metodos
//----------------------------------------------

//Me pone a escuchar el servidor en el puerto xxxx
app.listen(8080);

// se encarga de obtener todos los paises.
function getPaises(callback) {
    //conectandose
    conn.then(client => {
        client.db('poblaciones').collection('paises').find({}).toArray((error, data) => {
            callback(data);
        });
    });

}

//se encarga de obtener un unico pais.
function getPais(pais, callback) {
    //conectandose
    conn.then(client => {
        client.db('poblaciones').collection('paises').find({
            country: pais
        }).toArray((error, data) => {
            callback(data);
        });
    });

}

//encargado de hacer el post del pais.
function postPais(pais, callback) {
    conn.then(client => {
        client.db('poblaciones').collection('paises').insertOne(pais, (error, data) => {
            callback(data);
        });
    });
}

//encargado de borrar el pais.
function deletePais(paisNombre, callback) {
    conn.then(client => {
        client.db('poblaciones').collection('paises').deleteOne({
            country: paisNombre
        }, (err, result) => {
            if (err) throw err;
            callback(result);
        });
    });
}

//encargado de modificar el pais.
function putPais(paisNombre, data, callback) {
    let mod = {
       $set : { country: data.country,
        population: data.population,
        continent: data.continent,
        lifeExpectancy: data.lifeExpectancy,
        purchasingPower: data.purchasingPower}
    };
    conn.then(client => {client.db('poblaciones').collection('paises').updateOne({country: paisNombre}, mod, (error, data) => {
            if (error) throw error;
            callback(data);
        });
    });
}

// se encarga de recibir y servir todos los path.
function servir() {

    //get vacio
    app.get('/', (request, res) => {
        res.send('GET /countries \n GET /countries/"pais" \n POST /countries \n PUT /countries/"pais" \n DELETE /countries/"pais"');
    });

    //get all paises
    app.route('/countries')
        .get((request, res) => {
            getPaises(data => {
                res.send(data);
            });
        })
        //post pais
        .post((req, res) => {
            postPais(req.body, data => {
                res.send(data);
            });
        })
        //put pais 
        .put((request, res) => {
            putPais(request.body, data => {
                res.send(data);
            })
        });

    //put 
    app.put('/countries/:country', (request, res) => {
        putPais(request.params.country, request.body, data => {
            res.send(data);
        });
    });

    //get 
    app.get('/countries/:country', (request, res) => {
        getPais(request.params.country, data => {
            res.send(data);
        });
    });

    //delete 
    app.delete('/countries/:country', (request, res) => {
        deletePais(request.params.country, data => {
            res.send(data);
        });
    });
}

servir();