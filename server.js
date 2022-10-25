const express = require('express');
const passport = require('./src/passportH');
const session = require('express-session');
//const session = require('cookie-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const minimist = require("minimist");
const advancedOptions = {useNewUrlParser: true, useUnifiedTopology: true};
const Routes = require('./src/routes');
const {engine} = require('express-handlebars');
const { Server: HttpServer } = require('http');       
const { Server: SocketServer } = require('socket.io');
const {Producto, Carritos} = require('./contenedor/dao/index.js');

const cluster = require('cluster');
const os = require('os');
const numberCPUs = os.cpus().length;

let producto = [];
let messages = [];
let carrito = [];
let credencial = {name: "lucas"};

const app = express();
//app.use(express.urlencoded({extended: true}));
app.use(express.static('public')); 
app.use(cookieParser());

//Necesario para que funcione passport
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 


const httpServer = new HttpServer(app);             
const socketServer = new SocketServer(httpServer);  
const argv = minimist(process.argv.slice(2), {alias: {"p": "port", 'm': 'modo'}, default: {'port':8080, 'modo': 'FORK'}})


//-------------- MODO FORK O CLUSTER ------------------
const processId = process.pid;
const isMaster = cluster.isMaster;
const PORT = process.env.PORT || 8080;

//console.log(`Proceso: ${processId} - isMaster: ${isMaster}`);

if (argv.modo == 'CLUSTER') {
    if (cluster.isMaster) {
        for (let i = 0; i < numberCPUs; i++) {
            cluster.fork()
        }
    } else {
        httpServer.listen(PORT, () => {
            console.log(`Escuchando en el puerto ${httpServer.address().port} en modo ${argv.modo}`);
        });
        httpServer.on("error", (error) => console.error(error, "error de conexión"));
    }
}
if (argv.modo == 'FORK') {
    httpServer.listen(PORT, () => {
        console.log(`Escuchando en el puerto ${httpServer.address().port} en modo ${argv.modo}`);
    });
    httpServer.on("error", (error) => console.error(error, "error de conexión"));
}

//------------------ SET SESSION -----------------------

app.use(session({

    /* store: MongoStore.create({
        mongoUrl: 'mongodb+srv://diego:Mongo2022@cluster1.jjt93.mongodb.net/?retryWrites=true&w=majority',
        mongoOptions: advancedOptions
      }), */
    secret: 'clave',
    resave: true,
    cookie: {
        maxAge: 600000
      },
    saveUninitialized: true
  }));

app.use(passport.initialize());
app.use(passport.session());

//------------------ SET HANDLEBARS -----------------------


app.set('view engine', 'hbs');
app.set('views', './views');

app.engine(
    'hbs',
    engine({
        extname: '.hbs'
    })
);

app.use('/', Routes);


//----------------------------------------------------------------

socketServer.on('connection', (socket) => {

    async function init(){
        
        producto = await Producto.getAll();
        carrito = await Carritos.getAll(credencial.name);
        console.log(carrito);
        socket.emit('new_event', producto, credencial.name, carrito);      
    }
    init();

    socket.on('nuevo_prod', (obj) => {

        async function ejecutarSaveShow(argObj) {
            await Producto.save(argObj);
            const result = await Producto.getAll();
            producto = result;
            socketServer.sockets.emit('new_event', producto, credencial.name);
        }
        ejecutarSaveShow(obj);
    });

    socket.on('add_prod', (prodId) => {

        async function ejecutar() {
            Producto.getByIdProd(prodId).then((producto) => {

                if (producto) {
                    Carritos.addProdChart(producto, credencial.name).then((result) => {
                        if (result){
                            console.log("200");
                            console.log(credencial.name);
                        }
                        else
                        console.log({ error: 'Carrito no encontrado' });
                    })
                } else {
                    console.log({ error: 'Producto no encontrado' });
                }
            });
            const result = await Producto.getAll();
            producto = result;
            carrito = await Carritos.getAll(credencial.name);
            socketServer.sockets.emit('new_event', producto, credencial.name, carrito);      
        }
        ejecutar();
    });
    socket.on('delete_prod', (prodId) => {
        async function ejecutar() {
            await Carritos.deleteByIdChart(credencial.name, prodId);
            const result = await Producto.getAll();
            producto = result;
            carrito = await Carritos.getAll(credencial.name);

            socketServer.sockets.emit('new_event', producto, credencial.name,carrito);
        }
        ejecutar();
    });
});

