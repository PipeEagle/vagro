Evaluación práctica orientada al análisis, diseño arquitectónico, desarrollo, integración y funcionamiento de una aplicación web Full Stack, aplicando los principios de arquitectura de software y computacional abordados durante la asignatura.

Cada equipo deberá presentar su propio proyecto de software, documentando el proceso de construcción de la solución, justificando las decisiones arquitectónicas y demostrando su implementación mediante una aplicación funcional.

Requisitos técnicos

1. Frontend

HTML5, CSS3 y JavaScript moderno (Vanilla JavaScript).

Arquitectura SPA (Single Page Application) nativa, basada en páginas, componentes reutilizables, enrutamiento y gestión de estado.

Uso de Bootstrap o Tailwind CSS.

Manipulación del DOM, gestión de eventos y renderizado dinámico.

Consumo de la API REST mediante solicitudes HTTP asíncronas.

Validación de formularios y manejo de errores.

No se permite el uso de frameworks o librerías de interfaz como React, Angular o Vue.

2. Backend

Python con Flask.

Implementación de una API REST.

Arquitectura monolítica modular por capas, organizada por dominios funcionales.

Separación de responsabilidades mediante controladores, servicios, repositorios, DTO y modelos.

Implementación de reglas de negocio, validaciones y manejo de excepciones.

Uso adecuado de métodos HTTP, códigos de estado y respuestas JSON.

Autenticación y autorización según los requisitos del proyecto.

3. Base de datos

MySQL o PostgreSQL.

Modelado de entidades y relaciones.

Persistencia de datos mediante ORM.

Operaciones de consulta, creación, actualización y eliminación de registros, según las funcionalidades del proyecto.

Gestión de migraciones de base de datos.

4. Integración y calidad del software

Comunicación funcional entre el Frontend, el Backend y la base de datos.

Validación de datos en el cliente y en el servidor.

Manejo adecuado de errores.

Pruebas de funcionamiento.

Organización, documentación y control de versiones del código fuente.

Entregables

La entrega estará compuesta por un informe en formato HTML, un video explicativo en formato MP4, los enlaces de los repositorios de GitHub y la sustentación del proyecto en clase.

1. Informe del proyecto en formato HTML

Nombre del archivo: Informe_Proyecto_Final_NombreProyecto.html

Cada equipo deberá elaborar un informe en formato HTML que documente, de manera organizada, detallada y coherente, el proceso de análisis, diseño y desarrollo de su proyecto, tomando como referencia el manual HTML proporcionado durante la asignatura.

El alcance del informe comprende las siguientes fases:

Fase 01. Gestión comercial y atención inicial.

Fase 02. Descubrimiento, requisitos y contratación.

Fase 03. Scrum, arquitectura y diseño.

Fase 04. Preparación técnica.

Fase 05. Desarrollo incremental.

El manual HTML constituye una referencia metodológica. Cada equipo podrá adaptar, ampliar, reducir o reorganizar las etapas y pasos propuestos, de acuerdo con las características, necesidades, alcance y complejidad de su proyecto.

No se requiere reproducir exactamente la estructura ni la cantidad de procedimientos establecidos en el manual. Lo fundamental es garantizar la coherencia y pertinencia del proceso documentado.

Se deberá prestar especial atención al diseño de la arquitectura de software y computacional, incluyendo:

Requisitos arquitectónicamente relevantes, restricciones y atributos de calidad.

Diagramas C4 de contexto, contenedores y componentes.

Diagramas UML correspondientes al diseño del sistema.

Arquitectura lógica, organización de dominios, módulos y capas.

Arquitectura computacional y diagrama de despliegue.

Modelo lógico y físico de la base de datos.

Diseño de la API REST y comunicación entre los componentes.

Diseño de seguridad.

Decisiones arquitectónicas (ADR), alternativas consideradas y justificación de las decisiones adoptadas.

Consideraciones de rendimiento, escalabilidad, disponibilidad, seguridad, costos y riesgos.

Los diseños arquitectónicos deberán ser coherentes entre sí y corresponder al sistema desarrollado. El informe deberá contener información específica del proyecto y no limitarse a describir conceptos teóricos.

El alcance obligatorio del informe comprende hasta la fase de desarrollo incremental, inclusive. Las fases posteriores de calidad, release, despliegue, operación y mantenimiento no forman parte de esta entrega. El diseño de la infraestructura y del despliegue sí deberá incluirse como parte de la arquitectura computacional.

2. Video explicativo del proyecto

Nombre del archivo: Video_Proyecto_Final_NombreProyecto.mp4

El video deberá desarrollarse en el siguiente orden:

1. Presentación de los integrantes y del proyecto

Iniciar con los nombres completos de todos los integrantes, el nombre del proyecto y una breve explicación de su propósito, la necesidad que busca atender y sus principales funcionalidades.

2. Demostración del funcionamiento de la aplicación

Ejecutar la aplicación y demostrar directamente desde el navegador:

El funcionamiento de la interfaz y la navegación entre las diferentes páginas.

Las principales funcionalidades del sistema.

Los formularios y sus validaciones.

La autenticación, autorización y gestión de permisos, según corresponda.

El consumo real de los servicios de la API REST.

Las solicitudes y respuestas HTTP mediante la pestaña Network (Red) de las herramientas de desarrollo del navegador.

La persistencia de la información en la base de datos.

El comportamiento de la aplicación ante errores o datos inválidos.

Se deberá evidenciar el funcionamiento integrado del sistema, desde la interacción del usuario hasta el procesamiento y almacenamiento de la información y la presentación del resultado en la interfaz.

3. Presentación del informe HTML y explicación de la arquitectura

Abrir el informe HTML desde el navegador y presentar el proceso documentado, desde la gestión comercial y atención inicial hasta el desarrollo del proyecto.

Mostrar los diseños arquitectónicos elaborados y explicar:

La arquitectura general del sistema.

La arquitectura lógica y computacional.

Los diagramas C4, UML y de despliegue.

La distribución de responsabilidades entre los componentes, dominios y capas.

La comunicación entre el Frontend, el Backend y la base de datos.

Las principales decisiones arquitectónicas y su justificación.

La relación entre la arquitectura diseñada y la implementación realizada.

No será suficiente mostrar los diagramas; se deberán explicar las decisiones que representan y cómo responden a las necesidades del proyecto.

4. Explicación técnica del Frontend

Abrir el código fuente del Frontend en Visual Studio Code y explicar:

La estructura de carpetas y archivos.

La organización de la aplicación SPA.

La implementación de páginas y componentes reutilizables.

El funcionamiento del enrutamiento y la gestión de estado.

La manipulación del DOM y el manejo de eventos.

Los servicios encargados de la comunicación con la API REST.

Las validaciones, el manejo de errores y la actualización de la interfaz.

Los fragmentos de código más relevantes para el funcionamiento del proyecto.

5. Explicación técnica del Backend

Abrir el código fuente del Backend en Visual Studio Code y explicar:

La estructura de carpetas y archivos.

La arquitectura monolítica modular por capas y la organización por dominios.

Las responsabilidades de los controladores, servicios, repositorios, DTO y modelos.

La implementación de los endpoints de la API REST.

Las reglas de negocio y las validaciones.

La autenticación y autorización, según corresponda.

La conexión con la base de datos, el ORM, los modelos y las migraciones.

El manejo de excepciones y las respuestas HTTP.

Los fragmentos de código más relevantes para el funcionamiento del proyecto.

Se deberá seleccionar al menos una funcionalidad representativa y explicar el recorrido completo de la información a través de los componentes y capas de la aplicación, relacionando el código fuente con los diseños arquitectónicos.

Condiciones del video

Todos los integrantes deberán participar activamente en la explicación funcional, técnica y arquitectónica del proyecto.

El video deberá contar con buena resolución de imagen y calidad de sonido.

El informe, el código fuente, los diagramas y los resultados de ejecución deberán visualizarse claramente.

La explicación deberá realizarse sobre la aplicación, los diseños y el código fuente reales.

No será suficiente presentar únicamente diapositivas o capturas de pantalla.

No se deberán exponer contraseñas, tokens, claves de acceso ni otras credenciales.

3. Repositorios de GitHub

Al momento de realizar la entrega, se deberán registrar directamente en el comentario de la tarea:

Nombre del proyecto.

Nombres completos de los integrantes.

Enlace del repositorio Frontend.

Enlace del repositorio Backend.

Se permite utilizar dos repositorios independientes o un único repositorio que contenga ambos componentes en carpetas claramente diferenciadas.

Los repositorios deberán contener el código fuente actualizado, las dependencias, los archivos de configuración de ejemplo y las instrucciones necesarias para instalar, configurar y ejecutar el proyecto.

Si los repositorios son privados, se deberá conceder acceso de lectura a rortegani@gmail.com para permitir su revisión.

4. Sustentación del proyecto en clase

Cada equipo deberá presentar el proyecto, demostrar el funcionamiento de la aplicación y sustentar la arquitectura de software y computacional diseñada.

Todos los integrantes deberán estar en capacidad de explicar y justificar las decisiones arquitectónicas, la organización del código fuente, la integración entre los componentes y las alternativas consideradas, así como responder las preguntas realizadas durante la evaluación.

Forma de entrega

Adjuntar directamente los siguientes archivos:

Informe_Proyecto_Final_NombreProyecto.html

Video_Proyecto_Final_NombreProyecto.mp4

Reemplazar NombreProyecto por el nombre corto del proyecto, sin espacios ni caracteres especiales.

El informe HTML deberá permitir la correcta visualización de su contenido, incluidos los documentos, diagramas, imágenes y demás evidencias incorporadas.

Los enlaces de GitHub y la información de los integrantes deberán incluirse en el comentario de la tarea.

El informe, los diseños arquitectónicos, el código fuente, el video y la sustentación deberán corresponder a la misma versión del proyecto.

Calificación

Nota máxima: 5,0 puntos.

Nota mínima aprobatoria: 3,0 puntos.