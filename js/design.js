
function applyStyles() {
    
    $('body').css({
        'background-color': '#ffffff',
        'color': '#2d2a26',
        'font-family': "'Outfit', sans-serif",
        'line-height': '1.5',
        'min-height': '100vh',
        'display': 'flex',
        'flex-direction': 'column',
        'margin': '0',
        'padding': '0'
    });

    $('a').css({
        'color': 'inherit',
        'text-decoration': 'none',
        'transition': '0.15s ease'
    });

    $('button').css({
        'font-family': 'inherit',
        'background': 'none',
        'border': 'none',
        'cursor': 'pointer',
        'transition': '0.15s ease'
    });

    $('img').css({
        'max-width': '100%',
        'display': 'block',
        'border-radius': '16px'
    });

    $('.contenedor-principal').css({
        'width': '100%',
        'max-width': '1400px',
        'margin': '0 auto',
        'padding': '100px 24px 40px',
        'flex': '1 0 auto'
    });

    $('footer').css({
        'background-color': '#fbfbfa',
        'border-top': '1px solid #D9D5A0',
        'padding': '24px',
        'text-align': 'center',
        'color': '#8C533E',
        'font-size': '0.9rem',
        'margin-top': 'auto'
    });

    $('.footer-generico, .footer-bienvenida').css({
        'display': 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
        'gap': '8px',
        'font-weight': '500'
    });

    $('.linea-principal').css({
        'position': 'fixed',
        'top': '0',
        'left': '0',
        'right': '0',
        'height': '80px',
        'background-color': 'rgba(255, 255, 255, 0.85)',
        'backdrop-filter': 'blur(16px)',
        '-webkit-backdrop-filter': 'blur(16px)',
        'border-bottom': '1px solid #D9D5A0',
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'space-between',
        'padding': '0 24px',
        'z-index': '1000'
    });

    $('.contenedor-logo').css({
        'font-family': "'Fredericka the Great', serif",
        'font-size': '2.1rem',
        'font-weight': 'normal',
        'text-transform': 'uppercase',
        'display': 'flex',
        'align-items': 'center',
        'gap': '0',
        'letter-spacing': '1px'
    });

    $('.contenedor-logo span').css({
        'display': 'inline-block',
        'transition': '0.15s ease'
    });

    $('.contenedor-logo span:nth-child(1)').css('color', '#8C533E');
    $('.contenedor-logo span:nth-child(2)').css('color', '#B1BF49');
    $('.contenedor-logo span:nth-child(3)').css('color', '#D9A679');
    $('.contenedor-logo span:nth-child(4)').css('color', '#9DA658');
    $('.contenedor-logo span:nth-child(5)').css('color', '#8C533E');
    $('.contenedor-logo span:nth-child(6)').css('color', '#B1BF49');
    $('.contenedor-logo span:nth-child(7)').css('color', '#D9A679');
    $('.contenedor-logo span:nth-child(8)').css('color', '#9DA658');

    $('.linea-perfil').css({
        'display': 'flex',
        'align-items': 'center',
        'gap': '8px'
    });

    $('.linea-perfil a').css({
        'padding': '10px 16px',
        'border-radius': '9999px',
        'font-size': '0.95rem',
        'font-weight': '600'
    });

    $('.linea-perfil a:not(.activo)').css({
        'background-color': 'transparent',
        'color': '#2d2a26'
    });

    $('.linea-perfil a.activo').css({
        'background-color': '#2d2a26',
        'color': '#ffffff'
    });

    $('.buscador-pines').css({
        'flex-grow': '1',
        'margin': '0 20px',
        'max-width': '680px'
    });

    $('.contenedor-busqueda').css({
        'position': 'relative',
        'width': '100%'
    });

    $('.input-busqueda').css({
        'width': '100%',
        'height': '44px',
        'border-radius': '9999px',
        'background-color': '#f5f4eb',
        'border': '2px solid transparent',
        'padding': '0 24px 0 44px',
        'color': '#2d2a26',
        'font-family': 'inherit',
        'transition': '0.15s ease'
    });

    $('.linea-perfil-foto').css({
        'display': 'flex',
        'align-items': 'center',
        'gap': '12px'
    });

    $('.avatar-img').css({
        'width': '40px',
        'height': '40px',
        'border-radius': '50%',
        'object-fit': 'cover'
    });

    $('.avatar-imagen').css({
        'width': '100%',
        'height': '100%',
        'border-radius': '50%',
        'object-fit': 'cover',
        'display': 'block'
    });

    $('.avatar-placeholder').css({
        'width': '40px',
        'height': '40px',
        'border-radius': '50%',
        'background-color': '#B1BF49',
        'color': '#ffffff',
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'font-weight': '700',
        'font-size': '1.1rem',
        'text-transform': 'uppercase',
        'flex-shrink': '0',
        'transition': '0.15s ease'
    });

    $('.boton-enviar-cerrar-sesion').css({
        'background-color': '#f5f4eb',
        'border': '1px solid #D9D5A0',
        'color': '#2d2a26',
        'font-size': '0.9rem',
        'font-weight': '600',
        'padding': '8px 16px',
        'border-radius': '9999px',
        'transition': '0.15s ease'
    });

    $('.categoria-item').css({
        'background-color': '#fbfbfa',
        'color': '#8C533E',
        'border': '1px solid #D9D5A0',
        'padding': '8px 18px',
        'border-radius': '9999px',
        'font-size': '0.9rem',
        'font-weight': '600',
        'transition': '0.15s ease'
    });

    $('.categoria-item.activo').css({
        'background-color': '#B1BF49',
        'color': '#ffffff',
        'border-color': '#B1BF49'
    });

    $('.perfil-mosaico').css({
        'column-count': '5',
        'column-gap': '16px',
        'width': '100%'
    });

    $('.pin-tarjeta').css({
        'break-inside': 'avoid',
        'margin-bottom': '16px',
        'border-radius': '16px',
        'display': 'flex',
        'flex-direction': 'column',
        'position': 'relative'
    });

    $('.pin-imagen-contenedor').css({
        'position': 'relative',
        'border-radius': '16px',
        'overflow': 'hidden',
        'background': '#f3f4f6',
        'cursor': 'zoom-in',
        'min-height': '240px',
        'transition': 'background 0.25s ease'
    });

    $('.pin-imagen').css({
        'width': '100%',
        'display': 'block',
        'opacity': '0',
        'transition': 'opacity 0.5s ease-in-out, transform 0.25s ease'
    });

    $('.pin-imagen-contenedor.cargada .pin-imagen').css({
        'opacity': '1'
    });

    $('.pin-overlay').css({
        'position': 'absolute',
        'top': '0',
        'left': '0',
        'right': '0',
        'bottom': '0',
        'background': 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4))',
        'opacity': '0',
        'display': 'flex',
        'flex-direction': 'column',
        'justify-content': 'flex-start',
        'padding': '12px',
        'transition': 'opacity 0.15s ease',
        'z-index': '10'
    });

    $('.boton-guardar-pin').css({
        'background-color': '#B1BF49',
        'color': '#ffffff',
        'font-size': '0.9rem',
        'font-weight': '700',
        'padding': '8px 14px',
        'border-radius': '9999px',
        'align-self': 'flex-end',
        'box-shadow': '0 4px 12px rgba(140, 83, 62, 0.05)',
        'transform': 'translateY(-8px)',
        'transition': '0.15s ease, transform 0.25s ease',
        'cursor': 'pointer',
        'position': 'relative',
        'z-index': '2'
    });

    $('.boton-guardar-pin.guardado').css({
        'background-color': '#767676',
        'color': '#ffffff'
    });

    $('.pin-overlay-link-cover').css({
        'position': 'absolute',
        'top': '0',
        'left': '0',
        'width': '100%',
        'height': '100%',
        'z-index': '1'
    });

    $('.pin-info').css({
        'padding': '8px 4px'
    });

    $('.pin-titulo-mini').css({
        'font-size': '0.88rem',
        'font-weight': '600',
        'color': '#2d2a26',
        'overflow': 'hidden',
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap'
    });

    $('.grupo-formulario').css({
        'margin-bottom': '18px',
        'display': 'flex',
        'flex-direction': 'column'
    });

    $('.label-formulario').css({
        'font-size': '0.88rem',
        'font-weight': '600',
        'color': '#8C533E',
        'margin-bottom': '6px'
    });

    $('.input-formulario, .crear-textarea, .crear-select').css({
        'width': '100%',
        'background-color': '#f5f4eb',
        'border': '2px solid transparent',
        'border-radius': '10px',
        'padding': '12px 16px',
        'color': '#2d2a26',
        'font-family': 'inherit',
        'font-size': '0.95rem',
        'transition': '0.15s ease',
        'box-sizing': 'border-box'
    });

    $('.crear-titulo').css({
        'width': '100%',
        'font-size': '1.6rem',
        'font-weight': '700',
        'background-color': 'transparent',
        'border-bottom': '2px solid #D9D5A0',
        'border-radius': '0',
        'padding': '8px 0',
        'color': '#2d2a26',
        'font-family': 'inherit',
        'transition': '0.15s ease'
    });

    $('.crear-textarea').css('min-height', '100px');

    $('.crear-select').css({
        'appearance': 'none',
        'background-image': "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0a0a0'%3E%3Cpath d='M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z'/%3E%3C/svg%3E\")",
        'background-repeat': 'no-repeat',
        'background-position': 'right 14px center',
        'background-size': '16px',
        'padding-right': '36px'
    });

    $('.checkbox-contenedor').css({
        'display': 'flex',
        'align-items': 'flex-start',
        'gap': '8px',
        'cursor': 'pointer',
        'font-size': '0.88rem',
        'color': '#8C533E'
    });

    $('.checkbox-input').css({
        'appearance': 'none',
        'width': '18px',
        'height': '18px',
        'background-color': '#f5f4eb',
        'border': '2px solid #D9D5A0',
        'border-radius': '4px',
        'cursor': 'pointer',
        'flex-shrink': '0',
        'position': 'relative',
        'transition': '0.15s ease'
    });

    $('.boton-enviar').css({
        'background-color': '#B1BF49',
        'color': '#ffffff',
        'font-size': '0.95rem',
        'font-weight': '700',
        'padding': '12px 24px',
        'border-radius': '9999px',
        'box-shadow': '0 4px 12px rgba(140, 83, 62, 0.05)',
        'display': 'inline-block',
        'transition': '0.15s ease'
    });

    $('.boton-accion-secundario, .boton-accion-cancelar').css({
        'background-color': '#f5f4eb',
        'border': '1px solid #D9D5A0',
        'color': '#2d2a26',
        'font-size': '0.9rem',
        'font-weight': '600',
        'padding': '10px 20px',
        'border-radius': '9999px',
        'display': 'inline-block',
        'transition': '0.15s ease'
    });

    $('.eslogan-lobby').css({
        'text-align': 'center',
        'margin': '30px auto',
        'max-width': '600px'
    });

    $('.eslogan-lobby h1').css({
        'font-size': '2.5rem',
        'font-weight': '900',
        'color': '#2d2a26'
    });

    $('.eslogan-lobby h1 span').css('color', '#B1BF49');

    $('.parrafo-eslogan').css({
        'font-size': '1.15rem',
        'color': '#8C533E'
    });

    $('.contenedor-fondo-bienvenida').css({
        'position': 'relative',
        'width': '100%',
        'height': '480px',
        'border-radius': '16px',
        'overflow': 'hidden',
        'background': '#050505',
        'border': '1px solid #D9D5A0'
    });

    $('.lobby-mosaico-difuminado').css({
        'display': 'grid',
        'grid-template-columns': 'repeat(5, 1fr)',
        'gap': '12px',
        'padding': '12px',
        'filter': 'blur(6px) brightness(0.4)',
        'opacity': '0.5'
    });

    $('.tarjeta-flotante-restriccion').css({
        'position': 'absolute',
        'top': '50%',
        'left': '50%',
        'transform': 'translate(-50%, -50%)',
        'background': 'rgba(20, 20, 20, 0.75)',
        'backdrop-filter': 'blur(20px)',
        '-webkit-backdrop-filter': 'blur(20px)',
        'border': '1px solid #D9D5A0',
        'border-radius': '24px',
        'padding': '32px',
        'width': '90%',
        'max-width': '420px',
        'text-align': 'center',
        'box-shadow': '0 8px 24px rgba(140, 83, 62, 0.08)'
    });

    $('.tarjeta-flotante-titulo').css({
        'font-size': '1.4rem',
        'font-weight': '800',
        'margin-bottom': '8px'
    });

    $('.tarjeta-flotante-descripcion').css({
        'font-size': '0.9rem',
        'color': '#8C533E',
        'margin-bottom': '24px',
        'line-height': '1.5'
    });

    $('.tarjeta-botones').css({
        'display': 'flex',
        'flex-direction': 'column',
        'gap': '10px'
    });

    $('.Boton-primario-bienvenida').css({
        'background-color': '#B1BF49',
        'color': '#ffffff',
        'padding': '12px',
        'border-radius': '9999px',
        'font-weight': '700'
    });

    $('.Boton-secundario-bienvenida').css({
        'background-color': '#f5f4eb',
        'border': '1px solid #D9D5A0',
        'color': '#2d2a26',
        'padding': '12px',
        'border-radius': '9999px',
        'font-weight': '600'
    });

    $('.contenedor-autenticacion').css({
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'padding': '20px',
        'min-height': 'calc(100vh - 200px)'
    });

    $('.tarjeta-autenticacion').css({
        'background-color': '#fbfbfa',
        'border': '1px solid #D9D5A0',
        'border-radius': '28px',
        'padding': '32px',
        'width': '100%',
        'max-width': '440px',
        'box-shadow': '0 8px 24px rgba(140, 83, 62, 0.08)'
    });

    $('.titulo-autenticacion').css({
        'font-size': '1.75rem',
        'font-weight': '800',
        'margin-bottom': '6px'
    });

    $('.subtitulo-autenticacion').css({
        'font-size': '0.9rem',
        'color': '#8C533E',
        'margin-bottom': '24px'
    });

    $('.separador-autenticacion').css({
        'margin': '20px 0',
        'font-size': '0.75rem',
        'font-weight': '700',
        'text-transform': 'uppercase',
        'color': '#8C533E',
        'display': 'flex',
        'align-items': 'center',
        'gap': '10px'
    });

    $('.footer-contenedor-autenticacion').css({
        'margin-top': '20px',
        'font-size': '0.9rem',
        'color': '#8C533E'
    });

    $('.link-autenticacion').css({
        'color': '#B1BF49',
        'font-weight': '700'
    });

    $('.tarjeta-pin-detalle').css({
        'display': 'grid',
        'grid-template-columns': '1.1fr 1fr',
        'background': '#fbfbfa',
        'border': '1px solid #D9D5A0',
        'border-radius': '28px',
        'overflow': 'hidden',
        'box-shadow': '0 8px 24px rgba(140, 83, 62, 0.08)',
        'max-width': '960px',
        'margin': '0 auto'
    });

    $('.pin-detalle-imagen img').css({
        'width': '100%',
        'height': '100%',
        'object-fit': 'cover'
    });

    $('.pin-detalle-info').css({
        'padding': '32px',
        'display': 'flex',
        'flex-direction': 'column'
    });

    $('.pin-detalle-acciones').css({
        'display': 'flex',
        'justify-content': 'flex-end',
        'gap': '10px',
        'margin-bottom': '20px'
    });

    $('.pin-detalle-titulo').css({
        'font-size': '1.8rem',
        'font-weight': '800',
        'margin-bottom': '10px'
    });

    $('.pin-detalle-descripcion').css({
        'font-size': '0.95rem',
        'color': '#8C533E',
        'line-height': '1.5',
        'margin-bottom': '24px'
    });

    $('.pin-detalle-creador').css({
        'display': 'flex',
        'align-items': 'center',
        'gap': '12px',
        'margin-bottom': '24px',
        'border-bottom': '1px solid #D9D5A0',
        'padding-bottom': '16px'
    });

    $('.creador-info').css({
        'display': 'flex',
        'flex-direction': 'column',
        'flex-grow': '1'
    });

    $('.creador-nombre').css({
        'font-weight': '700',
        'font-size': '0.9rem'
    });

    $('.creador-seguidores').css({
        'font-size': '0.8rem',
        'color': '#8C533E'
    });

    $('.boton-seguir').css({
        'background-color': '#f5f4eb',
        'border': '1px solid #D9D5A0',
        'color': '#2d2a26',
        'border-radius': '9999px',
        'padding': '8px 14px',
        'font-weight': '700',
        'font-size': '0.85rem'
    });

    $('.boton-volver').css({
        'display': 'inline-block',
        'margin-bottom': '20px',
        'color': '#8C533E',
        'text-decoration': 'none',
        'font-weight': '600'
    });

    $('.pin-detalle-acciones .boton-guardar-pin').css({
        'transform': 'none',
        'align-self': 'center'
    });

    $('.pin-detalle-tags').css({
        'display': 'flex',
        'flex-wrap': 'wrap',
        'gap': '8px',
        'margin': '12px 0 20px 0'
    });

    $('.pin-tag').css({
        'background-color': '#f1efe0',
        'color': '#8C533E',
        'font-size': '0.85rem',
        'font-weight': '600',
        'padding': '6px 12px',
        'border-radius': '9999px',
        'cursor': 'pointer',
        'transition': 'all 0.15s ease'
    });

    $('.pin-detalle-creador .avatar-placeholder').css({
        'width': '44px',
        'height': '44px',
        'font-size': '1.2rem'
    });

    $('.formulario-comentario .avatar-placeholder').css({
        'width': '32px',
        'height': '32px',
        'font-size': '0.9rem'
    });

    $('.perfil-seccion-pines').css({
        'margin-top': '50px'
    });

    $('.seccion-titulo-recomendados').css({
        'font-size': '1.3rem',
        'margin-bottom': '20px',
        'color': '#2d2a26'
    });

    $('.mosaico-recomendado').css({
        'column-count': '3'
    });

    $('.pin-detalle-comentarios').css({
        'margin-top': 'auto',
        'display': 'flex',
        'flex-direction': 'column',
        'gap': '12px'
    });

    $('.lista-comentarios').css({
        'display': 'flex',
        'flex-direction': 'column',
        'gap': '8px',
        'max-height': '140px',
        'overflow-y': 'auto'
    });

    $('.comentario-item').css({
        'font-size': '0.85rem',
        'background-color': '#f5f4eb',
        'padding': '8px 12px',
        'border-radius': '10px',
        'border': '1px solid #D9D5A0'
    });

    $('.comentario-autor').css({
        'font-weight': '700',
        'color': '#2d2a26'
    });

    $('.formulario-comentario').css({
        'display': 'flex',
        'align-items': 'center',
        'gap': '8px',
        'margin-top': '8px'
    });

    $('.input-comentario').css({
        'flex-grow': '1',
        'background': '#f5f4eb',
        'border': '1px solid #D9D5A0',
        'border-radius': '9999px',
        'padding': '8px 14px',
        'color': '#2d2a26',
        'font-size': '0.88rem'
    });

    $('.boton-enviar-comentario').css({
        'background-color': '#B1BF49',
        'color': '#ffffff',
        'width': '32px',
        'height': '32px',
        'border-radius': '50%',
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center'
    });

    $('.contenedor-crear').css({
        'display': 'grid',
        'grid-template-columns': '1fr 1.15fr',
        'gap': '24px',
        'background': '#fbfbfa',
        'border': '1px solid #D9D5A0',
        'border-radius': '28px',
        'padding': '24px',
        'box-shadow': '0 8px 24px rgba(140, 83, 62, 0.08)'
    });

    $('.zona-subida-archivo').css({
        'background': '#f5f4eb',
        'border': '2px dashed #D9D5A0',
        'border-radius': '20px',
        'display': 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
        'justify-content': 'center',
        'padding': '24px',
        'min-height': '320px',
        'text-align': 'center'
    });

    $('.seccion-etica-subida').css({
        'background-color': '#ffffff',
        'border': '1px solid #D9D5A0',
        'border-radius': '16px',
        'padding': '16px',
        'margin': '16px 0'
    });

    $('.etica-seccion-titulo').css({
        'font-size': '0.9rem',
        'font-weight': '800',
        'color': '#B1BF49',
        'border-bottom': '1px solid #D9D5A0',
        'padding-bottom': '6px',
        'margin-bottom': '10px'
    });

    $('#cabecera-perfil-usuario').css({
        'display': 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
        'text-align': 'center',
        'padding': '20px 0 30px'
    });

    $('#cabecera-perfil-usuario .avatar-placeholder').css({
        'width': '100px',
        'height': '100px',
        'font-size': '2.2rem',
        'margin': '0 auto 16px',
        'border': '3px solid #D9D5A0',
        'box-shadow': '0 4px 12px rgba(140, 83, 62, 0.05)'
    });

    $('.perfil-nombre-completo').css({
        'font-size': '1.8rem',
        'font-weight': '800'
    });

    $('.nombre-usuario').css({
        'font-size': '0.9rem',
        'color': '#8C533E',
        'margin-bottom': '12px'
    });

    $('.perfil-biografia').css({
        'font-size': '0.9rem',
        'line-height': '1.5',
        'margin-bottom': '16px',
        'max-width': '500px'
    });

    $('#btn-seguir-perfil').css({
        'background-color': '#B1BF49',
        'color': '#ffffff',
        'font-size': '0.95rem',
        'font-weight': '700',
        'padding': '12px 24px',
        'border-radius': '9999px',
        'box-shadow': '0 4px 12px rgba(140, 83, 62, 0.05)',
        'transition': '0.15s ease',
        'border': 'none',
        'cursor': 'pointer'
    });

    $('#contador-seguidores, #contador-seguidos').css({
        'cursor': 'pointer',
        'transition': 'opacity 0.15s ease'
    });

    $('.perfil-pestañas').css({
        'display': 'flex',
        'justify-content': 'center',
        'gap': '16px',
        'border-bottom': '1px solid #D9D5A0',
        'padding-bottom': '10px',
        'margin-bottom': '20px'
    });

    $('.pestaña-guardados, .pestaña-creados').css({
        'font-weight': '700',
        'font-size': '0.9rem',
        'color': '#8C533E',
        'cursor': 'pointer',
        'padding': '8px 14px',
        'border-radius': '9999px',
        'transition': '0.15s ease'
    });

    $('.pestaña-creados.activo, .pestaña-guardados.activo').css({
        'background-color': '#2d2a26',
        'color': '#ffffff'
    });

    $('.badge-etico').css({
        'position': 'absolute',
        'top': '10px',
        'left': '10px',
        'padding': '6px 12px',
        'border-radius': '9999px',
        'font-size': '0.75rem',
        'font-weight': '700',
        'z-index': '10',
        'display': 'flex',
        'align-items': 'center',
        'gap': '6px',
        'box-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.15)'
    });

    $('.badge-etico.pending').css({
        'background': 'linear-gradient(135deg, #fef08a 0%, #facc15 100%)',
        'color': '#854d0e',
        'border': '1px solid #fef08a'
    });

    $('.badge-etico.rejected').css({
        'background': 'linear-gradient(135deg, #fecaca 0%, #ef4444 100%)',
        'color': '#ffffff',
        'border': '1px solid #fecaca'
    });

    $('.imagen-desenfocada').css({
        'filter': 'blur(12px)',
        'transition': 'filter 0.5s ease'
    });

    $('.pin-estado-info-overlay').css({
        'position': 'absolute',
        'inset': '0',
        'color': '#ffffff',
        'display': 'flex',
        'flex-direction': 'column',
        'justify-content': 'center',
        'align-items': 'center',
        'padding': '20px',
        'text-align': 'center',
        'z-index': '5',
        'font-family': "'Outfit', sans-serif"
    });

    $('.pin-estado-info-overlay h4').css({
        'font-size': '1.1rem',
        'font-weight': '700',
        'margin-bottom': '8px',
        'display': 'flex',
        'align-items': 'center',
        'gap': '6px'
    });

    $('.pin-estado-info-overlay p').css({
        'font-size': '0.8rem',
        'opacity': '0.9',
        'line-height': '1.3'
    });

    $('.pin-estado-info-overlay.pending').css({
        'background-color': 'rgba(15, 23, 42, 0.65)'
    });

    $('.pin-estado-info-overlay.rejected').css({
        'background-color': 'rgba(239, 68, 68, 0.85)'
    });

    $('#toast-container').css({
        'position': 'fixed',
        'top': '20px',
        'right': '20px',
        'z-index': '9999',
        'display': 'flex',
        'flex-direction': 'column',
        'gap': '10px'
    });

    $('.toast-notificacion').css({
        'background-color': '#ffffff',
        'border-radius': '12px',
        'padding': '16px 20px',
        'box-shadow': '0 10px 25px rgba(0, 0, 0, 0.1)',
        'border-left': '6px solid #B1BF49',
        'min-width': '280px',
        'max-width': '380px',
        'font-family': "'Outfit', sans-serif",
        'display': 'flex',
        'flex-direction': 'column',
        'gap': '4px',
        'transition': 'all 0.3s ease'
    });

    $('.toast-notificacion.success').css({ 'border-left-color': '#B1BF49' });
    $('.toast-notificacion.error').css({ 'border-left-color': '#ef4444' });
    $('.toast-notificacion.warning').css({ 'border-left-color': '#facc15' });
    $('.toast-notificacion.info').css({ 'border-left-color': '#3b82f6' });

    $('.toast-titulo').css({
        'font-weight': '700',
        'font-size': '0.95rem',
        'color': '#2d2a26'
    });

    $('.toast-mensaje').css({
        'font-size': '0.85rem',
        'color': '#8C533E'
    });

    $('.categorias-nav-container').css({
        'margin-bottom': '30px',
        'padding': '10px 0'
    });

    $('#barra-categorias').css({
        'display': 'flex',
        'gap': '12px',
        'justify-content': 'center',
        'flex-wrap': 'wrap'
    });

    $('#input-archivo-real').css({
        'display': 'none'
    });

    $('.label-tags').css({
        'margin-top': '15px',
        'display': 'block'
    });

    $('#input-tags-pin').css({
        'font-size': '1rem',
        'padding': '12px',
        'margin-top': '5px',
        'border-radius': '10px',
        'border': '2px solid transparent',
        'width': '100%',
        'background-color': '#f5f4eb',
        'color': '#2d2a26',
        'box-sizing': 'border-box'
    });

    $('.subtitulo-pruebas').css({
        'font-size': '0.8rem',
        'color': '#8C533E',
        'display': 'block',
        'margin-top': '6px'
    });

    $('#titulo-restriccion').css({
        'color': '#f0f0f0'
    });

    $('#vista-previa-contenedor').css({
        'display': 'none',
        'margin-top': '16px',
        'width': '100%',
        'max-height': '350px',
        'border-radius': '16px',
        'overflow': 'hidden',
        'box-shadow': '0 4px 12px rgba(0,0,0,0.08)'
    });

    $('#img-vista-previa').css({
        'width': '100%',
        'height': 'auto',
        'display': 'block',
        'object-fit': 'cover',
        'border-radius': '16px'
    });

    $('.modal-backdrop').css({
        'position': 'fixed',
        'top': '0',
        'left': '0',
        'width': '100%',
        'height': '100%',
        'background-color': 'rgba(0, 0, 0, 0.5)',
        'z-index': '1100',
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'font-family': "'Outfit', sans-serif",
        'box-sizing': 'border-box'
    });

    $('.modal-contenido').css({
        'background-color': '#fbfbfa',
        'border': '1px solid #D9D5A0',
        'border-radius': '24px',
        'padding': '32px',
        'width': '90%',
        'max-width': '480px',
        'box-shadow': '0 10px 30px rgba(140, 83, 62, 0.15)',
        'position': 'relative',
        'box-sizing': 'border-box'
    });

    $('.modal-titulo').css({
        'font-size': '1.5rem',
        'font-weight': '800',
        'color': '#2d2a26',
        'margin-top': '0',
        'margin-bottom': '20px'
    });

    $('.modal-acciones').css({
        'display': 'flex',
        'justify-content': 'flex-end',
        'gap': '12px',
        'margin-top': '24px'
    });

    $('.checkbox-input').each(function() {
        if ($(this).is(':checked')) {
            $(this).css({
                'background-color': '#B1BF49',
                'border-color': '#B1BF49',
                'background-image': "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23ffffff'%3E%3Cpath d='M0 11l2-2 5 5L18 3l2 2L7 18z'/%3E%3C/svg%3E\")",
                'background-repeat': 'no-repeat',
                'background-position': 'center',
                'background-size': '12px'
            });
        } else {
            $(this).css({
                'background-color': '#f5f4eb',
                'border-color': '#D9D5A0',
                'background-image': 'none'
            });
        }
    });

    if ($(window).width() > 768 && $(window).width() <= 1024) {
        $('.buscador-pines').css({ 'max-width': '350px', 'margin': '0 10px', 'display': 'block' });
        $('.contenedor-logo').css('font-size', '1.6rem');
    } else if ($(window).width() > 1024) {
        $('.buscador-pines').css({ 'max-width': '680px', 'margin': '0 20px', 'display': 'block' });
        $('.contenedor-logo').css('font-size', '2.1rem');
    }

    if ($(window).width() <= 768) {
        $('.linea-principal').css({ 'height': '70px', 'padding': '0 16px' });
        $('.buscador-pines').css('display', 'none');
        $('.contenedor-logo').css('font-size', '1.25rem');
        $('.linea-perfil a').css({ 'padding': '8px 12px', 'font-size': '0.88rem' });
        $('.boton-enviar-cerrar-sesion').css({ 'padding': '6px 12px', 'font-size': '0.85rem' });
        $('.avatar-placeholder').css({ 'width': '36px', 'height': '36px', 'font-size': '1rem' });
        $('.perfil-mosaico').css({ 'column-count': '2', 'column-gap': '12px' });
        $('.contenedor-crear').css('grid-template-columns', '1fr');
        $('.mosaico-recomendado').css('column-count', '2');
        $('.tarjeta-pin-detalle').css('grid-template-columns', '1fr');
    }

    $('.boton-eliminar-pin').css({
        'background-color': '#e11d48',
        'color': '#ffffff',
        'font-size': '0.82rem',
        'font-weight': '700',
        'padding': '8px 14px',
        'border-radius': '9999px',
        'align-self': 'flex-start',
        'box-shadow': '0 4px 12px rgba(140, 83, 62, 0.05)',
        'cursor': 'pointer',
        'position': 'relative',
        'z-index': '2',
        'transition': '0.15s ease',
        'transform': 'translateY(-8px)'
    });
}

$(document)
    .on('mouseenter', '.contenedor-logo span', function() {
        $(this).css({ 'transform': 'scale(1.1) translateY(-2px)' });
    })
    .on('mouseleave', '.contenedor-logo span', function() {
        $(this).css({ 'transform': 'none' });
    })
    .on('mouseenter', '.linea-perfil a', function() {
        if (!$(this).hasClass('activo')) {
            $(this).css('background-color', '#eef1d4');
        }
    })
    .on('mouseleave', '.linea-perfil a', function() {
        if (!$(this).hasClass('activo')) {
            $(this).css('background-color', 'transparent');
        }
    })
    .on('mouseenter', '.input-busqueda', function() {
        if (!$(this).is(':focus')) {
            $(this).css('background-color', '#eef1d4');
        }
    })
    .on('mouseleave', '.input-busqueda', function() {
        if (!$(this).is(':focus')) {
            $(this).css('background-color', '#f5f4eb');
        }
    })
    .on('focus', '.input-busqueda', function() {
        $(this).css({ 'background-color': '#ffffff', 'border-color': '#B1BF49' });
    })
    .on('blur', '.input-busqueda', function() {
        $(this).css({ 'background-color': '#f5f4eb', 'border-color': 'transparent' });
    })
    .on('mouseenter', '.avatar-placeholder', function() {
        $(this).css('transform', 'scale(1.05)');
    })
    .on('mouseleave', '.avatar-placeholder', function() {
        $(this).css('transform', 'none');
    })
    .on('mouseenter', '.boton-enviar-cerrar-sesion', function() {
        $(this).css({ 'background-color': '#B1BF49', 'color': '#ffffff', 'border-color': 'transparent' });
    })
    .on('mouseleave', '.boton-enviar-cerrar-sesion', function() {
        $(this).css({ 'background-color': '#f5f4eb', 'color': '#2d2a26', 'border-color': '#D9D5A0' });
    })
    .on('mouseenter', '.categoria-item', function() {
        if (!$(this).hasClass('activo')) {
            $(this).css({ 'background-color': '#f5f4eb', 'color': '#2d2a26' });
        }
    })
    .on('mouseleave', '.categoria-item', function() {
        if (!$(this).hasClass('activo')) {
            $(this).css({ 'background-color': '#fbfbfa', 'color': '#8C533E' });
        }
    })
    .on('mouseenter', '.pin-tarjeta', function() {
        $(this).find('.pin-imagen').css('transform', 'scale(1.04)');
        $(this).find('.pin-overlay').css('opacity', '1');
        $(this).find('.boton-guardar-pin, .boton-eliminar-pin').css('transform', 'translateY(0)');
    })
    .on('mouseleave', '.pin-tarjeta', function() {
        $(this).find('.pin-imagen').css('transform', 'none');
        $(this).find('.pin-overlay').css('opacity', '0');
        $(this).find('.boton-guardar-pin, .boton-eliminar-pin').css('transform', 'translateY(-8px)');
    })
    .on('mouseenter', '.boton-guardar-pin', function() {
        if (!$(this).hasClass('guardado')) {
            $(this).css('background-color', '#9DA658');
        } else {
            $(this).css('background-color', '#5a5a5a');
        }
    })
    .on('mouseleave', '.boton-guardar-pin', function() {
        if (!$(this).hasClass('guardado')) {
            $(this).css('background-color', '#B1BF49');
        } else {
            $(this).css('background-color', '#767676');
        }
    })
    .on('mouseenter', '.boton-eliminar-pin', function() {
        $(this).css('background-color', '#be123c');
    })
    .on('mouseleave', '.boton-eliminar-pin', function() {
        $(this).css('background-color', '#e11d48');
    })
    .on('mouseenter', '.pin-tag', function() {
        $(this).css('background-color', '#eef1d4');
    })
    .on('mouseleave', '.pin-tag', function() {
        $(this).css('background-color', '#f1efe0');
    })
    .on('mouseenter', '.input-formulario, .crear-textarea, .crear-select', function() {
        if (!$(this).is(':focus')) {
            $(this).css('background-color', '#eef1d4');
        }
    })
    .on('mouseleave', '.input-formulario, .crear-textarea, .crear-select', function() {
        if (!$(this).is(':focus')) {
            $(this).css('background-color', '#f5f4eb');
        }
    })
    .on('focus', '.input-formulario, .crear-textarea, .crear-select', function() {
        $(this).css({ 'background-color': '#ffffff', 'border-color': '#B1BF49' });
    })
    .on('blur', '.input-formulario, .crear-textarea, .crear-select', function() {
        $(this).css({ 'background-color': '#f5f4eb', 'border-color': 'transparent' });
    })
    .on('mouseenter', '.boton-enviar', function() {
        $(this).css({ 'background-color': '#9DA658', 'transform': 'translateY(-1px)' });
    })
    .on('mouseleave', '.boton-enviar', function() {
        $(this).css({ 'background-color': '#B1BF49', 'transform': 'none' });
    })
    .on('mouseenter', '.boton-accion-secundario, .boton-accion-cancelar', function() {
        $(this).css('background-color', '#eef1d4');
    })
    .on('mouseleave', '.boton-accion-secundario, .boton-accion-cancelar', function() {
        $(this).css('background-color', '#f5f4eb');
    })
    .on('mouseenter', '.pestaña-guardados, .pestaña-creados', function() {
        if (!$(this).hasClass('activo')) {
            $(this).css({ 'background-color': '#f5f4eb', 'color': '#2d2a26' });
        }
    })
    .on('mouseleave', '.pestaña-guardados, .pestaña-creados', function() {
        if (!$(this).hasClass('activo')) {
            $(this).css({ 'background-color': 'transparent', 'color': '#8C533E' });
        }
    })
    .on('change', '.checkbox-input', function() {
        if ($(this).is(':checked')) {
            $(this).css({
                'background-color': '#B1BF49',
                'border-color': '#B1BF49',
                'background-image': "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23ffffff'%3E%3Cpath d='M0 11l2-2 5 5L18 3l2 2L7 18z'/%3E%3C/svg%3E\")",
                'background-repeat': 'no-repeat',
                'background-position': 'center',
                'background-size': '12px'
            });
        } else {
            $(this).css({
                'background-color': '#f5f4eb',
                'border-color': '#D9D5A0',
                'background-image': 'none'
            });
        }
    })
    .on('mouseenter', '#btn-seguir-perfil', function() {
        if (!$(this).hasClass('siguiendo')) {
            $(this).css({ 'background-color': '#9DA658', 'transform': 'translateY(-1px)' });
        } else {
            $(this).css({ 'background-color': '#1a1816', 'transform': 'translateY(-1px)' });
        }
    })
    .on('mouseleave', '#btn-seguir-perfil', function() {
        if (!$(this).hasClass('siguiendo')) {
            $(this).css({ 'background-color': '#B1BF49', 'transform': 'none' });
        } else {
            $(this).css({ 'background-color': '#2d2a26', 'transform': 'none' });
        }
    })
    .on('mouseenter', '#contador-seguidores, #contador-seguidos', function() {
        $(this).css({ 'text-decoration': 'underline', 'opacity': '0.8' });
    })
    .on('mouseleave', '#contador-seguidores, #contador-seguidos', function() {
        $(this).css({ 'text-decoration': 'none', 'opacity': '1' });
    });

$(function() {
    applyStyles();
    
    $(window).on('resize', function() {
        applyStyles();
    });
});