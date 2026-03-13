import React from 'react';

interface LegalProps {
  type: 'aviso-legal' | 'privacidad' | 'cookies' | 'terminos' | 'contacto';
}

const Legal: React.FC<LegalProps> = ({ type }) => {
  const content = {
    'aviso-legal': {
      title: 'Aviso Legal',
      body: (
        <>
          <p>En cumplimiento de lo establecido en la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa a los usuarios y visitantes de la página web acerca de los datos legales del titular del sitio:</p>
          
          <h3>1. Datos Identificativos</h3>
          <p>
            Nombre Comercial: Activos Off-Market<br/>
            Titular: José Carlos De La Peña Manchón (Entrepreneur individuel)<br/>
            RCS Paris: 994 466 985<br/>
            Domicilio Social: 59 rue de Ponthieu, 75008 Paris<br/>
            Email de contacto: contacto@activosoffmarket.com<br/>
            Actividad: Consultoría y análisis de subastas públicas.
          </p>

          <h3>2. Objeto y Ámbito de Aplicación</h3>
          <p>Las presentes condiciones generales regulan el acceso y uso del sitio web Activos Off-Market, así como las responsabilidades derivadas de la utilización de sus contenidos. El acceso a este sitio web implica la aceptación sin reservas de las presentes condiciones.</p>

          <h3>3. Propiedad Intelectual e Industrial</h3>
          <p>Todos los contenidos del sitio web (textos, gráficos, logotipos, imágenes, vídeos, código fuente, etc.) son propiedad exclusiva del Titular o de terceros que han autorizado su uso, estando protegidos por la legislación nacional e internacional sobre propiedad intelectual.</p>
          <p>Queda prohibida la reproducción, distribución, comunicación pública o transformación de dichos contenidos sin la autorización expresa y por escrito del Titular.</p>

          <h3>4. Exclusión de Responsabilidad</h3>
          <p>El Titular no se hace responsable de:</p>
          <ul>
            <li>Los errores u omisiones en los contenidos publicados, especialmente aquellos derivados de fuentes oficiales (BOE, Portales de Subastas) que puedan contener erratas de origen.</li>
            <li>La falta de disponibilidad del portal o la transmisión de virus o programas maliciosos, a pesar de haber adoptado todas las medidas tecnológicas necesarias para evitarlo.</li>
            <li>El uso que el usuario haga de la información contenida en la web. Activos Off-Market ofrece análisis y opinión, pero no asesoramiento financiero vinculante.</li>
          </ul>

          <h3>5. Legislación y Jurisdicción</h3>
          <p>Para la resolución de todas las controversias o cuestiones relacionadas con el presente sitio web, será de aplicación la legislación española, siendo competentes los Juzgados y Tribunales de París.</p>
        </>
      )
    },
    'privacidad': {
        title: 'Política de Privacidad',
        body: (
          <>
            <p>En Activos Off-Market nos tomamos muy en serio la protección de tus datos personales. En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), te informamos:</p>

            <h3>1. Responsable del Tratamiento</h3>
            <p>
              Titular: José Carlos De La Peña Manchón (Entrepreneur individuel)<br/>
              RCS Paris: 994 466 985<br/>
              Email: contacto@activosoffmarket.com
            </p>

            <h3>2. Finalidad del Tratamiento</h3>
            <p>Tratamos tus datos para las siguientes finalidades:</p>
            <ul>
                <li>Gestión de clientes: Para la prestación del servicio contratado (consultoría, suscripción al canal Premium).</li>
                <li>Comunicaciones: Para responder a tus consultas realizadas a través del formulario de contacto o email.</li>
                <li>Facturación: Para el cumplimiento de las obligaciones fiscales y contables.</li>
            </ul>

            <h3>3. Legitimación</h3>
            <p>La base legal para el tratamiento de tus datos es:</p>
            <ul>
                <li>La ejecución de un contrato (cuando contratas un servicio).</li>
                <li>El consentimiento expreso (cuando nos escribes para solicitar información).</li>
                <li>El interés legítimo del responsable.</li>
            </ul>

            <h3>4. Conservación de los Datos</h3>
            <p>Los datos se conservarán mientras se mantenga la relación comercial o durante los años necesarios para cumplir con las obligaciones legales (ej. normativa fiscal).</p>

            <h3>5. Destinatarios</h3>
            <p>No se cederán datos a terceros, salvo obligación legal. Sin embargo, para prestar nuestros servicios utilizamos proveedores tecnológicos (encargados de tratamiento) como proveedores de hosting, email marketing o plataformas de pago, que cumplen con la normativa de protección de datos.</p>

            <h3>6. Derechos del Usuario</h3>
            <p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad enviando un email a contacto@activosoffmarket.com, adjuntando copia de tu DNI.</p>
          </>
        )
    },
    'cookies': {
        title: 'Política de Cookies',
        body: (
          <>
            <p>Este sitio web utiliza cookies para mejorar la experiencia del usuario y analizar el tráfico.</p>

            <h3>1. ¿Qué son las cookies?</h3>
            <p>Las cookies son pequeños archivos de texto que los sitios web almacenan en su ordenador o dispositivo móvil cuando los visita. Permiten que el sitio web recuerde sus acciones y preferencias durante un período de tiempo.</p>

            <h3>2. Tipos de Cookies que utilizamos</h3>
            <ul>
                <li>Cookies Técnicas (Necesarias): Son aquellas que permiten al usuario la navegación a través de la página web y la utilización de las diferentes opciones o servicios que en ella existan.</li>
                <li>Cookies de Análisis: Son aquellas que, tratadas por nosotros o por terceros (como Google Analytics), nos permiten cuantificar el número de usuarios y realizar la medición y análisis estadístico de la utilización que hacen los usuarios del servicio.</li>
            </ul>

            <h3>3. Gestión de Cookies</h3>
            <p>Puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo mediante la configuración de las opciones del navegador instalado en tu ordenador (Chrome, Firefox, Safari, Edge, etc.).</p>
          </>
        )
    },
    'terminos': {
        title: 'Términos y Condiciones de Contratación',
        body: (
          <>
            <h3>1. Objeto del Servicio</h3>
            <p>Activos Off-Market presta servicios de información, filtrado y análisis de activos procedentes de subastas públicas (judiciales, notariales, AEAT, Seguridad Social). El servicio incluye la entrega de información digerida y opiniones fundadas sobre el estado jurídico y físico aparente de los bienes.</p>

            <h3>2. Naturaleza del Servicio (Disclaimer)</h3>
            <p>IMPORTANTE: El Titular NO es una Empresa de Asesoramiento Financiero (EAF) ni una agencia inmobiliaria.</p>
            <ul>
                <li>El servicio se limita al análisis de la información disponible públicamente y a la experiencia del consultor.</li>
                <li>El Titular no garantiza la rentabilidad futura de ninguna inversión.</li>
                <li>La decisión final de pujar y el precio de la puja es responsabilidad exclusiva del Cliente.</li>
                <li>El Titular no se hace responsable de vicios ocultos del inmueble que no pudieran detectarse mediante la documentación registral y administrativa.</li>
            </ul>

            <h3>3. Precios y Pagos</h3>
            <p>Los precios de los servicios (Suscripción Premium, Consultoría 1:1) están indicados en la web en Euros (€) e incluyen los impuestos aplicables, salvo que se indique lo contrario. El pago se realizará a través de las plataformas seguras habilitadas (ej. Stripe, PayPal).</p>

            <h3>4. Política de Cancelación y Desistimiento</h3>
            <ul>
                <li>Suscripciones: El usuario puede cancelar su suscripción recurrente en cualquier momento, deteniéndose los cargos futuros. No se realizan reembolsos parciales de periodos ya abonados.</li>
                <li>Consultorías: Se permite la reprogramación de la cita con al menos 24 horas de antelación. En caso de no asistencia sin aviso previo, el servicio se considerará prestado.</li>
            </ul>
          </>
        )
    },
    'contacto': {
        title: 'Contacto',
        body: (
          <>
            <p>Estamos a tu disposición para resolver cualquier duda sobre nuestros servicios, incidencias técnicas o cuestiones administrativas.</p>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mt-6">
                <p className="mb-4">Email Directo:<br/> <a href="mailto:contacto@activosoffmarket.com" className="text-brand-600 hover:underline">contacto@activosoffmarket.com</a></p>
                <p className="mb-4">Canal de Telegram:<br/> <a href="https://t.me/activosoffmarket" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">@activosoffmarket</a></p>
                <p>Horario de atención:<br/> Lunes a Viernes de 9:00 a 19:00 (Hora Peninsular Española)</p>
            </div>
          </>
        )
    }
  };

  const data = content[type];

  return (
    <div className="pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-8 border-b pb-4">{data.title}</h1>
          <div className="prose prose-slate max-w-none prose-a:text-brand-600 prose-headings:text-slate-800 font-light">
              {data.body}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;