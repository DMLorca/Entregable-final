
/* 
CONFIGURACION MONGODB
*/

const mongoose = require("mongoose");

//mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority

mongoose.connect(
  "mongodb+srv://diego:Mongo2022@cluster1.jjt93.mongodb.net/database?retryWrites=true&w=majority"
);

//mongoose.connect("mongodb://localhost:27017/database");

const carroSchema = new mongoose.Schema({
    user: { type: String, sparse: true },
    title: { type: String, sparse: true },
    description: { type: String, sparse: true },
    code: { type: String, sparse: true },
    timestamp: { type: String, sparse: true },
    stock: { type: Number, sparse: true },
    price: { type: Number, sparse: true },
    thumbnail: { type: String, sparse: true },
    id: { type: Number, sparse: true },
    idc: { type: Number, sparse: true }

})
const carro = mongoose.model("carrito", carroSchema);

const prodSchema = new mongoose.Schema({
    title: { type: String, sparse: true },
    description: { type: String, sparse: true },
    code: { type: String, sparse: true },
    timestamp: { type: String, sparse: true },
    stock: { type: Number, sparse: true },
    price: { type: Number, sparse: true },
    thumbnail: { type: String, sparse: true },
    id: { type: Number, sparse: true }
})
const producto = mongoose.model("producto", prodSchema);

const userSchema = new mongoose.Schema({

  email: { type: String, required: false },
  password: { type: String, sparse: true },
  name: { type: String, required: false },
  address: { type: String, sparse: true },
  age: { type: Number, sparse: true },
  celPhone: { type: Number, sparse: true },
  photo: { type: String, sparse: true }
})
const userModel = mongoose.model("user", userSchema);

module.exports = {carro, producto, userModel};
