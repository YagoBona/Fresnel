
document.getElementById('fresnelForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const distancia = document.getElementById('distancia').value;
    const unidad_distancia = document.getElementById('unidad_distancia').value;
    const frecuencia = document.getElementById('frecuencia').value;
    const unidad_frecuencia = document.getElementById('unidad_frecuencia').value;
    const altura_obstaculo = document.getElementById('altura_obstaculo').value;
    // Eliminado comparar_frecuencias
    const payload = {
        distancia,
        unidad_distancia,
        frecuencia,
        unidad_frecuencia,
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
    document.getElementById('resultado').innerHTML = `<b>Radio de la zona de Fresnel:</b> ${formatNum(res.fresnel)} m<br>
        <b>Pérdida por espacio libre:</b> ${res.perdida_espacio_libre !== null ? formatNum(res.perdida_espacio_libre) : 'N/A'} dB<br>
        <b>Obstáculo:</b> ${res.altura_obstaculo ? formatNum(res.altura_obstaculo) + ' m' : 'No especificado'}<br>
        <b>¿Obstruye?</b> ${res.obstaculo_afecta ? 'Sí' : 'No'}`;
    // Mostrar siempre el porcentaje de obstrucción
    let porcentaje = '';
    if (res.altura_obstaculo && res.fresnel) {
        porcentaje = ` Porcentaje de obstrucción: ${((res.altura_obstaculo / res.fresnel) * 100).toFixed(1)}%.`;
    }
    if (res.obstaculo_afecta && res.altura_obstaculo && res.fresnel) {
        document.getElementById('explicacion').innerHTML = `<span style=\"color:red;font-weight:bold;\">No debería funcionar: la obstrucción supera el 40% del radio de Fresnel. El enlace está afectado.${porcentaje}</span>`;
    } else {
        document.getElementById('explicacion').innerHTML = res.explicacion + porcentaje;
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

    ctx.beginPath();
    ctx.moveTo(0, alto / 2);
    ctx.lineTo(ancho, alto / 2);
    ctx.strokeStyle = "#ccc";
    ctx.stroke();

    // Ajuste: el radio máximo de fresnel que se puede mostrar
    // será el 40% de la altura del canvas
    const radioMaxVisual = alto * 0.4;
    // Suponemos que el valor máximo de fresnel a mostrar razonablemente es 50m
    // (puedes ajustar este valor según tus necesidades)
    const fresnelMax = 50;
    // Escalamos el radio visualmente
    const radioVisual = Math.max(5, Math.min(radioMaxVisual, (fresnel / fresnelMax) * radioMaxVisual));

    ctx.beginPath();
    ctx.ellipse(ancho / 2, alto / 2, ancho / 2 - 40, radioVisual, 0, 0, 2 * Math.PI);
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
