const express = require("express");
const exphbs = require("express-handlebars");
const fileupload = require("express-fileupload");
const fs = require("fs");
const mysql = require("mysql2");

const app = express();
const port = process.env.PORT || 5000;
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const readline = require("readline");

// Default
app.use(
    fileupload({
        // Aca va la conf de imagenes.
    })
);

//Archivos estaticos
app.use(express.static("public"));
app.use(express.static("upload"));

// Pimpeando el motor
const handlebars = exphbs.create({ extname: ".hbs" });
app.engine(".hbs", handlebars.engine);
app.set("view engine", ".hbs");

// Conectanding
const pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "sakura3545",
    database: "userprofile",
});



pool.getConnection((err, connection) => {
    if (err) throw err; // no conecto
    console.log("Connected");
});

app.get("", (req, res) => {
    // res.render("index");
    pool.getConnection((err, connection) => {
        if (err) throw err; // no conecto
        console.log("Conectado");

        connection.query('SELECT * FROM user WHERE id = "1"', (err, rows) => {
            // Cuando finiquita que corte
            connection.release();
            if (!err) {
                res.render("index", { rows });
            }
        });
    });
});

app.post("/readcsv", (req, res) => {
    let sampleFile = req.files.sampleFile;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("No se subio ningun archivo");
    }

    uploadPath = __dirname + "/upload/" + sampleFile.name;

    sampleFile.mv(uploadPath, function (err) {

        if (err) return res.status(500).send(err);

        pool.getConnection(async (err, connection) => {
            if (err) throw err; // no conecto
            console.log("Conectado");
            let count = 0;

            const fileStream = fs.createReadStream(uploadPath);

            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity,
            });

            for await (const line of rl) {
                // Each line in input.txt will be successively available here as `line`.
                console.log(`Line from file: ${line}`);
                count++;
                if (count == 1) continue;

                const [name, title, desc] = line.split(";");

                connection.query(
                    "insert into user (name, job_title, description) values (?,?,?)",
                    [name, title, desc],
                    (err, rows) => {
                        // Cuando finiquita que corte

                        if (err) {
                            console.log(err);
                        }
                    }
                );

                //
                //aca podes insertar renglon por renglon directo en la db, o meterlo en un array y despues llamar a una funcion que hace la escritura.
                //para que quede mas ordenado

                //otra callback
            }
            connection.release();
            res.send("Archivo subido");
        });
    });
});

app.post("/profile", (req, res) => {
    let sampleFile = req.files.sampleFile;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("No se subio ningun archivo");
    }

    uploadPath = __dirname + "/upload/" + sampleFile.name;

    sampleFile.mv(uploadPath, async function (err) {
        //primer callback

        if (err) return res.status(500).send(err);

        pool.getConnection((err, connection) => {
            if (err) throw err; // no conecto
            console.log("Conectado");

            connection.query(
                'UPDATE user SET profile_image = ? WHERE id ="1"',
                [sampleFile.name],
                (err, rows) => {
                    // Cuando finiquita que corte
                    connection.release();
                    if (!err) {
                        res.redirect("/");
                    } else {
                        console.log(err);
                    }
                }
            );
        });

        //res.send('Archivo subido');
    });
});

app.listen(port, () =>
    console.log(`Listening on port http://localhost:${port}`)
);
