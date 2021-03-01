var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var path = require("path");
var express = require("express");
var port = process.env.PORT || 5000;
fs = require("fs");

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

//Dandole acceso a las rutas para las imagenes
app.use(express.static("./tmp/uploads"));

//Se recibe por parametro el socket del usuario conectado
io.on("connection", function (socket) {
  let randomColor = ((Math.random() * 0xffffff) << 0)
    .toString(16)
    .padStart(6, "0");

  var clientIp = socket.request.connection;
  //console.log(clientIp)
  var address = socket.handshake.address;
  //console.log('El cliente con IP: ' + address.address + ' y puerto:' + address.port+ "se ha conectado");

  socket.on("message", function (msg) {
    /*Emito la informacion que me llego de dicho
     cliente
      a todos los clientes que esten conectados al servidor
      a todos sus html les va a llegar esta informacion que 
      estoy enviando
    */
    var address = socket.handshake.address;

    console.log(msg);
    io.emit("message", { ...msg, ip: address, color: randomColor });

    // console.log('El cliente con IP: ' + address.address + ' y puerto:' + address.port+ "emitió informacion");
  });
  socket.on(
    "image",
    async ({ name, fileImageName: nameImage, base64Image: image }) => {
      const imageWithoutBase64 = image.replace(/.*base64,/, "");

      var fs = require("fs");

      var fileName = __dirname + "/tmp/uploads/" + nameImage;
      console.log(fileName);
      fs.open(fileName, "a", 0755, function (err, fd) {
        if (err) throw err;

        fs.write(
          fd,
          imageWithoutBase64,
          null,
          "base64",
          function (err, written, buff) {
            fs.close(fd, function () {
              console.log("File saved successful!");
            });
          }
        );
      });

      io.emit("image", {
        name: name,
        image: image.toString("base64"),
        color: randomColor,
      });
    }
  );

  /*Cuando un socket se desconecta*/
  socket.on("disconnect", function () {
    console.log("user disconnected");
  });
});

http.listen(port, "0.0.0.0", function () {
  console.log("listening on *:" + port);
});
