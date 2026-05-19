const express = require("express");
const { enviarContacto } = require("../controllers/contactosController");

const router = express.Router();

router.post("/contacto", enviarContacto);

module.exports = router;
