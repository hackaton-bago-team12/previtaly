# Uso de Inteligencia Artificial en Previtaly

## Resumen ejecutivo

Previtaly es una plataforma de prevención de burnout en personal médico. La inteligencia artificial actúa como el núcleo analítico del producto: convierte el relato diario de un médico (voz o texto) en métricas objetivas de bienestar, detecta señales de riesgo con base en evidencia concreta del discurso, y genera recomendaciones personalizadas y accionables. La IA no diagnostica ni reemplaza al profesional de salud; identifica patrones y facilita la intervención temprana.

---

## 1. Herramientas utilizadas

### Servicios de IA en la nube (Azure AI Foundry)

| Herramienta | Versión / Deployment | Rol |
|---|---|---|
| **Azure OpenAI Service** — GPT-4.1 | Deployment `gpt-4.1` (API v1 Foundry) | Análisis del check-in diario, generación de métricas, detecciones y sugerencias |
| **Azure AI Speech** | SDK `azure-cognitiveservices-speech` | Transcripción de audio a texto (reconocimiento continuo, español) |

### IA en el navegador (frontend)

| Herramienta | Rol |
|---|---|
| **Web Speech API** (nativa del navegador) | Transcripción en tiempo real mientras el médico habla, como fallback al servicio de Azure Speech |

### Microservicio de IA

| Herramienta | Versión | Rol |
|---|---|---|
| **FastAPI** | Python 3.11+ | API REST que orquesta Azure Speech y Azure OpenAI |
| **Pydantic** | v2 | Validación y tipado estricto de entradas y salidas del modelo |
| **OpenAI Python SDK** | Última estable | Cliente hacia la API de Azure OpenAI Foundry |

### Herramientas de desarrollo asistido por IA

| Herramienta | Rol |
|---|---|
| **Cursor IDE** (con Claude Sonnet) | Asistente de codificación durante todo el desarrollo del hackathon |

---

## 2. Proceso de desarrollo

### Arquitectura de la solución

El sistema está compuesto por dos repositorios que colaboran:

```
[Médico]
   │
   ├─ Habla (voz)
   │      │
   │      ▼
   │  Web Speech API ──── transcripción en vivo (en el navegador)
   │      │
   │      ▼
   │  Next.js frontend (Hackaton BAGO)
   │      │
   │      ├─ Recopila: transcripción + comidas + energía + actividad física
   │      │
   │      ▼
   │  Server Action (Next.js) ──── POST /analyze/checkin ──────►
   │                                                          FastAPI (previtaly-ai)
   │                                                               │
   │                                                      ┌────────┴────────┐
   │                                                      ▼                 ▼
   │                                             Azure AI Speech    Azure OpenAI GPT-4.1
   │                                             (transcripción     (análisis + métricas
   │                                              de audio WAV)      + sugerencias)
   │                                                      │
   │                                                      ▼
   │                                            CheckinAnalysisResult (JSON)
   │                                                      │
   │                                                      ▼
   │                                            Supabase (persistencia)
   │                                                      │
   │                                                      ▼
   │                                    Dashboard del médico + Dashboard del analista
```

### Etapas del desarrollo

1. **Diseño del contrato de datos**: Se definieron los esquemas Pydantic (`schemas.py`) antes de escribir cualquier lógica. Esto garantizó que el modelo de IA devolviera siempre la misma estructura JSON, consumible directamente por el frontend sin parsing manual.

2. **Prompt engineering iterativo**: El prompt del sistema (`CHECKIN_PROMPT`) fue refinado a lo largo del hackathon para:
   - Incorporar datos numéricos (comidas, energía, actividad) como base objetiva.
   - Exigir entre 4 y 5 detecciones con evidencia textual concreta (no generalidades).
   - Requerir exactamente 1 sugerencia primaria (urgente) y 3–4 secundarias, cada una con duración y beneficio esperado.
   - Determinar una causa principal del desgaste entre 6 dimensiones posibles (`sobrecarga`, `descanso`, `alimentacion`, `emocional`, `aislamiento`, `autoexigencia`).

3. **Structured outputs**: Se utilizó el parámetro `response_format=CheckinAnalysisResult` de la SDK de OpenAI para forzar al modelo a responder con el esquema Pydantic exacto, eliminando la necesidad de parsear texto libre y garantizando la integridad de los datos.

4. **Fallback resiliente**: El cliente TypeScript (`lib/ai-service.ts`) implementa un fallback automático a datos mock si el servicio de IA no está disponible o falla. Esto permite que la demo nunca se rompa, independientemente de la disponibilidad del servicio de Azure.

5. **Algoritmo de proyección de trayectoria**: Sobre la serie histórica de check-ins se aplica regresión lineal (`lib/trayectoria.ts`) para calcular la pendiente diaria del riesgo compuesto y proyectar cuántos días faltan para entrar en zona crítica. No depende del modelo de lenguaje; es completamente determinístico.

---

## 3. Rol específico de la inteligencia artificial en la solución

### 3.1 Transcripción de voz a texto

**Herramienta**: Azure AI Speech (backend) + Web Speech API (frontend)

El médico relata su día en voz mientras mantiene presionado un botón en la app. La transcripción ocurre en tiempo real en el navegador mediante la Web Speech API. El texto resultante es el insumo principal para el análisis.

El servicio FastAPI también expone un endpoint `POST /audio/transcribir` que acepta archivos WAV y utiliza reconocimiento continuo (no limitado a 15 segundos) mediante el SDK de Azure AI Speech, pensado para integraciones donde el audio llega como archivo.

### 3.2 Análisis del check-in diario

**Herramienta**: Azure OpenAI GPT-4.1 con structured outputs

Este es el núcleo de la propuesta de valor. El modelo recibe cuatro entradas:

```
Transcripcion de voz: "[lo que dijo el médico]"
Comidas hoy: 1/3
Energia percibida: 4/10
Actividad fisica: 2/10
```

Y devuelve un JSON estructurado con los siguientes campos:

| Campo | Tipo | Descripción |
|---|---|---|
| `indicePulso` | 0–100 | Bienestar general (mayor = mejor) |
| `concentracion` | 0–100 | Capacidad de foco mental |
| `estres` | 0–100 | Nivel de estrés (mayor = peor) |
| `capacidadRestante` | 0–100 | Energía disponible para seguir la jornada |
| `cargaAcumulada` | 0–100 | Desgaste acumulado (mayor = peor) |
| `nivelRiesgo` | bajo / medio / alto | Clasificación de riesgo de burnout |
| `tendencia` | subiendo / estable / bajando | Dirección del estado respecto al día anterior |
| `causaPrincipal` | sobrecarga / descanso / alimentacion / emocional / aislamiento / autoexigencia | Dimensión causal dominante del desgaste |
| `factores` | Lista de dimensiones con peso 0–100 | Composición multidimensional de la causa |
| `detectados` | 4–5 señales | Observaciones concretas del discurso del médico |
| `sugerencias` | 4–5 acciones | Recomendaciones accionables (1 primaria + secundarias) |

El modelo es instruido explícitamente para:
- Referenciar frases concretas del discurso, no generalidades.
- Ser coherente: si el médico reporta cansancio y baja energía, las métricas deben reflejarlo.
- Nunca usar lenguaje clínico ni diagnosticar.
- Incluir duración y beneficio esperado en cada sugerencia.

### 3.3 Detección de causa principal y factores

El modelo clasifica el desgaste del médico en una taxonomía de 6 dimensiones causales, asignando un peso (0–100) a cada una que aplica. Esto permite al analista (coordinador de la clínica) entender no solo *cuánto* riesgo hay, sino *por qué*, y actuar en consecuencia (redistribuir guardias, recomendar descanso, activar soporte emocional, etc.).

### 3.4 Proyección predictiva de trayectoria

**Herramienta**: Algoritmo determinístico (regresión lineal sobre serie temporal)

A partir de los últimos 7 check-ins, se calcula un riesgo compuesto diario:

```
riesgoCompuesto = (estres + cargaAcumulada + (100 - indicePulso)) / 3
```

Se ajusta una recta de regresión lineal sobre esta serie y se proyecta cuántos días faltan para superar el umbral de riesgo alto (65 puntos). Esto convierte el dato puntual del día en una señal de alerta temprana con horizonte temporal concreto.

### 3.5 Dashboard del analista

El analista (coordinador de la clínica) visualiza el estado agregado de su equipo médico. Las métricas individuales de cada médico son producidas por el modelo de IA en cada check-in y consolidadas en vistas de equipo, identificando automáticamente a quienes están en riesgo alto para que el analista pueda priorizar su intervención.

---

## Consideraciones éticas y limitaciones

- **No es diagnóstico clínico**: El sistema identifica señales de alerta a partir del autorrelato. No reemplaza la evaluación de un profesional de salud mental.
- **Privacidad**: Las transcripciones de voz se almacenan en Supabase asociadas al médico. No se comparten entre clínicas.
- **Falibilidad del modelo**: Las métricas son estimaciones basadas en un texto breve y datos numéricos de autoevaluación. Pueden no reflejar la situación real del médico si el autorrelato es incompleto o sesgado.
- **Fallback a mock**: En ausencia del servicio de IA, la plataforma genera datos de muestra para garantizar la continuidad de la experiencia, señalando claramente que son estimaciones de referencia.
