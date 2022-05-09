const Equipos = require("../models/equipos.model");
const Ligas = require("../models/ligas.model");
const Usuarios = require("../models/usuarios.model");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const PdfkitConstruct = require("pdfkit-construct");

function listarEquiposLiga(req, res) {
    var idLiga;
    var UsuarioCreador;
  
    if (req.user.rol == "ADMIN") {
      idLiga = req.params.idLiga;
      UsuarioCreador = req.params.idCreador;
    } else if (req.user.rol == "Usuario") {
      UsuarioCreador = req.user.sub;
      idLiga = req.params.idLiga;
    }
    Ligas.findById({ _id: idLiga }, (err, equipoEncontrado) => {
      if (
        req.user.rol == "Usuario" &&
        equipoEncontrado.UsuarioCreador != req.user.sub
      )
        return res.status(500).send({ message: "No perteneces a esta liga" });
  
      Equipos.find({ Liga: idLiga }, (err, equipoRecibido) => {
        if (err) return res.status(500).send({ message: "Ocurrio un error, intenta de nuevo" });
        if (!equipoRecibido)
          return res
            .status(500)
            .send({ message: "No se pudo eliminar el equipo" });
  
        return res.status(200).send({ Equipo: equipoRecibido });
      }).sort({
        pts: -1,
      });
    });
  }
  
  
function crearEquipo(req, res) {
    var parametros = req.body;
    var idLiga;
    var UsuarioCreador;
    var equipoModel = new Equipos();
  
    if (req.user.rol == "ADMIN") {
      idLiga = req.params.idLiga;
      UsuarioCreador = req.params.idCreador;
    } else if (req.user.rol == "Usuario") {
      UsuarioCreador = req.user.sub;
      idLiga = req.params.idLiga;
    }
    Ligas.findById({ _id: idLiga }, (err, ligaEncontradas) => {
      if (!ligaEncontradas)
        return res.status(500).send({ message: "No se encontro ninguna liga, intenta de nuevo" });
  
      Usuarios.findOne(
        { _id: ligaEncontradas.UsuarioCreador },
        (err, usuarioEncontrado) => {
          UsuarioCreador = usuarioEncontrado._id;
  
          if (req.user.rol == "Usuario" && usuarioEncontrado._id != req.user.sub)
            return res.status(500).send({ message: "No perteneces a esta liga" });
  
          Equipos.find({ Liga: idLiga }, (err, ligaEncontradas) => {
            if (!ligaEncontradas)
              return res.status(500).send({ message: "No se ha encontrado la liga, intenta de nuevo" });
  
            if (ligaEncontradas.length >= 10)
              return res
                .status(500)
                .send({ message: "Esta liga ya tiene 10 equipos, intenta de nuevo" });
  
            if (parametros.nombreEquipo) {
              equipoModel.nombreEquipo = parametros.nombreEquipo;
              equipoModel.golesFavor = 0;
              equipoModel.golesContra = 0;
              equipoModel.diferenciaGoles = 0;
              equipoModel.cantidadJugados = 0;
              equipoModel.pts = 0;
              equipoModel.Liga = idLiga;
              equipoModel.UsuarioCreador = UsuarioCreador;//duda idUsuario(?)
  
              Equipos.findOne(
                {
                  nombreEquipo: parametros.nombreEquipo,
                  Liga: req.params.idLiga,
                },
                (err, nombreEncontrado) => {
                  if (nombreEncontrado == null) {
                    equipoModel.save((err, equipoGuardado) => {
                      if (err)
                        return res
                          .status(500)
                          .send({ mensaje: "Error en la peticion" });
                      if (!equipoGuardado)
                        return res
                          .status(404)
                          .send({ mensaje: "No se han encontrado los equipos" });
  
                      return res.status(200).send({ equipo: equipoGuardado });
                    });
                  } else {
                    return res
                      .status(500)
                      .send({
                        mensaje: "El equipo ya se ha registrado en una liga, prueba con otro",});
                  }
                }
              );
            } else {
              return res
                .status(500)
                .send({ mensaje: "Error, debe asignar nombre al equipo" });
            }
          });
        }
      );
    });
  }
  
  function editarEquipo(req, res) {
    var parametros = req.body;
    var idLiga;
    var UsuarioCreador;
    var idEquipo = req.params.idEquipo;
  
    if (req.user.rol == "ADMIN") {
      idLiga = req.params.idLiga;
      UsuarioCreador = req.params.idCreador;
    } else if (req.user.rol == "Usuario") {
      UsuarioCreador = req.user.sub;
      idLiga = req.params.idLiga;
    }
    Equipos.findById({ _id: idEquipo }, (err, equipoEncontrado) => {
      if (
        req.user.rol == "Usuario" &&
        equipoEncontrado.UsuarioCreador != req.user.sub
      )
        return res.status(500).send({ mensaje: "No perteneces a esta liga" });
  
      Equipos.findOne(
        { nombreEquipo: parametros.nombreEquipo, Liga: idLiga },
        (err, equipoEncontrado) => {
          if (equipoEncontrado == null) {
            Equipos.findByIdAndUpdate(
              { _id: idEquipo, UsuarioCreador: UsuarioCreador },
              parametros,
              { new: true },
              (err, equipoActualizado) => {
                if (err)
                  return res.status(500).send({ mensaje: "Ocurrio un error, intenta de nuevo" });
                if (!equipoActualizado)
                  return res
                    .status(500)
                    .send({ mensaje: "No se actulizo el equipo, intenta de nuevo" });
  
                return res.status(200).send({ Equipo: equipoActualizado });
              }
            );
          } else {
            return res.status(500).send({ mensaje: "El equipo ya se ha registrado en una liga, prueba con otro" });
          }
        }
      );
    });
  }  
  
  function eliminarEquipo(req, res) {
    var idLiga;
    var UsuarioCreador;
    var idEquipo = req.params.idEquipo;
  
    if (req.user.rol == "ADMIN") {
      idLiga = req.params.idLiga;
      UsuarioCreador = req.params.idCreador;
    } else if (req.user.rol == "Usuario") {
      UsuarioCreador = req.user.sub;
      idLiga = req.params.idLiga;
    }
    Equipos.findById({ _id: idEquipo }, (err, equipoEncontrado) => {
      if (
        req.user.rol == "Usuario" &&
        equipoEncontrado.UsuarioCreador != req.user.sub
      )
        return res.status(500).send({ message: "No perteneces a esta liga" });
  
      Equipos.findByIdAndDelete(
        { _id: idEquipo, UsuarioCreador: UsuarioCreador },
        { new: true },
        (err, equipoEliminado) => {
          if (err) return res.status(500).send({ message: "Ocurrio un error, intenta de nuevo" });
          if (!equipoEliminado)
            return res
              .status(500)
              .send({ message: "No se ha podido elminar el equipo, intenta de nuevo" })
  
          return res.status(200).send({ Equipo: equipoEliminado });
        }
      );
    });
  }
    
  function listarEquiposLigaPDF(req, res) {
    var idLiga;
    var UsuarioCreador;
                        //ADMIN
    if (req.user.rol == "Admin") {
      idLiga = req.params.idLiga;
      UsuarioCreador = req.params.idCreador;
    } else if (req.user.rol == "Usuario") {
      UsuarioCreador = req.user.sub;
      idLiga = req.params.idLiga;
    }
    Ligas.findById({ _id: idLiga }, (err, equipoEncontrado) => {
      if (
        req.user.rol == "Usuario" &&
        equipoEncontrado.UsuarioCreador != req.user.sub
      )
        return res.status(500).send({ message: "Este equipo no te pertenece" });
  
      Equipos.find({ Liga: idLiga }, (err, equipoEliminado) => {
        if (err) return res.status(500).send({ message: "Ocurrio un error" });
        if (!equipoEliminado)
          return res
            .status(500)
            .send({ message: "No se pudo eliminar el equipo" });
        geenerarPDF(equipoEliminado, equipoEncontrado);
      }).sort({
        pts: -1,
      });
    });
  }
function geenerarPDF(equipoEliminado, equipoEncontrado) {
    var hoy = new Date();
    var fecha =
      hoy.getDate() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getFullYear();
  
    const doc = new PdfkitConstruct({
      size: "A4",
      margins: { top: 20, left: 10, right: 10, bottom: 20 },
      bufferPages: true,
    });
  
    doc.setDocumentHeader({}, () => {
      doc
        .lineJoin("miter")
        .rect(0, 0, doc.page.width, doc.header.options.heightNumber)
        .fill("#bf0418");//ENCABEZADO
  
      doc
        .fill("#000000")//blue to redingxd
        .fontSize(20)
        .text(equipoEncontrado.nombreLiga, doc.header.x, doc.header.y, { align: 'center'});
    });
 
    doc.setDocumentFooter({}, () => {
      doc
        .lineJoin("miter")
        .rect(0, doc.footer.y, doc.page.width, doc.footer.options.heightNumber)
        .fill("#bf0418");//verde cambiado a  rojardo
      doc
        .fill("#000000")//morado a negro
        .fontSize(8)
        .text("Copyright © 2022 PDFDOCUMENTS ", doc.footer.x, doc.footer.y + 10, { align: 'center'});
    });
  
    let i;
    const invoiceTableTop = 300;
  
    doc.font("Helvetica-BoldOblique").fontSize(15).fillColor("#690a14");
    filaRegistro(
      doc,
      invoiceTableTop,
      "Equipo",
      "Goles favor",
      "Goles contra",
      "Diferencia Goles",
      "Partidos Jugados",
      "Puntos"
    );
    separadorSubtitulos(doc, invoiceTableTop + 20);
    doc.font("Helvetica").fontSize(10).fillColor("black");
  
    if (equipoEliminado.length == 0) {
      for (i = 0; i < 1; i++) {
        const position = invoiceTableTop + (i + 1) * 30;
        filaRegistro(
          doc,
          position,
          "*NOTA: No existen equipos en la Liga",
          "",
          "",
          ""
        );
  
        separadorRegistros(doc, position + 30);
      }
    } else {
      for (i = 0; i < equipoEliminado.length; i++) {
        const item = equipoEliminado[i];
        const position = invoiceTableTop + (i + 1) * 50;
  
        filaRegistro(
          doc,
          position,
          item.nombreEquipo,
          item.golesFavor,
          item.golesContra,
          item.diferenciaGoles,
          item.cantidadJugados,
          item.pts
        );
  
        separadorRegistros(doc, position + 30);
      }
    }
  
    doc.render();
    doc.pipe(
      fs.createWriteStream(
        "pdfs/" + equipoEncontrado.nombreLiga + " " + fecha + ".pdf"
      )
    );
    doc.end();
  }
  function separadorRegistros(doc, y) {
    doc
      .strokeColor("#B2BABB")//blanco(??)
      .lineWidth(0.5)
      .moveTo(15, y)
      .lineTo(580, y)
      .stroke();
  }
  function filaRegistro(
    doc,
    y,
    nombreEquipo,
    golesFavor,
    golesContra,
    diferenciaGoles,
    cantidadJugados,
    pts
  ) {
    doc
      .fontSize(10)
      .text(nombreEquipo, 25, y)
      .text(golesFavor, 95, y)
      .text(golesContra, 160, y)
      .text(diferenciaGoles, 250, y)
      .text(cantidadJugados, 390, y)
      .text(pts, 506, y);
  }
  
  function separadorSubtitulos(doc, y) {
    doc.strokeColor("#17202A").lineWidth(2).moveTo(15, y).lineTo(580, y).stroke();
  }  

  module.exports = {
    listarEquiposLiga,
    crearEquipo,
    editarEquipo,
    eliminarEquipo,
    listarEquiposLigaPDF
  };  