"""
Servidor FastAPI - Laboris Estudio Jurídico
Proyecto: Seminario de Actualización en Tecnología Web - IFTS N° 21
Base de datos: SQLite (laboris.db)
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sqlite3
import os

app = FastAPI(title="Laboris API", version="1.0.0")

# ============================================================
# [ZOE - Sprint 1 | 15/10/2026]
# Configuración de CORS para permitir peticiones desde el frontend
# ============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "laboris.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Permite acceder a columnas por nombre
    return conn

def init_db():
    """
    Inicializa la base de datos con las tablas del DER oficial.
    [JOSÉ - Sprint 1 | 15/10/2026] Creación de estructura según DER
    """
    conn = get_db()
    
    # Tabla Cliente (según DER)
    conn.execute("""CREATE TABLE IF NOT EXISTS cliente (
        id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_completo TEXT NOT NULL,
        dni TEXT UNIQUE,
        telefono TEXT,
        email TEXT
    )""")
    
    # Tabla Expediente (según DER)
    conn.execute("""CREATE TABLE IF NOT EXISTS expediente (
        id_expediente INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_expediente TEXT UNIQUE NOT NULL,
        caratula TEXT,
        tipo_caso TEXT,
        estado TEXT,
        fecha_audiencia DATE,
        juzgado TEXT,
        id_cliente INTEGER
    )""")
    
    # Tabla Consulta - formulario web de visitantes anónimos
    # [ZOE - Sprint 1 | 15/10/2026] Sin FK según DER: las consultas web no se vinculan directamente
    conn.execute("""CREATE TABLE IF NOT EXISTS consulta (
        id_consulta INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL,
        celular TEXT,
        tipo_consulta TEXT,
        mensaje TEXT,
        fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
        estado TEXT DEFAULT 'PENDIENTE'
    )""")
    
    # Datos de prueba para la demo
    conn.execute("""INSERT OR IGNORE INTO expediente (numero_expediente, caratula, tipo_caso, estado, fecha_audiencia, juzgado)
        VALUES ('12345/2026', 'González c/ Empresa XYZ', 'Despido', 'EN TRÁMITE', '2026-08-18', 'Juzgado Laboral N° 1')""")
    conn.execute("""INSERT OR IGNORE INTO expediente (numero_expediente, caratula, tipo_caso, estado, fecha_audiencia, juzgado)
        VALUES ('98765/2025', 'Martínez c/ Construcciones ABC', 'Accidente', 'SENTENCIA FAVORABLE', '2025-08-10', 'Juzgado Laboral N° 3')""")
    
    conn.commit()
    conn.close()

init_db()

# ============================================================
# [JOSÉ - Sprint 2 | 17/10/2026]
# Modelo Pydantic para validación de datos del formulario
# Alineado al DER: usa tipo_consulta y mensaje
# ============================================================
class ConsultaRequest(BaseModel):
    nombre: str
    email: str
    celular: Optional[str] = None
    tipo_consulta: Optional[str] = None
    mensaje: str

# ============================================================
# [ZOE - Sprint 3 | 19/10/2026]
# Endpoint de consulta de expediente
# Cambio: de ruta /api/expediente/{numero} a /api/expediente?numero=X
# Motivo: la barra "/" en números como "12345/2026" rompía la URL
# ============================================================
@app.get("/api/expediente")
def consultar_expediente(numero: str = Query(...)):
    """
    Consulta un expediente por número.
    Retorna 404 si no existe en la base de datos.
    """
    conn = get_db()
    cursor = conn.execute(
        "SELECT numero_expediente, estado, tipo_caso as etapa, caratula, fecha_audiencia as fecha FROM expediente WHERE numero_expediente = ?",
        (numero,)
    )
    resultado = cursor.fetchone()
    conn.close()
    
    if not resultado:
        raise HTTPException(status_code=404, detail="Expediente no encontrado")
    
    return dict(resultado)

# ============================================================
# [JOSÉ - Sprint 3 | 19/10/2026]
# Endpoint para recibir consultas del formulario web
# Guarda en tabla 'consulta' según DER (sin crear cliente automáticamente)
# ============================================================
@app.post("/api/contacto")
def enviar_consulta(datos: ConsultaRequest):
    """
    Recibe una consulta web anónima y la guarda en la tabla 'consulta'.
    Según el DER, NO se crea automáticamente un cliente ni expediente.
    Esa relación se establece manualmente cuando el estudio toma el caso.
    """
    conn = get_db()
    try:
        conn.execute(
            """INSERT INTO consulta (nombre, email, celular, tipo_consulta, mensaje, estado)
               VALUES (?, ?, ?, ?, ?, 'PENDIENTE')""",
            (datos.nombre, datos.email, datos.celular, datos.tipo_consulta, datos.mensaje)
        )
        conn.commit()
        return {"success": True, "message": "Consulta enviada con éxito"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# ============================================================
# [ZOE - Sprint 1 | 15/10/2026]
# Montaje del frontend estático (debe ir al final para no interceptar /api/*)
# ============================================================
app.mount("/", StaticFiles(directory="public", html=True), name="frontend")