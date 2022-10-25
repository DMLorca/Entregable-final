const socket = io(); 
let credencial = {name: "diego"};

const agregarProducto = () => {
  const title = document.getElementById("title").value; 
  const price = document.getElementById("price").value; 
  const thumbnail = document.getElementById("thumbnail").value; 
  const producto = { title, price, thumbnail };                   
  socket.emit('nuevo_prod', producto);                
  document.getElementById("title").value="";
  document.getElementById("price").value="";
  document.getElementById("thumbnail").value="";
  return false;                                       
}

const addProd = () => {
  const prodId = document.getElementById("prodId").value; 
                   
  socket.emit('add_prod', prodId);                
  document.getElementById("prodId").value="";

  return false;                                       
}

const deleteProd = () => {
  const prodId = document.getElementById("prodId2").value; 
                   
  socket.emit('delete_prod', prodId);                
  document.getElementById("prodId2").value="";

  return false;                                       
}


const renderPlantilla = (producto, cred, carrito) => {
  

  fetch('/templateBienvenido.hbs')
  .then((res) => res.text())
  .then((data) => {
  const template = Handlebars.compile(data);
  const html = template({cred: cred});
  document.getElementById('id_bienvenido').innerHTML = html;    
  })
  
  fetch('/templateTable.hbs')
  .then((res) => res.text())
  .then((data) => {
  const template = Handlebars.compile(data);
  const html = template({producto: producto, title: title, price: price, thumbnail: thumbnail});
  document.getElementById('id_del_div').innerHTML = html;    
  })

  fetch('/templateChart.hbs')
  .then((res) => res.text())
  .then((data) => {
  const templateChat = Handlebars.compile(data);
  const htmlChat = templateChat({ carrito: carrito});
  document.getElementById('id_del_div_chart').innerHTML = htmlChat;
  })

}

socket.on('new_event', (productos, cred, carrito) => renderPlantilla(productos, cred, carrito));