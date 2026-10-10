// ============================================
// Simulador MySQL con localStorage - Laboris DB
// ============================================

// ---------- Capa de "base de datos" ----------
function getDB(key) {
    try {
        return JSON.parse(localStorage.getItem('laboris_db_' + key) || '[]');
    } catch (e) {
        console.error('Error parseando DB:', key, e);
        return [];
    }
}

function setDB(key, data) {
    localStorage.setItem('laboris_db_' + key, JSON.stringify(data));
}

function nextId(key) {
    const data = getDB(key);
    if (data.length === 0) return 1;
    const ids = data.map(r => Number(r.id)).filter(n => !isNaN(n));
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}

// ---------- Render ----------
function renderAll() {
    renderTable('clientes',    ['id', 'nombre', 'email', 'celular', 'fecha_registro']);
    renderTable('expedientes', ['id', 'numero', 'caratula', 'estado', 'etapa', 'fecha', 'cliente_id']);
    renderTable('consultas',   ['id', 'nombre', 'email', 'celular', 'tipo_consulta', 'mensaje', 'fecha_envio']);
}

function renderTable(table, columns) {
    const data     = getDB(table);
    const tbody    = document.getElementById('tbody-' + table);
    const countEl  = document.getElementById('count-' + table);
    const rowEl    = document.getElementById('row-' + table);

    if (!tbody) return;

    if (countEl) countEl.textContent = `(${data.length} rows)`;
    if (rowEl)   rowEl.textContent   = `SELECT * FROM ${table}; -- ${data.length} row(s) returned`;

    tbody.innerHTML = '';

    if (data.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = columns.length;
        td.style.textAlign = 'center';
        td.style.color = '#666';
        td.textContent = 'Tabla vacía';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    data.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            let val = row[col];
            if (val === null || val === undefined || val === '') val = 'NULL';
            if (col === 'mensaje' && typeof val === 'string' && val.length > 50) {
                val = val.substring(0, 50) + '...';
            }
            td.textContent = val;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// ---------- Helpers ----------
function nowSQL() {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

function clearInputs(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

// ---------- INSERT clientes ----------
function addCliente() {
    const nombre  = document.getElementById('cli-nombre').value.trim();
    const email   = document.getElementById('cli-email').value.trim();
    const celular = document.getElementById('cli-celular').value.trim();

    if (!nombre || !email) {
        alert('ERROR 1048: Column \'nombre\' y \'email\' cannot be null');
        return;
    }

    const data = getDB('clientes');
    data.push({
        id: nextId('clientes'),
        nombre,
        email,
        celular: celular || null,
        fecha_registro: nowSQL()
    });

    setDB('clientes', data);
    clearInputs(['cli-nombre', 'cli-email', 'cli-celular']);
    renderAll();
}

// ---------- INSERT expedientes ----------
function addExpediente() {
    const numero     = document.getElementById('exp-numero').value.trim();
    const caratula   = document.getElementById('exp-caratula').value.trim();
    const estado     = document.getElementById('exp-estado').value.trim();
    const etapa      = document.getElementById('exp-etapa').value.trim();
    const fecha      = document.getElementById('exp-fecha').value;
    const cliente_id = document.getElementById('exp-cliente_id').value.trim();

    if (!numero || !estado) {
        alert('ERROR 1048: Column \'numero\' y \'estado\' cannot be null');
        return;
    }

    const data = getDB('expedientes');

    // UNIQUE numero
    if (data.find(r => r.numero === numero)) {
        alert(`ERROR 1062: Duplicate entry '${numero}' for key 'numero' (UNIQUE)`);
        return;
    }

    // FK cliente_id -> clientes(id)
    let clienteIdFinal = null;
    if (cliente_id) {
        clienteIdFinal = parseInt(cliente_id, 10);
        const clientes = getDB('clientes');
        if (!clientes.find(c => Number(c.id) === clienteIdFinal)) {
            alert(`ERROR 1452: Cannot add or update a child row: a foreign key constraint fails (cliente_id=${clienteIdFinal} no existe en clientes)`);
            return;
        }
    }

    data.push({
        id: nextId('expedientes'),
        numero,
        caratula: caratula || null,
        estado,
        etapa: etapa || null,
        fecha: fecha || null,
        cliente_id: clienteIdFinal
    });

    setDB('expedientes', data);
    clearInputs(['exp-numero','exp-caratula','exp-estado','exp-etapa','exp-fecha','exp-cliente_id']);
    renderAll();
}

// ---------- INSERT consultas ----------
function addConsulta() {
    const nombre  = document.getElementById('con-nombre').value.trim();
    const email   = document.getElementById('con-email').value.trim();
    const celular = document.getElementById('con-celular').value.trim();
    const tipo    = document.getElementById('con-tipo').value.trim();
    const mensaje = document.getElementById('con-mensaje').value.trim();

    if (!nombre || !email) {
        alert('ERROR 1048: Column \'nombre\' y \'email\' cannot be null');
        return;
    }

    const data = getDB('consultas');
    data.push({
        id: nextId('consultas'),
        nombre,
        email,
        celular: celular || null,
        tipo_consulta: tipo || null,
        mensaje: mensaje || null,
        fecha_envio: nowSQL()
    });

    setDB('consultas', data);
    clearInputs(['con-nombre','con-email','con-celular','con-tipo','con-mensaje']);
    renderAll();
}

// ---------- DROP ALL ----------
function clearAll() {
    if (confirm('DROP DATABASE laboris_db; -- ¿Borrar todas las tablas?')) {
        localStorage.removeItem('laboris_db_clientes');
        localStorage.removeItem('laboris_db_expedientes');
        localStorage.removeItem('laboris_db_consultas');
        renderAll();
    }
}

// ---------- Init ----------
// Importante: NO se cargan datos por defecto.
// La DB arranca vacía. Si querés borrar cualquier residuo previo:
function initDB() {
    // Si querés forzar el vaciado al cargar (descomentar):
    // localStorage.removeItem('laboris_db_clientes');
    // localStorage.removeItem('laboris_db_expedientes');
    // localStorage.removeItem('laboris_db_consultas');
    renderAll();
}

document.addEventListener('DOMContentLoaded', initDB);
