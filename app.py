from flask import Flask, render_template, request, jsonify, session
import math
from collections import deque

app = Flask(__name__)
app.secret_key = 'supersecretkey'

# ...existing code...


# ...existing code...

@app.route('/borrar_historial', methods=['POST'])
def borrar_historial():
    session['historial'] = []
    return jsonify({'mensaje': 'Historial borrado'})
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
    if altura_obstaculo > 0 and fresnel > 0:
        if altura_obstaculo > fresnel:
            obstaculo_afecta = True

    explicacion = (
        f"La zona de Fresnel calculada es de {fresnel} m. "
        f"La pérdida por espacio libre es de {perdida_espacio_libre if perdida_espacio_libre else 'N/A'} dB. "
        f"{'El obstáculo afecta la zona de Fresnel.' if obstaculo_afecta else 'No hay obstrucción significativa.'}"
    )

    comparaciones = []
    comparaciones = []  # Eliminado, no se calculan comparaciones

    # Siempre tomar el historial de la sesión, si no existe, crear uno vacío
    historial = session.get('historial', [])
    # Si el historial fue borrado, será una lista vacía
    resultado = {
        'distancia': distancia,
        'unidad_distancia': unidad_distancia,
        'frecuencia': frecuencia,
        'unidad_frecuencia': unidad_frecuencia,
        'fresnel': fresnel,
        'perdida_espacio_libre': perdida_espacio_libre if perdida_espacio_libre else None,
        'altura_obstaculo': altura_obstaculo,
        'obstaculo_afecta': obstaculo_afecta,
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
