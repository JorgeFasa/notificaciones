require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;


const corsOptions = {
  origin: "*", 
  methods: "GET,POST,DELETE",
  allowedHeaders: "Content-Type",
};
app.use(cors(corsOptions));
// Middleware
app.use(express.json());


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

// 📌 Ruta para recibir notificaciones
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

// 📌 Ruta para obtener todas las notificaciones
app.get("/api/notificaciones", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ timestamp: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
});

// 📌 Endpoint para eliminar una notificación por ID
app.delete("/api/notificaciones/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.json({ message: "Notificación eliminada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la notificación" });
  }
});

// 📌 Endpoint para eliminar todas las notificaciones
app.delete("/api/notificaciones", async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ message: "Todas las notificaciones eliminadas" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar las notificaciones" });
  }
});

// 📌 Función automática para eliminar notificaciones mayores a 24 horas
const eliminarNotificacionesAntiguas = async () => {
  try {
    const hace24Horas = Date.now() - 24 * 60 * 60 * 1000;
    await Notification.deleteMany({ timestamp: { $lt: hace24Horas } });
    console.log("🗑️ Notificaciones antiguas eliminadas automáticamente");
  } catch (error) {
    console.error("❌ Error al eliminar notificaciones antiguas", error);
  }
};

// Ejecutar cada hora
setInterval(eliminarNotificacionesAntiguas, 60 * 60 * 1000);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
