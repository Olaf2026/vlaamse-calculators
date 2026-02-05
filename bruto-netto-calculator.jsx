import React, { useState } from 'react';

export default function BrutoNettoCalculator() {
  const [phase, setPhase] = useState('initial'); // initial, amount, personal, result
  const [data, setData] = useState({});
  const [result, setResult] = useState(null);

  // Belastingschalen 2026 (voor inkomsten 2025)
  const TAX_BRACKETS_2026 = [
    { max: 15200, rate: 0.25 },
    { max: 26830, rate: 0.40 },
    { max: 49840, rate: 0.45 },
    { max: Infinity, rate: 0.50 }
  ];

  const BELASTINGVRIJE_SOM = {
    basis: 10910,
    perKind: 1890
  };

  const RSZ_PERCENTAGE = 0.1307; // 13,07% werknemersbijdrage

  const calculateBrutoNetto = (inputData) => {
    const brutoMaand = parseFloat(inputData.brutoMaandloon);
    const brutoJaar = brutoMaand * 13.92; // 12 maanden + vakantiegeld + eindejaarspremie
    
    // Stap 1: RSZ aftrek
    const rszAftrek = brutoJaar * RSZ_PERCENTAGE;
    const naBelastbaar = brutoJaar - rszAftrek;
    
    // Stap 2: Forfaitaire beroepskosten (vereenvoudigd 30%, max €5.930)
    const beroepskosten = Math.min(naBelastbaar * 0.30, 5930);
    const belastbaarInkomen = naBelastbaar - beroepskosten;
    
    // Stap 3: Belastingvrije som
    const aantalKinderen = parseInt(inputData.kinderenTenLaste) || 0;
    const belastingvrijeSom = BELASTINGVRIJE_SOM.basis + (aantalKinderen * BELASTINGVRIJE_SOM.perKind);
    const belastbaarNaBelastingvrijeSom = Math.max(0, belastbaarInkomen - belastingvrijeSom);
    
    // Stap 4: Progressieve belasting berekenen
    let personenbelasting = 0;
    let remaining = belastbaarNaBelastingvrijeSom;
    let previousMax = 0;
    
    for (const bracket of TAX_BRACKETS_2026) {
      if (remaining <= 0) break;
      
      const bracketSize = bracket.max - previousMax;
      const taxableInBracket = Math.min(remaining, bracketSize);
      personenbelasting += taxableInBracket * bracket.rate;
      remaining -= taxableInBracket;
      previousMax = bracket.max;
    }
    
    // Gemeentebelasting (gemiddeld 7% van personenbelasting)
    const gemeentebelasting = personenbelasting * 0.07;
    const totaleBelasting = personenbelasting + gemeentebelasting;
    
    // Netto berekening
    const nettoJaar = brutoJaar - rszAftrek - totaleBelasting;
    const nettoMaand = nettoJaar / 12;
    
    // Percentage van bruto dat netto wordt
    const nettoPercentage = (nettoMaand / brutoMaand) * 100;
    
    return {
      bruto: {
        maand: brutoMaand,
        jaar: brutoJaar
      },
      rsz: {
        bedrag: rszAftrek,
        percentage: RSZ_PERCENTAGE * 100
      },
      belastbaar: {
        voorBeroepskosten: naBelastbaar,
        beroepskosten: beroepskosten,
        naBeroepskosten: belastbaarInkomen,
        belastingvrijeSom: belastingvrijeSom,
        belastbaar: belastbaarNaBelastingvrijeSom
      },
      belasting: {
        personenbelasting: personenbelasting,
        gemeentebelasting: gemeentebelasting,
        totaal: totaleBelasting
      },
      netto: {
        maand: nettoMaand,
        jaar: nettoJaar
      },
      nettoPercentage: nettoPercentage,
      effectiefTarief: (totaleBelasting / brutoJaar) * 100
    };
  };

  const goBack = () => {
    if (phase === 'result') setPhase('personal');
    else if (phase === 'personal') setPhase('amount');
    else if (phase === 'amount') setPhase('initial');
    else if (phase === 'initial') {
      setData({});
      setResult(null);
    }
  };

  const restart = () => {
    setPhase('initial');
    setData({});
    setResult(null);
  };

  const handleTypeInkomen = (type) => {
    setData({ typeInkomen: type });
    setPhase('amount');
  };

  const handleBrutoLoon = (value) => {
    setData({ ...data, brutoMaandloon: value });
    setPhase('personal');
  };

  const handleBurgerlijkeStaat = (value) => {
    setData({ ...data, burgerlijkeStaat: value });
  };

  const handleKinderen = (value) => {
    const finalData = { ...data, kinderenTenLaste: value };
    setData(finalData);
    
    const berekening = calculateBrutoNetto(finalData);
    setResult(berekening);
    setPhase('result');
  };

  const adjustByPercentage = (percentage) => {
    const currentBruto = parseFloat(data.brutoMaandloon);
    const newBruto = currentBruto * (1 + percentage / 100);
    const newData = { ...data, brutoMaandloon: newBruto.toFixed(2) };
    setData(newData);
    
    const berekening = calculateBrutoNetto(newData);
    setResult(berekening);
  };

  // Result screen
  if (phase === 'result' && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Back button */}
            <button
              onClick={goBack}
              className="mb-4 text-blue-600 hover:text-blue-800 flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Terug
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Jouw Bruto-Netto Berekening</h2>
              
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Bruto per maand</div>
                  <div className="text-3xl font-bold text-blue-600">€{result.bruto.maand.toFixed(2)}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Netto per maand</div>
                  <div className="text-3xl font-bold text-green-600">€{result.netto.maand.toFixed(2)}</div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                Je houdt <span className="font-semibold text-green-600">{result.nettoPercentage.toFixed(1)}%</span> van je bruto loon • 
                Effectief belastingtarief: <span className="font-semibold">{result.effectiefTarief.toFixed(2)}%</span>
              </div>
            </div>

            {/* Quick adjustments */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6 border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-3 text-sm">🔮 Wat-als scenario's:</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => adjustByPercentage(-10)}
                  className="px-3 py-1 bg-white border border-purple-300 rounded text-sm hover:bg-purple-50 transition"
                >
                  -10%
                </button>
                <button
                  onClick={() => adjustByPercentage(-5)}
                  className="px-3 py-1 bg-white border border-purple-300 rounded text-sm hover:bg-purple-50 transition"
                >
                  -5%
                </button>
                <button
                  onClick={() => adjustByPercentage(5)}
                  className="px-3 py-1 bg-white border border-purple-300 rounded text-sm hover:bg-purple-50 transition"
                >
                  +5%
                </button>
                <button
                  onClick={() => adjustByPercentage(10)}
                  className="px-3 py-1 bg-white border border-purple-300 rounded text-sm hover:bg-purple-50 transition"
                >
                  +10%
                </button>
                <button
                  onClick={() => adjustByPercentage(20)}
                  className="px-3 py-1 bg-white border border-purple-300 rounded text-sm hover:bg-purple-50 transition"
                >
                  +20%
                </button>
              </div>
              <p className="text-xs text-purple-700 mt-2">Klik op een percentage om je bruto loon aan te passen en direct het nieuwe netto te zien</p>
            </div>

            {/* Detailed breakdown */}
            <div className="space-y-4 mb-8">
              {/* RSZ Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 text-red-600 font-bold">1</span>
                  RSZ-bijdragen (Sociale Zekerheid)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bruto jaarloon:</span>
                    <span className="font-medium">€{result.bruto.jaar.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-700">
                    <span>RSZ-aftrek ({result.rsz.percentage}%):</span>
                    <span className="font-medium">-€{result.rsz.bedrag.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="font-semibold">Na RSZ:</span>
                    <span className="font-semibold">€{result.belastbaar.voorBeroepskosten.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Belastbare basis */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 text-orange-600 font-bold">2</span>
                  Belastbare basis
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Na RSZ:</span>
                    <span className="font-medium">€{result.belastbaar.voorBeroepskosten.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-orange-700">
                    <span>Forfaitaire beroepskosten (30%):</span>
                    <span className="font-medium">-€{result.belastbaar.beroepskosten.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="font-semibold">Belastbaar inkomen:</span>
                    <span className="font-semibold">€{result.belastbaar.naBeroepskosten.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-700">
                    <span>Belastingvrije som:</span>
                    <span className="font-medium">-€{result.belastbaar.belastingvrijeSom.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="font-semibold">Belastbaar na vrijstelling:</span>
                    <span className="font-semibold">€{result.belastbaar.belastbaar.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Belastingen */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 text-purple-600 font-bold">3</span>
                  Belastingen
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-purple-700">
                    <span>Personenbelasting (progressief):</span>
                    <span className="font-medium">-€{result.belasting.personenbelasting.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-purple-700">
                    <span>Gemeentebelasting (±7%):</span>
                    <span className="font-medium">-€{result.belasting.gemeentebelasting.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="font-semibold">Totale belasting:</span>
                    <span className="font-semibold text-purple-700">-€{result.belasting.totaal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Final netto */}
              <div className="bg-green-50 rounded-lg p-6 border-2 border-green-300">
                <h3 className="font-bold text-lg text-green-800 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center mr-3 text-green-700 font-bold">✓</span>
                  Netto resultaat
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-green-800">Netto per maand:</span>
                    <span className="font-bold text-green-700">€{result.netto.maand.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Netto per jaar:</span>
                    <span className="font-medium">€{result.netto.jaar.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-yellow-900 mb-2">Belangrijke opmerkingen:</h3>
              <ul className="space-y-1 text-sm text-yellow-800">
                <li>• Dit is een <strong>vereenvoudigde berekening</strong> voor werknemers in loondienst</li>
                <li>• Werkelijke netto kan verschillen door bedrijfsvoorheffing, belastingverminderingen, etc.</li>
                <li>• Berekening gebruikt belastingschalen 2026 (voor inkomsten 2025)</li>
                <li>• Gemeentebelasting varieert per gemeente (hier gemiddeld 7%)</li>
                <li>• Forfaitaire beroepskosten zijn een schatting (30%, max €5.930)</li>
                <li>• Voor exacte berekening: raadpleeg een accountant of tax-on-web.be</li>
              </ul>
            </div>

            <button
              onClick={restart}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Nieuwe berekening
            </button>

            <div className="mt-6 text-center text-sm text-gray-500">
              Gebaseerd op Belgische belastingregels 2025-2026
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Personal data phase
  if (phase === 'personal') {
    if (!data.burgerlijkeStaat) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <button
                onClick={goBack}
                className="mb-4 text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Terug
              </button>

              <div className="mb-6">
                <span className="text-sm font-medium text-blue-600">Stap 3 van 3</span>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '66%' }}></div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">Wat is je burgerlijke staat?</h2>
              <p className="text-gray-600 mb-6">Dit beïnvloedt je belastingvrije som en eventuele kortingen</p>

              <div className="space-y-3">
                <button
                  onClick={() => handleBurgerlijkeStaat('alleenstaand')}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 transition text-left"
                >
                  Alleenstaand
                </button>
                <button
                  onClick={() => handleBurgerlijkeStaat('gehuwd')}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 transition text-left"
                >
                  Gehuwd / Wettelijk samenwonend
                </button>
                <button
                  onClick={() => handleBurgerlijkeStaat('samenwonend')}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 transition text-left"
                >
                  Feitelijk samenwonend
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Kinderen question
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <button
              onClick={goBack}
              className="mb-4 text-blue-600 hover:text-blue-800 flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Terug
            </button>

            <div className="mb-6">
              <span className="text-sm font-medium text-blue-600">Stap 3 van 3 (laatste vraag)</span>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">Hoeveel kinderen heb je fiscaal ten laste?</h2>
            <p className="text-gray-600 mb-6">Kinderen ten laste verhogen je belastingvrije som met €{BELASTINGVRIJE_SOM.perKind} per kind</p>

            <div className="space-y-4">
              <input
                type="number"
                min="0"
                max="10"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:border-blue-600 focus:outline-none"
                placeholder="Bijv. 2"
                id="kinderenInput"
                defaultValue="0"
                key="kinderen-input"
              />
              <button
                onClick={() => {
                  const input = document.getElementById('kinderenInput');
                  if (input) {
                    handleKinderen(input.value || '0');
                  }
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Bereken mijn netto loon
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Amount phase
  if (phase === 'amount') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <button
              onClick={goBack}
              className="mb-4 text-blue-600 hover:text-blue-800 flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Terug
            </button>

            <div className="mb-6">
              <span className="text-sm font-medium text-blue-600">Stap 2 van 3</span>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '33%' }}></div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">Wat is je bruto maandloon?</h2>
            <p className="text-gray-600 mb-2">Dit is je loon <strong>na werkgevers-RSZ</strong>, vóór jouw eigen RSZ en belastingen</p>
            <p className="text-sm text-gray-500 mb-6">
              💡 Tip: Dit staat meestal op je loonbrief als "Bruto maandloon" of "Brutoloon"
            </p>

            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500 text-lg">€</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  className="w-full border-2 border-gray-300 rounded-lg pl-10 pr-4 py-3 text-lg focus:border-blue-600 focus:outline-none"
                  placeholder="Bijv. 3000"
                  id="brutoInput"
                  key="bruto-input"
                />
              </div>
              <button
                onClick={() => {
                  const input = document.getElementById('brutoInput');
                  if (input && input.value) {
                    handleBrutoLoon(input.value);
                  }
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Volgende
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initial screen - type inkomen
  if (phase === 'initial') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Bruto-Netto Calculator</h1>
              <p className="text-gray-600">Bereken je netto inkomen in België</p>
            </div>

            <div className="mb-6">
              <span className="text-sm font-medium text-blue-600">Stap 1 van 3</span>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">Wat is je type inkomen?</h2>
            <p className="text-gray-600 mb-6">Kies het type dat op jou van toepassing is</p>

            <div className="space-y-3">
              <button
                onClick={() => handleTypeInkomen('loondienst')}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 transition text-left"
              >
                <div className="font-semibold">Loondienst (werknemer)</div>
                <div className="text-sm opacity-90">Bediende, arbeider, contract van bepaalde/onbepaalde duur</div>
              </button>
              <button
                onClick={() => handleTypeInkomen('zelfstandige')}
                className="w-full bg-gray-400 text-white py-4 px-6 rounded-lg font-medium cursor-not-allowed text-left"
                disabled
              >
                <div className="font-semibold">Zelfstandige</div>
                <div className="text-sm opacity-90">Binnenkort beschikbaar</div>
              </button>
              <button
                onClick={() => handleTypeInkomen('uitkering')}
                className="w-full bg-gray-400 text-white py-4 px-6 rounded-lg font-medium cursor-not-allowed text-left"
                disabled
              >
                <div className="font-semibold">Uitkering</div>
                <div className="text-sm opacity-90">Binnenkort beschikbaar</div>
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              België 2025-2026 • Gebaseerd op officiële belastingschalen
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
