const express = require("express");
const exphbs = require("express-handlebars");
const fileupload = require("express-fileupload");
const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 5000;

// Default
app.use(fileupload({
        // Aca va la conf de imagenes.
    }));

//Archivos estaticos
app.use(express.static('public'));
app.use(express.static('upload'))

// Pimpeando el motor
const handlebars = exphbs.create({ extname: ".hbs" });
app.engine(".hbs", handlebars.engine);
app.set("view engine", ".hbs");

// Conectanding
const pool = mysql.createPool({
    connectionLimit: 10,
    host:'localhost',
    user: 'root',
    password: 'sakura3545',
    database: 'userprofile'

});

pool.getConnection((err, connection) =>{
    if(err) throw err; // no conecto
    console.log('Connected');
});


app.get("", (req, res) => {
    // res.render("index");
    pool.getConnection((err, connection) =>{
        if (err) throw err; // no conecto
        console.log('Conectado');

        connection.query('SELECT * FROM user WHERE id = "1"', (err, rows)=>{
            // Cuando finiquita que corte
            connection.release();
                if (!err) {
                    res.render('index',{rows});
                }
        });
    });
});

app.post("", (req, res) => {
    let sampleFile;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("No se subio ningun archivo");
    }

    //El nombre del input es sampleFile
    sampleFile = req.files.sampleFile;
    uploadPath = __dirname + '/upload/' + sampleFile.name;
    console.log(sampleFile);

    //Usar mv() para poner un archivo en el servidor
    sampleFile.mv(uploadPath, function(err){
        if(err) return res.status(500).send(err);

        res.send('Archivo subido');

    });

});

app.listen(port, () => console.log(`Listening on port ${port}`));
