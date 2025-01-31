require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Conectar a MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("📌 Conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error al conectar a MongoDB", err.message));

// Esquema y modelo de notificaciones
const notificationSchema = new mongoose.Schema({
  packageName: String,
  title: String,
  content: String,
  timestamp: Number,
});

const Notification = mongoose.model("Notification", notificationSchema);

// Ruta para recibir notificaciones
app.post("/api/notificaciones", async (req, res) => {
  try {
    const { packageName, title, content, timestamp } = req.body;
    if (!packageName || !title || !content || !timestamp) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const newNotification = new Notification({ packageName, title, content, timestamp });
    await newNotification.save();
    
    res.status(201).json({ message: "Notificación guardada" });
  } catch (error) {
    res.status(500).json({ error: "Error al guardar la notificación" });
  }
});

// Ruta para obtener todas las notificaciones
app.get("/api/notificaciones", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ timestamp: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
