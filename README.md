# Calculadora de Zona de Fresnel

Esta aplicación web permite calcular la zona de Fresnel y otros parámetros importantes para enlaces inalámbricos. Utiliza Flask en el backend y Bootstrap en el frontend para una experiencia moderna y funcional.

## Funcionalidades principales

- **Cálculo de zona de Fresnel:**
  - Calcula el radio de la zona de Fresnel principal según la distancia y frecuencia ingresadas.
- **Soporte de unidades:**
  - Puedes ingresar la distancia en kilómetros o metros, y la frecuencia en GHz o MHz.
- **Cálculo de pérdidas por espacio libre:**
  - Calcula la atenuación por espacio libre en decibelios (dB).
- **Obstáculos:**
  - Permite ingresar la altura de un obstáculo y determina si afecta la zona de Fresnel.
- **Comparación de frecuencias:**
  - Puedes comparar el radio de Fresnel para varias frecuencias a la vez.
- **Explicación de resultados:**
  - Muestra una explicación clara de los resultados obtenidos.
- **Historial de cálculos:**
  - Guarda los últimos 10 cálculos realizados en la sesión y los muestra en pantalla.
- **Visualización gráfica:**
  - Dibuja la zona de Fresnel en un gráfico simple.
- **Interfaz moderna:**
  - Utiliza Bootstrap y estilos personalizados para una mejor experiencia visual.

## Cómo usar

1. Ingresa la distancia y selecciona la unidad (km o m).
2. Ingresa la frecuencia y selecciona la unidad (GHz o MHz).
3. (Opcional) Ingresa la altura de un obstáculo.
4. (Opcional) Ingresa otras frecuencias para comparar, separadas por coma.
5. Haz clic en "Calcular".
6. Observa los resultados, explicaciones, comparaciones y el historial.

## Archivos principales

- `app.py`: Backend Flask con toda la lógica de cálculo y API.
- `templates/index.html`: Interfaz principal con Bootstrap y formulario.
- `static/script.js`: Lógica del frontend para enviar datos y mostrar resultados.
- `static/styles.css`: Estilos personalizados.

## Requisitos

- Python 3.8+
- Flask
- Bootstrap (CDN)

## Ejecución

1. Instala las dependencias (Flask).
2. Ejecuta `app.py`.
3. Abre el navegador en `http://localhost:5000`.

---

