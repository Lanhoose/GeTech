import { resumoPecas } from './pecas-os.js';

export const idFicha = new URL(location.href).searchParams.get('maquina');

export function urlFicha(id) {
    const url = new URL('manutencao.html', location.href);
    url.searchParams.set('maquina', id);
    return url.href;
}

export function anexarFoto(container, fonte) {
    if (!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(fonte || '')) return;
    const foto = document.createElement('img');
    foto.className = 'foto-servico';
    foto.src = fonte;
    foto.alt = 'Foto do serviço realizado';
    container.append(foto);
}

let fichaMostrada;

export function abrirFicha(maquina, ordens) {
    const dialogo = document.getElementById('fichaMaquina');
    document.getElementById('tituloFichaMaquina').textContent = maquina.nome;
    const formatar = data => /^\d{4}-\d{2}-\d{2}$/.test(data || '') ? data.split('-').reverse().join('/') : 'Não informada';
    document.getElementById('dadosFichaMaquina').textContent =
        `Modelo: ${maquina.modelo || '—'} · Série: ${maquina.serie || '—'} · Próxima preventiva: ${formatar(maquina.proximaPreventiva)}`;

    const link = document.getElementById('linkFichaMaquina');
    link.href = urlFicha(maquina.id);
    const destinoQR = document.getElementById('qrMaquina');
    if (destinoQR && !destinoQR.childElementCount && window.qrcode) {
        const qr = window.qrcode(0, 'M');
        qr.addData(link.href);
        qr.make();
        const imagem = document.createElement('img');
        imagem.src = qr.createDataURL(5, 20);
        imagem.alt = 'QR Code da ficha da máquina';
        const baixar = document.createElement('a');
        baixar.href = imagem.src;
        baixar.download = `GeTech-${maquina.id}-QR.gif`;
        baixar.textContent = 'Baixar QR Code';
        destinoQR.textContent = '';
        destinoQR.append(imagem, baixar);
    } else if (destinoQR && !destinoQR.childElementCount) {
        destinoQR.textContent = 'QR Code indisponível. Use o link da ficha.';
    }

    const historico = document.getElementById('historicoFichaMaquina');
    historico.replaceChildren();
    if (!ordens.length) historico.textContent = 'Nenhuma ordem disponível para esta máquina.';
    const ordenadas = [...ordens].sort((a, b) => {
        const fechadas = Number(b.status === 'concluido') - Number(a.status === 'concluido');
        const data = os => new Date(os.encerradaEm || os.criadoEm || 0).getTime() || 0;
        return fechadas || data(b) - data(a);
    });
    for (const os of ordenadas) {
        const item = document.createElement('article');
        item.className = 'maq-card';
        const titulo = document.createElement('strong');
        titulo.textContent = `${os.data || 'Sem data'} · ${os.status || 'Sem status'}`;
        const servico = document.createElement('p');
        servico.textContent = [os.descricao, os.execucao?.relato, resumoPecas(os.pecas)].filter(Boolean).join(' · ');
        item.append(titulo, servico);
        anexarFoto(item, os.execucao?.foto);
        historico.append(item);
    }
    if (fichaMostrada !== maquina.id) {
        fichaMostrada = maquina.id;
        dialogo.showModal();
    }
}
