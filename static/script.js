document.getElementById('fresnelForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const distancia = document.getElementById('distancia').value;
    const unidad_distancia = document.getElementById('unidad_distancia').value;
    const frecuencia = document.getElementById('frecuencia').value;
    const unidad_frecuencia = document.getElementById('unidad_frecuencia').value;
    const altura_antena_a = document.getElementById('altura_antena_a').value;
    const altura_antena_b = document.getElementById('altura_antena_b').value;
    const altura_obstaculo = document.getElementById('altura_obstaculo').value;

    const payload = {
        distancia,
        unidad_distancia,
        frecuencia,
        unidad_frecuencia,
        altura_antena_a,
        altura_antena_b,
        altura_obstaculo
    };

    const response = await fetch('/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.error) {
        document.getElementById('resultado').innerText = data.error;
        return;
    }

    const res = data.resultado;
    function formatNum(n) {
        return (typeof n === 'number') ? n.toFixed(3) : n;
    }

    // Mostrar resultado base
    document.getElementById('resultado').innerHTML = `
        <b>Radio de la zona de Fresnel:</b> ${formatNum(res.fresnel)} m<br>
        <b>Pérdida por espacio libre:</b> ${res.perdida_espacio_libre !== null ? formatNum(res.perdida_espacio_libre) : 'N/A'} dB<br>
        <b>Obstáculo:</b> ${res.altura_obstaculo ? formatNum(res.altura_obstaculo) + ' m' : 'No especificado'}
    `;

    // Calcular porcentaje de obstruccion
    let porcentaje = 0;
    if (res.altura_obstaculo && res.fresnel) {
        porcentaje = ((res.altura_obstaculo / res.fresnel) * 100);
    }

    // Texto adicional de explicacion
    let textoExtra = `
        <br><br>
        <span style="color:#555;">
        La zona de Fresnel representa el espacio alrededor de la linea de vision directa por donde 
        tambien viajan las ondas de radio. <br>
        - Si la obstruccion supera el 40%, el enlace suele ser inestable o inutilizable. <br>
        - Si la obstruccion es menor o igual al 40%, el enlace puede funcionar, aunque entre el 20% y 40% 
          podria presentarse una reduccion en la calidad de la señal. <br>
        - Lo ideal es mantener la zona lo mas despejada posible (0% de obstruccion). 
        </span>
    `;

    // Evaluar si funciona o no
    if (porcentaje > 40) {
        document.getElementById('explicacion').innerHTML = 
            `<span style="color:red;font-weight:bold;">
            No funciona: la obstrucción es del ${porcentaje.toFixed(1)}% (>40%).
            </span>${textoExtra}`;
    } else if (porcentaje > 20) {
        document.getElementById('explicacion').innerHTML = 
            `<span style="color:orange;font-weight:bold;">
            Funciona parcialmente: la obstrucción es del ${porcentaje.toFixed(1)}% (entre 20% y 40%).
            Puede afectar la calidad del enlace.
            </span>${textoExtra}`;
    } else {
        document.getElementById('explicacion').innerHTML = 
            `<span style="color:green;font-weight:bold;">
            Funciona correctamente: la obstrucción es del ${porcentaje.toFixed(1)}% (≤20%).
            </span>${textoExtra}`;
    }

    graficarZonaFresnel(distancia, res.fresnel);
});

function graficarZonaFresnel(distanciaKm, fresnel) {
    const canvas = document.getElementById('grafico');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ancho = canvas.width;
    const alto = canvas.height;

    // Datos de antenas y obstáculo
    const altura_antena_a = parseFloat(document.getElementById('altura_antena_a').value) || 0;
    const altura_antena_b = parseFloat(document.getElementById('altura_antena_b').value) || 0;
    const altura_obstaculo = parseFloat(document.getElementById('altura_obstaculo').value) || 0;

    // Escalado vertical
    const maxAltura = 50;
    const escalaY = (alto * 0.8) / maxAltura;
    const baseY = alto * 0.9; // base del suelo

    // Suelo
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.lineTo(ancho, baseY);
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Antena A
    ctx.beginPath();
    ctx.moveTo(40, baseY);
    ctx.lineTo(40, baseY - altura_antena_a * escalaY);
    ctx.strokeStyle = "#27ae60";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#27ae60";
    ctx.beginPath();
    ctx.arc(40, baseY - altura_antena_a * escalaY, 7, 0, 2 * Math.PI);
    ctx.fill();

    // Antena B
    ctx.beginPath();
    ctx.moveTo(ancho - 40, baseY);
    ctx.lineTo(ancho - 40, baseY - altura_antena_b * escalaY);
    ctx.strokeStyle = "#27ae60";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#27ae60";
    ctx.beginPath();
    ctx.arc(ancho - 40, baseY - altura_antena_b * escalaY, 7, 0, 2 * Math.PI);
    ctx.fill();

    // Linea entre antenas
    ctx.beginPath();
    ctx.moveTo(40, baseY - altura_antena_a * escalaY);
    ctx.lineTo(ancho - 40, baseY - altura_antena_b * escalaY);
    ctx.strokeStyle = "#2980b9";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Obstáculo
    const obstaculoX = ancho / 2;
    ctx.beginPath();
    ctx.moveTo(obstaculoX, baseY);
    ctx.lineTo(obstaculoX, baseY - altura_obstaculo * escalaY);
    ctx.strokeStyle = "#e74c3c";
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.fillStyle = "#e74c3c";
    ctx.beginPath();
    ctx.arc(obstaculoX, baseY - altura_obstaculo * escalaY, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Zona de Fresnel (elipse)
    const altura_linea = (altura_antena_a + altura_antena_b) / 2;
    const centroY = baseY - altura_linea * escalaY;
    const radioMaxVisual = alto * 0.4;
    const fresnelMax = 50;
    const radioVisual = Math.max(5, Math.min(radioMaxVisual, (fresnel / fresnelMax) * radioMaxVisual));
    ctx.beginPath();
    ctx.ellipse(ancho / 2, centroY, ancho / 2 - 40, radioVisual, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = "#3498db";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "rgba(52, 152, 219, 0.2)";
    ctx.fill();

    // Etiquetas
    ctx.fillStyle = "#2c3e50";
    ctx.font = "16px sans-serif";
    ctx.fillText(`Distancia: ${distanciaKm} km`, 10, 20);
    ctx.fillText(`Radio Fresnel: ${fresnel} m`, 10, 40);
    ctx.fillText(`Antena A: ${altura_antena_a} m`, 10, 60);
    ctx.fillText(`Antena B: ${altura_antena_b} m`, 10, 80);
    ctx.fillText(`Obstáculo: ${altura_obstaculo} m`, 10, 100);
}
