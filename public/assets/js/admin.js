// Simulador MySQL con localStorage

function getDB(key) { 
    return JSON.parse(localStorage.getItem('laboris_db_' + key) || '[]'); 
}

function setDB(key, data) { 
    localStorage.setItem('laboris_db_' + key, JSON.stringify(data)); 
}

function nextId(key) { 
    const data = getDB(key); 
    return data.length > 0 ? Math.max(...data.map(r => r.id)) + 1 : 1; 
}

function renderAll() {
    renderTable('clientes', ['id', 'nombre', 'email', 'celular', 'fecha_registro']);
    renderTable('expedientes', ['id', 'numero', 'caratula', 'estado', 'etapa', 'fecha', 'cliente_id']);
    renderTable('consultas', ['id', 'nombre', 'email', 'celular', 'tipo_consulta', 'mensaje', 'fecha_envio']);
}

function renderTable(table, columns) {
    const data = getDB(table);
    const tbody = document.getElementById('tbody-' + table);
    const countEl = document.getElementById('count-' + table);
    const rowEl = document.getElementById('row-' + table);

    countEl.textContent = `(${data.length} rows)`;
    rowEl.textContent = `SELECT * FROM ${table}; -- ${data.length} row(s) returned`;

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
            let val = row[col] !== null && row[col] !== undefined ? row[col] : 'NULL';
            if (col === 'mensaje' && val.length > 50) val = val.substring(0, 50) + '...';
            td.textContent = val;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

function addCliente() {
    const nombre = document.getElementById('cli-nombre').value.trim();
    const email = document.getElementById('cli-email').value.trim();
    const celular = document.getElementById('cli-celular').value.trim();
    
    if (!nombre || !email) { alert('nombre y email son NOT NULL'); return; }

    const data = getDB('clientes');
    data.push({ 
        id: nextId('clientes'), 
        nombre, email, celular, 
        fecha_registro: new Date().toISOString().replace('T', ' ').substring(0, 19) 
    });
    
    setDB('clientes', data);
    document.getElementById('cli-nombre').value = '';
    document.getElementById('cli-email').value = '';
    document.getElementById('cli-celular').value = '';
    renderAll();
}

function addExpediente() {
    const numero = document.getElementById('exp-numero').value.trim();
    const caratula = document.getElementById('exp-caratula').value.trim();
    const estado = document.getElementById('exp-estado').value.trim();
    const etapa = document.getElementById('exp-etapa').value.trim();
    const fecha = document.getElementById('exp-fecha').value;
    const cliente_id = document.getElementById('exp-cliente_id').value.trim();
    
    if (!numero || !estado) { alert('numero y estado son NOT NULL'); return; }

    const data = getDB('expedientes');
    if (data.find(r => r.numero === numero)) { alert('ERROR: Duplicate entry para numero (UNIQUE)'); return; }

    data.push({ 
        id: nextId('expedientes'), 
        numero, caratula, estado, etapa, fecha, 
        cliente_id: cliente_id ? parseInt(cliente_id) : null 
    });
    
    setDB('expedientes', data);
    ['exp-numero','exp-caratula','exp-estado','exp-etapa','exp-fecha','exp-cliente_id'].forEach(id => document.getElementById(id).value = '');
    renderAll();
}

function addConsulta() {
    const nombre = document.getElementById('con-nombre').value.trim();
    const email = document.getElementById('con-email').value.trim();
    const celular = document.getElementById('con-celular').value.trim();
    const tipo = document.getElementById('con-tipo').value.trim();
    const mensaje = document.getElementById('con-mensaje').value.trim();
    
    if (!nombre || !email) { alert('nombre y email son NOT NULL'); return; }

    const data = getDB('consultas');
    data.push({ 
        id: nextId('consultas'), 
        nombre, email, celular, 
        tipo_consulta: tipo, 
        mensaje, 
        fecha_envio: new Date().toISOString().replace('T', ' ').substring(0, 19) 
    });
    
    setDB('consultas', data);
    ['con-nombre','con-email','con-celular','con-tipo','con-mensaje'].forEach(id => document.getElementById(id).value = '');
    renderAll();
}

function clearAll() {
    if (confirm('DROP DATABASE laboris_db; -- ¿Borrar todas las tablas?')) {
        localStorage.removeItem('laboris_db_clientes');
        localStorage.removeItem('laboris_db_expedientes');
        localStorage.removeItem('laboris_db_consultas');
        renderAll();
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', renderAll);
