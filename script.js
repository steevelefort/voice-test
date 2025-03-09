function log(message) {
  div = document.createElement('div');
  div.innerText = message;
  document.body.appendChild(div);
}


function runRecognition() {
  // Vérifier la compatibilité du navigateur
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    // Créer une instance de SpeechRecognition
    const recognition = new SpeechRecognition();

    // Définir les paramètres
    recognition.lang = 'fr-FR'; // Langue française
    recognition.continuous = true; // Reconnaissance continue
    recognition.interimResults = false; // Résultats intermédiaires

    // Événement déclenché lorsque des résultats sont disponibles
    recognition.onresult = (event) => {
      const transcript = event.results[event.resultIndex][0].transcript.trim();
      log('Texte reconnu :', transcript);
      div = document.createElement('div');
      div.innerHTML = transcript;
      document.body.appendChild(div);
      // recognition.start() ;
      // Traitez le texte reconnu ici
    };

    recognition.onend = () => {
      log('La reconnaissance vocale est terminée.');
      // runRecognition();
    };

    // Gérer les erreurs
    recognition.onerror = (event) => {
      log('Erreur de reconnaissance vocale :')
      log(event.error);
      // runRecognition();
    };

    // Démarrer la reconnaissance vocale
    recognition.start();
    log('La reconnaissance vocale est active.');
  } else {
    log('La reconnaissance vocale n\'est pas supportée par ce navigateur.');
  }
}

log('Test ...');
if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
  log("Votre navigateur ne supporte pas la reconnaissance vocale.");
} else {
  log("L'API SpeechRecognition est disponible.");
  log('Vérification des droits...');

  try {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        log("Microphone autorisé.");
        runRecognition();
      })
      .catch((error) => {
        log("Microphone refusé :", error);
      });
  } catch (error) {
    log("Erreur lors de l'accès au microphone :", error);
  }
}
