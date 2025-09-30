from flask import Flask, render_template, request, jsonify, session
import math
from collections import deque

app = Flask(__name__)
app.secret_key = 'supersecretkey'

@app.route('/borrar_historial', methods=['POST'])
def borrar_historial():
    session['historial'] = []
    return jsonify({'mensaje': 'Historial borrado'})

app = Flask(__name__)
app.secret_key = 'supersecretkey'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calcular', methods=['POST'])
def calcular():
    data = request.get_json()
    try:
        distancia = float(data.get('distancia', 0))
        unidad_distancia = data.get('unidad_distancia', 'km')
        frecuencia = float(data.get('frecuencia', 0))
        unidad_frecuencia = data.get('unidad_frecuencia', 'GHz')
        altura_antena_a = float(data.get('altura_antena_a', 0))
        altura_antena_b = float(data.get('altura_antena_b', 0))
        altura_obstaculo = float(data.get('altura_obstaculo', 0))
    except Exception:
        return jsonify({'error': 'Datos inválidos'}), 400

  
    if unidad_distancia == 'm':
        distancia_km = distancia / 1000.0
    else:
        distancia_km = distancia

    if unidad_frecuencia == 'MHz':
        frecuencia_GHz = frecuencia / 1000.0
    else:
        frecuencia_GHz = frecuencia

    # Fórmula según imagen: F1[m] = 8.656 * sqrt(D[km]/f[GHz])
    fresnel_raw = 8.656 * math.sqrt(distancia_km / frecuencia_GHz)
    fresnel = math.trunc(fresnel_raw * 1000) / 1000


    if frecuencia_GHz > 0 and distancia_km > 0:
        distancia_m = distancia_km * 1000
        frecuencia_MHz = frecuencia_GHz * 1000
        perdida_espacio_libre = 32.45 + 20 * math.log10(distancia_km) + 20 * math.log10(frecuencia_GHz)
    else:
        perdida_espacio_libre = None


    obstaculo_afecta = False
    advertencia_obstruccion = None
    porcentaje_obstruccion = 0
    if altura_obstaculo > 0 and fresnel > 0:
        altura_linea = (altura_antena_a + altura_antena_b) / 2
        limite_inferior = altura_linea - fresnel
        limite_superior = altura_linea + fresnel
        if altura_obstaculo >= limite_inferior:
            porcentaje_obstruccion = min(1.0, abs(altura_obstaculo - altura_linea) / fresnel)
            porcentaje_obstruccion_real = abs(altura_obstaculo - altura_linea) / fresnel * 100
            if porcentaje_obstruccion >= 0.4:
                obstaculo_afecta = True
                advertencia_obstruccion = f"Hay una obstrucción mayor o igual al 40% del radio de Fresnel, no funciona. Porcentaje de obstrucción: {porcentaje_obstruccion_real:.1f}%"
            else:
                advertencia_obstruccion = f"Funciona correctamente. Porcentaje de obstrucción: {porcentaje_obstruccion_real:.1f}%"
        else:
            porcentaje_obstruccion = 0
            advertencia_obstruccion = "Funciona correctamente. Porcentaje de obstrucción: 0%"

    explicacion = (
        f"La zona de Fresnel calculada es de {fresnel} m. "
        f"La pérdida por espacio libre es de {perdida_espacio_libre if perdida_espacio_libre else 'N/A'} dB. "
    )
    if advertencia_obstruccion:
        explicacion += f"\n{advertencia_obstruccion}"

    comparaciones = []
    comparaciones = [] 

    
    historial = session.get('historial', [])
    
    resultado = {
        'distancia': distancia,
        'unidad_distancia': unidad_distancia,
        'frecuencia': frecuencia,
        'unidad_frecuencia': unidad_frecuencia,
        'fresnel': fresnel,
        'perdida_espacio_libre': perdida_espacio_libre if perdida_espacio_libre else None,
        'altura_antena_a': altura_antena_a,
        'altura_antena_b': altura_antena_b,
        'altura_obstaculo': altura_obstaculo,
        'obstaculo_afecta': obstaculo_afecta,
        'porcentaje_obstruccion': (porcentaje_obstruccion*100) if porcentaje_obstruccion is not None else 0,
        'explicacion': explicacion,
    }
    historial.append(resultado)
    session['historial'] = historial[-10:]

    return jsonify({
        'resultado': resultado,
        'historial': session['historial']
    })

if __name__ == '__main__':
    app.run(debug=True)
