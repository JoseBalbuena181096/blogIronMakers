// Tipos de base de datos
export interface Profile {
  id: string;
  email: string;
  nombre: string | null;
  avatar_url: string | null;
  rol: 'user' | 'admin';
  fecha_registro: string;
  fecha_nacimiento: string | null;
  telefono: string | null;
  bio: string | null;
}

export interface Curso {
  id: string;
  titulo: string;
  slug: string;
  descripcion: string | null;
  imagen_portada: string | null;
  duracion_estimada: number | null;
  orden: number;
  responsable_id: string | null;
  fecha_creacion: string;
  publicado: boolean;
}

export interface Entrada {
  id: string;
  titulo: string;
  slug: string;
  curso_id: string;
  contenido: ContenidoBloque[] | null;
  orden_en_curso: number;
  duracion_estimada: number | null;
  fecha_publicacion: string;
  publicado: boolean;
}

export interface Inscripcion {
  id: string;
  user_id: string;
  curso_id: string;
  fecha_inscripcion: string;
  fecha_completado: string | null;
  estado: 'inscrito' | 'completado';
}

export interface ProgresoLeccion {
  id: string;
  user_id: string;
  entrada_id: string;
  completado: boolean;
  fecha_completado: string | null;
  tiempo_dedicado: number | null;
}

export interface Certificado {
  id: string;
  user_id: string;
  curso_id: string;
  fecha_emision: string;
  codigo_verificacion: string;
  url_pdf: string | null;
}

export interface ContenidoLanding {
  id: string;
  seccion: string;
  contenido: any;
  ultima_modificacion: string;
}

export interface IntegranteEquipo {
  id: string;
  nombre: string;
  rol: string | null;
  bio: string | null;
  foto_url: string | null;
  linkedin_url: string | null;
  orden: number;
}

export interface ProyectoDestacado {
  id: string;
  titulo: string;
  descripcion: string | null;
  imagen_url: string | null;
  url_proyecto: string | null;
  fecha_creacion: string;
  destacado: boolean;
}

export interface QuizPregunta {
  id: string;
  entrada_id: string;
  pregunta: string;
  opciones: { texto: string; es_correcta: boolean }[];
  orden: number;
  creado_en: string;
}

export interface QuizIntento {
  id: string;
  user_id: string;
  entrada_id: string;
  puntuacion: number;
  respuestas: Record<string, number>;
  fecha_intento: string;
}

// Tipos de bloques de contenido
export type TipoBloque = 'texto' | 'imagen' | 'codigo' | 'latex' | 'video' | 'markdown';

export interface ContenidoBloque {
  id: string;
  tipo: TipoBloque;
  contenido: any;
  orden: number;
}

export interface BloqueTexto extends ContenidoBloque {
  tipo: 'texto';
  contenido: {
    texto: string;
    formato?: 'normal' | 'titulo' | 'subtitulo' | 'lista' | 'markdown';
  };
}

export interface BloqueImagen extends ContenidoBloque {
  tipo: 'imagen';
  contenido: {
    url: string;
    alt: string;
    caption?: string;
    width?: number; // Percentage: 25, 50, 75, 100
  };
}

export interface BloqueCodigo extends ContenidoBloque {
  tipo: 'codigo';
  contenido: {
    codigo: string;
    lenguaje: 'python' | 'javascript' | 'typescript' | 'cpp' | 'java' | 'html' | 'css' | 'sql';
    mostrarLineas?: boolean;
  };
}

export interface BloqueLatex extends ContenidoBloque {
  tipo: 'latex';
  contenido: {
    formula: string;
    inline?: boolean;
  };
}

export interface BloqueVideo extends ContenidoBloque {
  tipo: 'video';
  contenido: {
    url: string;
    tipo: 'youtube' | 'vimeo';
    videoId: string;
  };
}

export interface BloqueMarkdown extends ContenidoBloque {
  tipo: 'markdown';
  contenido: {
    markdown: string;
  };
}
