document.getElementById('fresnelForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const distancia = document.getElementById('distancia').value;
    const unidad_distancia = document.getElementById('unidad_distancia').value;
    const frecuencia = document.getElementById('frecuencia').value;
    const unidad_frecuencia = document.getElementById('unidad_frecuencia').value;
    const altura_obstaculo = document.getElementById('altura_obstaculo').value;
    const comparar_frecuencias = document.getElementById('comparar_frecuencias').value
        .split(',').map(f => f.trim()).filter(f => f.length > 0);

    const payload = {
        distancia,
        unidad_distancia,
        frecuencia,
        unidad_frecuencia,
        altura_obstaculo,
        comparar_frecuencias
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
    document.getElementById('resultado').innerHTML = `<b>Radio de la zona de Fresnel:</b> ${res.fresnel} m<br>
        <b>Pérdida por espacio libre:</b> ${res.perdida_espacio_libre ?? 'N/A'} dB<br>
        <b>Obstáculo:</b> ${res.altura_obstaculo ? res.altura_obstaculo + ' m' : 'No especificado'}<br>
        <b>¿Obstruye?</b> ${res.obstaculo_afecta ? 'Sí' : 'No'}`;
    document.getElementById('explicacion').innerText = res.explicacion;

    let compHtml = '';
    if (res.comparaciones && res.comparaciones.length > 0) {
        compHtml = '<b>Comparación de radios de Fresnel:</b><ul>';
        res.comparaciones.forEach(c => {
            compHtml += `<li>Frecuencia: ${c.frecuencia} ${unidad_frecuencia} → Radio: ${c.fresnel} m</li>`;
        });
        compHtml += '</ul>';
    }
    document.getElementById('comparaciones').innerHTML = compHtml;

    let histHtml = '<b>Historial de cálculos:</b><ol>';
    data.historial.forEach(h => {
        histHtml += `<li>${h.distancia} ${h.unidad_distancia}, ${h.frecuencia} ${h.unidad_frecuencia} → ${h.fresnel} m</li>`;
    });
    histHtml += '</ol>';
    document.getElementById('historial').innerHTML = histHtml;

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

    ctx.beginPath();
    ctx.moveTo(0, alto / 2);
    ctx.lineTo(ancho, alto / 2);
    ctx.strokeStyle = "#ccc";
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(ancho / 2, alto / 2, ancho / 2 - 40, fresnel * 5, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = "#3498db";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "rgba(52, 152, 219, 0.2)";
    ctx.fill();

    ctx.fillStyle = "#2c3e50";
    ctx.font = "16px sans-serif";
    ctx.fillText(`Distancia: ${distanciaKm} km`, 10, 20);
    ctx.fillText(`Radio Fresnel: ${fresnel} m`, 10, 40);
}
