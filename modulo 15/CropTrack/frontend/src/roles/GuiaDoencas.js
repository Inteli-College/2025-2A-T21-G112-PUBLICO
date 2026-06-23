import React from 'react';

const DISEASES = [
  {
    key: 'leaf_rust', name: 'Ferrugem', sci: 'Hemileia vastatrix', type: 'Doença · fungo', color: '#ef4444',
    img: '/diseases/ferrugem.png',
    sym: 'Manchas amareladas na face superior e pústulas alaranjadas (urédias) na face inferior. Em ataques severos causa desfolha e queda de produção.',
  },
  {
    key: 'brown_eye_spot', name: 'Cercosporiose', alt: 'mancha-olho-pardo', sci: 'Cercospora coffeicola', type: 'Doença · fungo', color: '#f97316',
    img: '/diseases/cercosporiose.jpg',
    sym: 'Manchas circulares marrons com centro palha e halo amarelo ("olho de pomba"). Atinge folhas e frutos; piora com deficiência nutricional.',
  },
  {
    key: 'leaf_miner', name: 'Bicho-mineiro', sci: 'Leucoptera coffeella', type: 'Praga · lagarta', color: '#a855f7',
    img: '/diseases/bicho-mineiro.jpg', illustrative: true,
    sym: 'A larva abre minas (galerias) entre as faces da folha, formando lesões marrom-claras que secam. Mais agressivo em épocas de estiagem.',
  },
  {
    key: 'healthy', name: 'Saudável', sci: 'Coffea arabica', type: 'Referência', color: '#34d399',
    img: '/diseases/saudavel.jpg',
    sym: 'Folha verde, íntegra e brilhante — sem manchas, minas ou bronzeamento. Use como base de comparação no campo.',
  },
];

export default function GuiaDoencas() {
  return (
    <div className="rp">
      <div className="rp-head">
        <span className="rp-eyebrow">§ Guia de campo</span>
        <h1 className="rp-title">Gabarito de doenças e pragas</h1>
        <p className="rp-sub">Como reconhecer cada classe que a IA detecta no café — a referência pra levar pra coleta.</p>
      </div>

      <div className="guia-grid">
        {DISEASES.map((d) => (
          <div className="guia-card" key={d.key}>
            <div className="guia-img" style={{ borderColor: d.color }}>
              <img src={d.img} alt={d.name} loading="lazy" />
              {d.illustrative && <span className="guia-illus">imagem ilustrativa</span>}
            </div>
            <div className="guia-body">
              <div className="guia-name">
                <span className="badge-dot" style={{ background: d.color }} />
                {d.name}{d.alt && <span className="guia-alt"> · {d.alt}</span>}
              </div>
              <div className="guia-sci">{d.sci} · {d.type}</div>
              <p className="guia-sym">{d.sym}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="guia-credit">
        Imagens: Wikimedia Commons (licença livre). Bicho-mineiro e ácaro: imagens ilustrativas do tipo de dano / da espécie.
      </p>
    </div>
  );
}
