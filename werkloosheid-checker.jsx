import React, { useState } from 'react';

export default function WerkloosheidChecker() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const questions = [
    {
      id: 'leeftijd',
      question: 'Wat is je leeftijd?',
      type: 'number',
      hint: 'Dit bepaalt hoeveel dagen je moet hebben gewerkt'
    },
    {
      id: 'gewerkteDagen',
      question: answers.leeftijd < 36 
        ? 'Heb je minstens 312 dagen gewerkt in de afgelopen 21 maanden?'
        : answers.leeftijd >= 50
        ? 'Heb je minstens 624 dagen gewerkt in de afgelopen 42 maanden?'
        : 'Heb je minstens 468 dagen gewerkt in de afgelopen 33 maanden?',
      type: 'boolean',
      hint: 'Tel alleen voltijdse arbeidsdagen in loondienst + gelijkgestelde dagen (ziekte, vakantie)'
    },
    {
      id: 'typeArbeid',
      question: 'Was dit werk in loondienst (met RSZ-bijdragen)?',
      type: 'boolean',
      hint: 'Zelfstandig werk telt NIET mee voor werkloosheidsuitkering'
    },
    {
      id: 'onvrijwillig',
      question: 'Ben je onvrijwillig werkloos geworden?',
      type: 'boolean',
      hint: 'Ontslag, einde contract of collectief ontslag = JA. Zelf ontslag genomen = NEE'
    },
    {
      id: 'arbeidsgeschikt',
      question: 'Ben je arbeidsgeschikt en kun je werken?',
      type: 'boolean',
      hint: 'Je moet in staat zijn om te werken en beschikbaar zijn voor de arbeidsmarkt'
    },
    {
      id: 'ingeschreven',
      question: 'Ben je bereid om je in te schrijven als werkzoekende bij VDAB?',
      type: 'boolean',
      hint: 'Dit is verplicht om een uitkering te ontvangen'
    },
    {
      id: 'buitenlandswerk',
      question: 'Heb je (ook) in het buitenland gewerkt?',
      type: 'boolean',
      hint: 'Dit is relevant als je een deel van je werkverleden in het buitenland hebt opgebouwd'
    }
  ];

  const handleAnswer = (value) => {
    const currentQuestion = questions[step];
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    // Check if we should stop early (negative answer)
    if (currentQuestion.type === 'boolean' && !value) {
      if (currentQuestion.id === 'gewerkteDagen' || 
          currentQuestion.id === 'typeArbeid' || 
          currentQuestion.id === 'onvrijwillig' ||
          currentQuestion.id === 'arbeidsgeschikt' ||
          currentQuestion.id === 'ingeschreven') {
        setResult({
          eligible: false,
          reason: getReasonForNo(currentQuestion.id, newAnswers)
        });
        return;
      }
    }

    // Check for foreign work special case
    if (currentQuestion.id === 'buitenlandswerk' && value === true) {
      setStep(step + 1);
      return;
    }

    // Move to next question or show result
    if (step < questions.length - 1) {
      // Skip foreign work follow-up if not applicable
      if (currentQuestion.id === 'buitenlandswerk' && value === false) {
        calculateResult(newAnswers);
      } else {
        setStep(step + 1);
      }
    } else {
      calculateResult(newAnswers);
    }
  };

  const handleForeignWorkFollowUp = (hasWorkedInBelgium) => {
    const newAnswers = { ...answers, workedInBelgiumAfter: hasWorkedInBelgium };
    
    if (!hasWorkedInBelgium) {
      setResult({
        eligible: false,
        reason: 'Je hebt in het buitenland gewerkt, maar je moet daarna minstens 3 maanden in België hebben gewerkt om buitenlands werk mee te laten tellen voor je werkloosheidsuitkering.'
      });
    } else {
      calculateResult(newAnswers);
    }
  };

  const getReasonForNo = (questionId, currentAnswers) => {
    const requiredDays = currentAnswers.leeftijd < 36 ? 312 : currentAnswers.leeftijd >= 50 ? 624 : 468;
    const requiredMonths = currentAnswers.leeftijd < 36 ? 21 : currentAnswers.leeftijd >= 50 ? 42 : 33;

    switch(questionId) {
      case 'gewerkteDagen':
        return `Je hebt niet voldoende gewerkt. Voor jouw leeftijd (${currentAnswers.leeftijd} jaar) moet je minstens ${requiredDays} dagen hebben gewerkt binnen de afgelopen ${requiredMonths} maanden.`;
      case 'typeArbeid':
        return 'Alleen werk in loondienst (met RSZ-bijdragen) telt mee voor werkloosheidsuitkering. Zelfstandig werk geeft geen recht op werkloosheidsuitkering via de RVA.';
      case 'onvrijwillig':
        return 'Als je vrijwillig je baan hebt opgezegd, heb je in principe geen recht op werkloosheidsuitkering. Er zijn wel uitzonderingen mogelijk - neem contact op met de RVA voor jouw specifieke situatie.';
      case 'arbeidsgeschikt':
        return 'Je moet arbeidsgeschikt zijn om recht te hebben op werkloosheidsuitkering. Als je arbeidsongeschikt bent, moet je mogelijk een arbeidsongeschiktheidsuitkering aanvragen via het ziekenfonds.';
      case 'ingeschreven':
        return 'Inschrijving als werkzoekende bij VDAB is verplicht om werkloosheidsuitkering te ontvangen. Je moet actief beschikbaar zijn voor de arbeidsmarkt.';
      default:
        return 'Je voldoet niet aan alle voorwaarden voor werkloosheidsuitkering.';
    }
  };

  const calculateResult = (finalAnswers) => {
    // All critical answers must be yes
    const eligible = 
      finalAnswers.gewerkteDagen === true &&
      finalAnswers.typeArbeid === true &&
      finalAnswers.onvrijwillig === true &&
      finalAnswers.arbeidsgeschikt === true &&
      finalAnswers.ingeschreven === true;

    if (eligible) {
      setResult({
        eligible: true,
        summary: getSummary(finalAnswers)
      });
    } else {
      setResult({
        eligible: false,
        reason: 'Er is iets misgegaan bij de berekening. Probeer opnieuw.'
      });
    }
  };

  const getSummary = (finalAnswers) => {
    const requiredDays = finalAnswers.leeftijd < 36 ? 312 : finalAnswers.leeftijd >= 50 ? 624 : 468;
    const requiredMonths = finalAnswers.leeftijd < 36 ? 21 : finalAnswers.leeftijd >= 50 ? 42 : 33;

    return {
      leeftijd: finalAnswers.leeftijd,
      requiredDays,
      requiredMonths,
      buitenlandswerk: finalAnswers.buitenlandswerk
    };
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
  };

  // Result screen
  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              {result.eligible ? (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-green-700 mb-2">Je hebt waarschijnlijk recht op werkloosheidsuitkering!</h2>
                  <p className="text-gray-600">Op basis van je antwoorden voldoe je aan de basisvoorwaarden.</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-red-700 mb-2">Je hebt waarschijnlijk geen recht op werkloosheidsuitkering</h2>
                </>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              {result.eligible ? (
                <>
                  <h3 className="font-semibold text-gray-800 mb-3">Samenvatting:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>✓ Leeftijd: {result.summary.leeftijd} jaar</li>
                    <li>✓ Voldoende gewerkt: minstens {result.summary.requiredDays} dagen in {result.summary.requiredMonths} maanden</li>
                    <li>✓ Werk in loondienst met RSZ-bijdragen</li>
                    <li>✓ Onvrijwillig werkloos</li>
                    <li>✓ Arbeidsgeschikt en beschikbaar</li>
                    <li>✓ Bereid om in te schrijven bij VDAB</li>
                    {result.summary.buitenlandswerk && <li>✓ Buitenlands werk kan meetellen</li>}
                  </ul>
                  
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>Volgende stappen:</strong><br/>
                      1. Schrijf je in als werkzoekende bij VDAB<br/>
                      2. Dien je aanvraag in bij de RVA (via je vakbond of rechtstreeks)<br/>
                      3. Bereid je documenten voor (C4, arbeidskaart, identiteitskaart)
                    </p>
                  </div>

                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>Let op:</strong> Dit is een indicatie op basis van de basisvoorwaarden. De RVA kan aanvullende vragen stellen over je specifieke situatie. Neem bij twijfel contact op met de RVA of je vakbond.
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-gray-700">
                  <h3 className="font-semibold mb-2">Reden:</h3>
                  <p>{result.reason}</p>
                  
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>Wat nu?</strong><br/>
                      • Neem contact op met de RVA voor advies over jouw specifieke situatie<br/>
                      • Informeer bij je vakbond over mogelijke alternatieven<br/>
                      • Check of je mogelijk in aanmerking komt voor andere uitkeringen
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={restart}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Opnieuw beginnen
            </button>

            <div className="mt-6 text-center text-sm text-gray-500">
              Gebaseerd op officiële RVA-criteria (bijgewerkt januari 2025)
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Foreign work follow-up question
  if (step === questions.length && answers.buitenlandswerk === true) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-indigo-600">Vraag {step + 1} van {questions.length + 1}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${((step + 1) / (questions.length + 1)) * 100}%` }}></div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Heb je na je buitenlandse werk minstens 3 maanden in België gewerkt?
            </h2>
            
            <p className="text-gray-600 mb-6">
              Werk in EU-landen (en IJsland/Noorwegen/Zwitserland) kan meetellen, maar alleen als je daarna minstens 3 maanden in België hebt gewerkt.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleForeignWorkFollowUp(true)}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-green-700 transition text-left flex items-center justify-between"
              >
                <span>Ja, ik heb daarna minstens 3 maanden in België gewerkt</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              <button
                onClick={() => handleForeignWorkFollowUp(false)}
                className="w-full bg-red-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-red-700 transition text-left flex items-center justify-between"
              >
                <span>Nee, ik heb daarna niet in België gewerkt</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Werkloosheidsuitkering Checker</h1>
            <p className="text-gray-600">Controleer of je recht hebt op werkloosheidsuitkering in Vlaanderen</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-indigo-600">Vraag {step + 1} van {questions.length}</span>
              <button
                onClick={restart}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Opnieuw beginnen
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${((step + 1) / questions.length) * 100}%` }}></div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">{currentQuestion.question}</h2>
            <p className="text-gray-600 text-sm">{currentQuestion.hint}</p>
          </div>

          {currentQuestion.type === 'number' ? (
            <div className="space-y-4">
              <input
                type="number"
                min="16"
                max="100"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:border-indigo-600 focus:outline-none"
                placeholder="Vul je leeftijd in"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    handleAnswer(parseInt(e.target.value));
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.target.previousSibling;
                  if (input.value) {
                    handleAnswer(parseInt(input.value));
                  }
                }}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Volgende
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => handleAnswer(true)}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-green-700 transition text-left flex items-center justify-between"
              >
                <span>Ja</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              <button
                onClick={() => handleAnswer(false)}
                className="w-full bg-red-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-red-700 transition text-left flex items-center justify-between"
              >
                <span>Nee</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          )}

          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="mt-4 text-gray-600 hover:text-gray-800 flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Vorige vraag
            </button>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Gebaseerd op officiële RVA-criteria • Niet-bindend advies</p>
        </div>
      </div>
    </div>
  );
}
