var Fn = {
  // Valida el rut con su cadena completa "XXXXXXXX-X"
  validaRut: function (rutCompleto) {
    rutCompleto = rutCompleto.replace("‐", "-");
    if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rutCompleto))
      return false;
    var tmp = rutCompleto.split('-');
    var digv = tmp[1];
    var rut = tmp[0];
    if (digv == 'K') digv = 'k';

    return (Fn.dv(rut) == digv);
  },
  dv: function (T) {
    var M = 0,
      S = 1;
    for (; T; T = Math.floor(T / 10))
      S = (S + T % 10 * (9 - M++ % 6)) % 11;
    return S ? S - 1 : 'k';
  }
}

function escapeHTML(text) {
  var element = document.createElement('div');
  element.innerText = text;
  return element.innerHTML;
}

function buscarEmpleado() {
  const rut = document.getElementById('rut').value.trim();

  if (!Fn.validaRut(rut)) {
    // Rut inválido, mostrar mensaje de error
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.textContent = 'El Rut no es válido.';

    return; // Salir de la función si el Rut es inválido
  }

  // Realizar la lectura del archivo CSV
  fetch('encuestadores.csv')
    .then(response => response.text())
    .then(data => {
      // Parsear el contenido CSV
      const filas = data.split('\n');
      const empleados = filas.map(fila => fila.split(','));

      // Buscar al empleado por su RUT
      const empleadoEncontrado = empleados.find(empleado => empleado[0] === rut);

      // Mostrar el resultado
      const resultadoDiv = document.getElementById('resultado');
      if (empleadoEncontrado) {
        const nombreEmpleado = empleadoEncontrado[1];
        const imagenEmpleado = empleadoEncontrado[6]; // Supongamos que la columna de imagen es la posición 6

        resultadoDiv.innerHTML = `
          <div class="empleado-encontrado">
            <img src="${imagenEmpleado}" alt="Imagen del empleado" class="imagen-empleado">
            <div class="info-empleado">
              <h3>Empleado encontrado:</h3>
              <h2>${nombreEmpleado} ${empleadoEncontrado[2]}</h2>
            </div>
          </div>
        `;

      

        const proyectosEmpleado = empleados.filter(empleado => empleado[0] === rut);
        const currentDate = new Date();

        const proyectosActivos = proyectosEmpleado.filter(proyecto => {
          const fechaTermino = new Date(proyecto[5]);
          return currentDate <= fechaTermino;
        });

        if (proyectosActivos.length > 0) {
          resultadoDiv.innerHTML += `
            <h2>Proyectos activos</h2>
            <table>
              <thead>
                <tr>
                  <th>Nombre Proyecto</th>
                  <th>Fecha Inicio Proyecto</th>
                  <th>Fecha Termino Proyecto</th>
                </tr>
              </thead>
              <tbody>
                ${proyectosActivos.map(proyecto => `
                  <tr>
                    <td>${proyecto[3]}</td>
                    <td>${new Date(proyecto[4]).toLocaleDateString()}</td>
                    <td>${new Date(proyecto[5]).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <hr>
          `;
        } else {
          resultadoDiv.innerHTML += `
            <p>No se encontraron proyectos activos.</p>
            <hr>
          `;
        }

        const proyectosExpirados = proyectosEmpleado.filter(proyecto => {
          const fechaTermino = new Date(proyecto[5]);
          return currentDate > fechaTermino;
        });

        if (proyectosExpirados.length > 0) {
          resultadoDiv.innerHTML += `
            <h2>Proyectos en los que trabajo:</h2>
            <table>
              <thead>
                <tr>
                  <th>  Nombre Proyecto  </th>
                  <th>  Fecha Inicio Proyecto  </th>
                  <th>Fecha Termino Proyecto  </th>
                </tr>
              </thead>
              <tbody>
                ${proyectosExpirados.map(proyecto => `
                  <tr>
                    <td>${proyecto[3]}</td>
                    <td>${new Date(proyecto[4]).toLocaleDateString()}</td>
                    <td>${new Date(proyecto[5]).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        } else {
          resultadoDiv.innerHTML += `
            <p>No se encontraron proyectos anteriormente.</p>
          `;
        }
      } else {
        resultadoDiv.textContent = 'No se encontró al empleado.';
      }
    })
    .catch(error => {
      console.error(error);
    });
}
function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Meses en JavaScript son base 0
  const year = date.getFullYear().toString();

  return `${day}/${month}/${year}`;
}


function isProjectActive(currentDate, endDate) {
  return currentDate <= endDate;
}


function limpiarBusqueda() {
  // Limpiar el campo de entrada
  document.getElementById('rut').value = '';

  // Borrar el contenido del resultado
  document.getElementById('resultado').innerHTML = '';
}