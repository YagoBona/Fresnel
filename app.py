from flask import Flask, render_template, request, jsonify, session
import math
from collections import deque

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
        altura_obstaculo = float(data.get('altura_obstaculo', 0))
        comparar_frecuencias = data.get('comparar_frecuencias', [])
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

    fresnel = 17.32 * math.sqrt(distancia_km / (4 * frecuencia_GHz))


    if frecuencia_GHz > 0 and distancia_km > 0:
        distancia_m = distancia_km * 1000
        frecuencia_MHz = frecuencia_GHz * 1000
        perdida_espacio_libre = 32.45 + 20 * math.log10(distancia_km) + 20 * math.log10(frecuencia_GHz)
    else:
        perdida_espacio_libre = None


    obstaculo_afecta = False
    if altura_obstaculo > 0 and fresnel > 0:
        if altura_obstaculo > fresnel:
            obstaculo_afecta = True

    explicacion = (
        f"La zona de Fresnel calculada es de {round(fresnel,2)} m. "
        f"La pérdida por espacio libre es de {round(perdida_espacio_libre,2) if perdida_espacio_libre else 'N/A'} dB. "
        f"{'El obstáculo afecta la zona de Fresnel.' if obstaculo_afecta else 'No hay obstrucción significativa.'}"
    )

    comparaciones = []
    for freq in comparar_frecuencias:
        try:
            freq_val = float(freq)
            fresnel_comp = 17.32 * math.sqrt(distancia_km / (4 * (freq_val/1000.0 if unidad_frecuencia=='MHz' else freq_val)))
            comparaciones.append({'frecuencia': freq_val, 'fresnel': round(fresnel_comp,2)})
        except:
            continue

    if 'historial' not in session:
        session['historial'] = []
    historial = session['historial']
    resultado = {
        'distancia': distancia,
        'unidad_distancia': unidad_distancia,
        'frecuencia': frecuencia,
        'unidad_frecuencia': unidad_frecuencia,
        'fresnel': round(fresnel,2),
        'perdida_espacio_libre': round(perdida_espacio_libre,2) if perdida_espacio_libre else None,
        'altura_obstaculo': altura_obstaculo,
        'obstaculo_afecta': obstaculo_afecta,
        'explicacion': explicacion,
        'comparaciones': comparaciones
    }
    historial.append(resultado)
    session['historial'] = historial[-10:] 

    return jsonify({
        'resultado': resultado,
        'historial': session['historial']
    })

if __name__ == '__main__':
    app.run(debug=True)
