# Previtaly — Producto & MVP Funcional

> Documento de estrategia. Define **qué problema resolvemos, para quién, por qué importa**,
> qué tenemos hoy, y el plan concreto para llevarlo a un **MVP funcional real** que tenga
> sentido y gane la hackathon. Puestos los pies en la tierra.

---

## 0. TL;DR

Previtaly es un **SaaS B2B para clínicas** que **previene el burnout del personal médico**
antes de que rompa — a la persona y al negocio. El profesional hace un **check-in de 20
segundos por voz** (sin formularios). Una IA lee no solo *qué* dice sino *cómo* lo dice, le
devuelve señales y micro-acciones, y a la clínica le da un panel con **el nivel de riesgo de
cada médico Y la causa real** detrás. Tres capas: **Prevenir → Predecir → Monitorear con
causas.** Lo diferencial no es decir "estás quemado": es decir **por qué**, y avisarlo **antes**.

---

## 1. El problema real

### 1.1 La persona (el profesional de salud)
Los jóvenes profesionales de salud llevan **cuerpo y mente al máximo**. Hacen sus tareas
diarias y encima buscan más y más: más guardias, más pacientes, más logros — creyendo que así
llegan más rápido al éxito, al reconocimiento, al buen dinero. A veces llegan. **¿Pero a qué
costo?** Al costo de su salud, su descanso, su vida. El burnout no avisa con tiempo: cuando se
hace visible, ya lleva meses instalado.

### 1.2 La clínica (por qué paga) — esto es lo que vendemos
Para la institución, un profesional desgastado **no es solo un problema humano, es un riesgo de
negocio**:
- **Eficiencia y productividad** caen.
- **Errores clínicos**: un mal diagnóstico puede costar un cliente, una demanda, o una vida.
- **Pérdida de prestigio y confianza** → pérdida de pacientes e ingresos.
- **Rotación y ausentismo**: reemplazar y reentrenar personal es caro.

Previtaly es un seguro de continuidad operativa: **cuidamos al que cuida, y de paso protegemos
el rendimiento, la reputación y la plata de la clínica.** Doble valor → caso B2B sólido.

### 1.3 Por qué nadie lo resuelve bien hoy
- Las encuestas de bienestar son **largas y molestas** ("otra vez tengo que llenar esto").
- Llegan **tarde** (miden el daño, no lo previenen).
- Dan un puntaje, **no la causa** → la clínica no sabe qué accionar.

---

## 2. Propuesta de valor

> **Previtaly previene el burnout del equipo médico de tu clínica: detecta las señales
> temprano, predice trayectorias de riesgo y te dice la causa real — con 20 segundos de voz al
> día, sin fricción.**

Posicionamiento claro de lo que **NO** somos (importante por legal y por foco):
- ❌ No es terapia ni diagnóstico clínico/psiquiátrico.
- ❌ No reemplaza a un profesional de salud mental.
- ✅ Es **prevención y alerta temprana de bienestar laboral**, con derivación cuando hace falta.

---

## 3. El core: 3 sistemas

### 3.1 PREVENCIÓN (hoy, lo más maduro)
Check-in diario → la IA devuelve **señales detectadas** + **micro-acciones concretas** para
ese día. Objetivo: que el profesional ajuste *hoy* antes de acumular.

### 3.2 PREDICCIÓN (el "te lo veo venir") — realista, sin humo
No prometemos un modelo mágico. Con la **serie temporal de check-ins** que ya guardamos
(`ai_analysis` por fecha) calculamos **trayectoria**:
- **Pendiente** del riesgo en los últimos N días (¿viene subiendo?).
- **Días consecutivos** en zona media/alta.
- **Volatilidad** (oscila mucho = inestable).
- → Salida honesta: *"A este ritmo, en ~X días entrás en zona de riesgo alto."*

La matemática es simple y explicable; la IA solo **narra** la proyección en lenguaje humano.
Esto es implementable ya y suena potente sin mentir.

### 3.3 MONITOREO CON CAUSAS (el diferencial real)
No alcanza con "riesgo alto". La clave es **por qué**. Cada análisis clasifica una
**causa principal** y un peso por dimensión (ver §4). En el panel de la clínica esto se agrega:
*"El 60% del equipo sube por **sobrecarga de guardias**; un 25% por **falta de descanso**."*
Eso es accionable: la clínica sabe **qué cambiar**, no solo que algo anda mal.

---

## 4. El motor de "causas" (cómo sabemos el POR QUÉ)

Definimos un set fijo de **dimensiones causales** (las que un profesional de salud realmente
sufre). Cada check-in se descompone en estas dimensiones con un peso 0-100:

| Dimensión causal | Señales de dónde sale |
|---|---|
| **Sobrecarga laboral** | horas/guardias (calendario), "muchas consultas", ritmo |
| **Falta de descanso/sueño** | voz ("no dormí"), energía baja, horario de guardias |
| **Alimentación/autocuidado** | comidas salteadas, hidratación |
| **Carga emocional** | tono y palabras de la voz (agotamiento, desmotivación) |
| **Aislamiento/soporte** | "solo", falta de red, no delega |
| **Autoexigencia/presión** | "tengo que", "no me alcanza", perfeccionismo |

**Cómo se infiere (por persona):** la IA combina 3 fuentes que ya tenemos —
1) **la voz** (qué dice + cómo lo dice),
2) **los datos rápidos** (comidas, energía, actividad),
3) **el calendario** (carga real de guardias/consultas) —
y devuelve `causa_principal` + `factores[]` con peso. Es una extensión chica del análisis que
ya hace `analyze/checkin`.

**Cómo se agrega (para la clínica):** sumamos las causas principales de todo el equipo y
mostramos el **ranking de causas** + su evolución. Ese es el "por qué suben las estadísticas"
del dashboard admin que pediste.

---

## 5. Low-friction: cómo pedimos los datos sin fastidiar

Principio rector: **el profesional NUNCA debe pensar "uff, otro formulario".**

- **Voz primero**: 20 segundos contando cómo fue el día (ya existe). Es lo más natural y rico.
- **2-3 toques máximo**: energía (slider), comidas (3 botones), actividad — opcionales.
- **Modo express (10s)**: un solo "¿cómo venís?" de 1 toque (cara/escala) para los días sin
  tiempo. Mejor 10s reales todos los días que 5 min que nadie hace.
- **Variedad**: rotar 1 micro-pregunta distinta por día (evita el efecto "siempre lo mismo").
- **Recordatorio amable**, no culposo. Racha/streak suave para enganchar sin presionar.

Regla de oro: **si toma más de 30s, lo rediseñamos.**

---

## 6. Estado actual (honesto)

### ✅ Ya funciona (real, persistido en Supabase)
- **Check-in médico** por voz (Web Speech API) + energía/comidas/actividad.
- **Análisis IA real** (Azure OpenAI) con fallback a mock: 5 métricas 0-100, nivel de riesgo,
  detectados, sugerencias, tendencia. Guardado en `ai_analysis`.
- **Resultados** del médico (métricas, "qué detecté", tendencia de 7 días) e **historial** (30).
- **Dashboard de la clínica**: lista de médicos ordenados por riesgo, con sparkline real.
- **Asignación inteligente de guardias**: bloquea asignar guardia a un médico en riesgo alto /
  con poca capacidad restante (lee la IA). ← *gran demo, muy "core".*
- **Sugerencias para la clínica**: conclusiones automáticas sobre métricas reales.
- **Auth**: email/password + **Google** (recién agregado). Onboarding con código de clínica.

### ⚠️ Simulado / incompleto
- **Pago** del plan: 100% mock (no hay procesador real).
- **Predicción**: solo `tendencia` heurística por check-in; **no** hay trayectoria/proyección.
- **Causas**: hay "detectados" sueltos, pero **no** una causa principal estructurada ni
  agregación por equipo. ← *justo el diferencial que falta.*
- **Calendario de la clínica**: cae a datos mock si no hay turnos reales.
- **Notificaciones** ("tu analista fue notificado"): el texto existe, el sistema no.
- **Transcripción por Azure Speech**: el endpoint existe pero la app usa el del navegador.

---

## 7. Gap analysis → qué falta para un MVP funcional REAL

Ordenado por impacto en "tiene sentido y se nota":

1. **Causa principal + agregación por equipo** (el diferencial). *Falta y es lo más valioso.*
2. **Predicción por trayectoria** (proyección honesta sobre la serie de check-ins).
3. **Dashboard admin con "por qué"**: ranking de causas del equipo + evolución.
4. **Loop de acción que se cierra**: cuando la clínica actúa (ej. redistribuir guardias),
   verlo reflejado. Hoy el bloqueo de guardias ya es un primer paso.
5. **Modo express** de check-in (bajar fricción al mínimo).
6. **Notificaciones reales** (al menos un feed simple para la clínica cuando alguien entra en rojo).
7. **Pago real** (solo si el pitch lo exige; para demo, simulado alcanza).

---

## 8. El MVP funcional (scope acotado)

**Una frase de alcance:** *un médico hace check-ins de voz; la IA detecta señales, su causa y
su trayectoria; la clínica ve el riesgo del equipo, por qué sube, y actúa (guardias).*

### Capa 1 — Profesional (prevención, ya casi listo)
- Check-in voz 20s + express 10s.
- Resultado: métricas + **causa principal del día** + 1 micro-acción primaria.
- Tendencia/trayectoria personal ("venís estable / subiendo hace 3 días").

### Capa 2 — IA (el cerebro, extender lo que hay)
- `analyze/checkin` agrega `causa_principal` + `factores[]` (pesos por dimensión).
- Nuevo cálculo de **trayectoria** sobre los últimos N `ai_analysis` (stats simples + narración IA).

### Capa 3 — Clínica (monitoreo con causas + acción)
- Dashboard: equipo por riesgo (ya está) + **panel de causas** ("por qué sube el equipo").
- Predicción a nivel equipo: "X médicos proyectan riesgo alto esta semana".
- Acción: asignación de guardias con bloqueo IA (ya está) + recomendaciones por causa.

Todo lo demás (pago real, CRM, notificaciones push, ML pesado) queda **fuera del MVP**.

---

## 9. Roadmap priorizado

### NOW (MVP de la hackathon — lo que hace que se note)
- [ ] **Causa principal** en el análisis IA (extender schema + prompt).
- [ ] **Panel de causas** en el dashboard de la clínica (ranking + % del equipo).
- [ ] **Trayectoria/predicción** simple (pendiente + días en rojo) por médico y por equipo.
- [ ] **Modo express** de check-in (1 toque).
- [ ] Pulir el copy de "prevención, no diagnóstico" en toda la app.

### NEXT (si sobra tiempo / post-hackathon cercano)
- [ ] Feed de **alertas** para la clínica (alguien entró en rojo, racha rota).
- [ ] Recomendaciones de la clínica **derivadas de la causa** dominante (no genéricas).
- [ ] Variedad de micro-preguntas rotativas.
- [ ] Transcripción por Azure Speech como opción (audios más largos/precisos).

### LATER (producto real, fuera de hackathon)
- [ ] Pago real (Stripe/MercadoPago) + límites por plan.
- [ ] Integración con CRM/HIS de la clínica para carga real de turnos.
- [ ] Modelo predictivo entrenado con histórico (cuando haya datos).
- [ ] Compliance (datos sensibles de salud), SSO empresarial, auditoría.

**Dónde la IA aporta DE VERDAD** (no por moda): leer la **voz** (tono + contenido), inferir la
**causa**, y **narrar** la trayectoria. El scoring numérico y la trayectoria son reglas/stats
simples y explicables — eso da confianza y baja costo.

---

## 10. Diseño & flujos

**Flujo médico (diario):**
`Abrir app → "¿Cómo estuvo tu día?" → 20s de voz (o express 1 toque) → [2 sliders opcionales]
→ Resultado: causa del día + 1 acción + cómo venís`

**Flujo clínica (semanal/diario):**
`Dashboard → equipo por riesgo → entro al panel de causas ("por qué sube") → veo proyección de
la semana → acciono (redistribuyo guardias / mando recomendación)`

**Principios UX:** mobile-first, blanco clínico (ya definido), cero fricción, lenguaje cálido y
respetuoso (voseo), nunca alarmista, siempre accionable, sin emojis (look profesional).

---

## 11. Por qué ganamos

- **Resolvemos un problema real y caro**, con un caso B2B claro (persona + negocio).
- **Diferencial honesto**: no solo medimos burnout, decimos **la causa** y lo vemos **venir**.
- **Fricción mínima**: 20s de voz gana a cualquier encuesta.
- **Demo potente y real**: check-in de voz → análisis IA en vivo → dashboard que bloquea una
  guardia por riesgo. Eso se ve y se entiende en 90 segundos.

**Métricas de éxito (norte):** % de adherencia al check-in diario, días de anticipación con que
detectamos un pico de riesgo, y acciones tomadas por la clínica a partir de una causa.
