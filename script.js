// Fonction pour afficher les messages de log avec horodatage
function log(message) {
  const timestamp = new Date().toTimeString().split(' ')[0];
  const div = document.createElement('div');
  div.innerText = `[${timestamp}] ${message}`;
  document.body.appendChild(div);
}

let recognitionAttempts = 0;
const MAX_ATTEMPTS = 5;

function runRecognition() {
  recognitionAttempts++;
  log(`Démarrage de la reconnaissance - tentative ${recognitionAttempts}/${MAX_ATTEMPTS}`);
  
  // Vérifier la compatibilité du navigateur
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (SpeechRecognition) {
    // Créer une instance de SpeechRecognition
    const recognition = new SpeechRecognition();
    
    // Définir les paramètres plus sensibles
    recognition.lang = 'fr-FR';           // Langue française
    recognition.continuous = false;        // Mode non-continu est plus fiable sur mobile
    recognition.interimResults = true;     // Afficher les résultats intermédiaires
    recognition.maxAlternatives = 3;       // Récupérer plusieurs alternatives
    
    // Pour le debug
    let recognitionActive = true;
    let speechDetected = false;
    
    // Événement déclenché au début de la reconnaissance
    recognition.onstart = () => {
      log('🎤 Reconnaissance vocale démarrée - PARLEZ MAINTENANT');
      recognitionActive = true;
      
      // Timer de sécurité (certains navigateurs ne déclenchent pas toujours les événements)
      setTimeout(() => {
        if (recognitionActive && !speechDetected) {
          log('⏱️ Délai de détection dépassé. Redémarrage forcé...');
          try {
            recognition.stop();
          } catch (e) {
            log('Erreur lors de l\'arrêt forcé: ' + e.message);
          }
        }
      }, 10000); // 10 secondes d'attente max
    };
    
    // Événement déclenché lorsque le navigateur détecte un son
    recognition.onsoundstart = () => {
      log('🔊 Son détecté! Attente de parole...');
    };
    
    // Événement déclenché lorsque le navigateur détecte de la parole
    recognition.onspeechstart = () => {
      log('🗣️ Parole détectée! Analyse en cours...');
      speechDetected = true;
    };
    
    // Événement déclenché lorsque des résultats intermédiaires sont disponibles
    recognition.onresult = (event) => {
      speechDetected = true;
      let interim = '';
      let final = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
          log(`✅ Résultat final: "${event.results[i][0].transcript}" (Confiance: ${event.results[i][0].confidence.toFixed(2)})`);
          
          // Afficher les alternatives si disponibles
          if (event.results[i].length > 1) {
            log('Alternatives:');
            for (let j = 1; j < event.results[i].length; j++) {
              log(`  - "${event.results[i][j].transcript}" (${event.results[i][j].confidence.toFixed(2)})`);
            }
          }
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      
      if (interim !== '') {
        log(`🔄 Résultat intermédiaire: "${interim}"`);
      }
      
      if (final !== '') {
        const resultDiv = document.createElement('div');
        resultDiv.style.fontWeight = 'bold';
        resultDiv.style.color = 'green';
        resultDiv.innerHTML = final;
        document.body.appendChild(resultDiv);
      }
    };
    
    // Événement déclenché à la fin de la reconnaissance
    recognition.onend = () => {
      recognitionActive = false;
      log('🛑 La reconnaissance vocale est terminée.');
      
      if (!speechDetected) {
        log('⚠️ Aucune parole n\'a été détectée pendant cette session.');
      }
      
      // Si on n'a pas dépassé le nombre max de tentatives, on réessaie
      if (recognitionAttempts < MAX_ATTEMPTS) {
        log(`Redémarrage dans 2 secondes... (${recognitionAttempts}/${MAX_ATTEMPTS})`);
        setTimeout(() => runRecognition(), 2000);
      } else {
        log('Nombre maximal de tentatives atteint. Diagnostic:');
        log('1. Vérifiez que votre microphone fonctionne correctement');
        log('2. Essayez de parler plus fort et plus clairement');
        log('3. Testez un autre navigateur (Chrome est recommandé)');
        log('4. Sur iOS, seul Safari est pleinement compatible');
        
        // Bouton pour réessayer manuellement
        const retryButton = document.createElement('button');
        retryButton.innerText = 'Réessayer la reconnaissance vocale';
        retryButton.style.padding = '10px';
        retryButton.style.margin = '10px 0';
        retryButton.onclick = () => {
          recognitionAttempts = 0;
          runRecognition();
        };
        document.body.appendChild(retryButton);
        
        // Test du microphone
        log('Test du microphone pour vérifier s\'il capte du son:');
        testMicrophone();
      }
    };
    
    // Gérer les erreurs
    recognition.onerror = (event) => {
      log(`❌ Erreur de reconnaissance: "${event.error}"`);
      
      switch (event.error) {
        case 'not-allowed':
          log('🚨 Permissions microphone refusées! Vérifiez les paramètres de votre navigateur.');
          break;
        case 'network':
          log('🌍 Erreur réseau. Vérifiez votre connexion internet.');
          break;
        case 'no-speech':
          log('🔇 Aucune parole détectée. Parlez plus fort ou vérifiez votre microphone.');
          break;
        case 'aborted':
          log('Reconnaissance interrompue.');
          break;
        case 'audio-capture':
          log('🎤 Problème de capture audio. Aucun microphone disponible ou microphone défectueux.');
          break;
        case 'service-not-allowed':
          log('Service de reconnaissance non autorisé sur ce domaine.');
          break;
        case 'bad-grammar':
          log('Problème avec la grammaire de reconnaissance.');
          break;
        case 'language-not-supported':
          log(`La langue '${recognition.lang}' n'est pas supportée. Essayez 'en-US' à la place.`);
          break;
        default:
          log(`Erreur inconnue: ${event.error}`);
      }
    };
    
    // Événements supplémentaires pour le diagnostic
    recognition.onnomatch = () => {
      log('🤷‍♂️ Parole détectée mais non reconnue');
    };
    
    recognition.onsoundend = () => {
      log('🔇 Son terminé');
    };
    
    recognition.onspeechend = () => {
      log('🔇 Parole terminée');
    };
    
    // Démarrer la reconnaissance vocale
    try {
      recognition.start();
    } catch (e) {
      log('🚫 Erreur au démarrage de la reconnaissance: ' + e.message);
      
      if (e.message.includes('already started')) {
        log('Une instance de reconnaissance est déjà en cours. Tentative d\'arrêt forcé...');
        try {
          recognition.stop();
          setTimeout(() => runRecognition(), 500);
        } catch (stopError) {
          log('Impossible d\'arrêter la reconnaissance précédente: ' + stopError.message);
        }
      }
    }
  } else {
    log('❌ La reconnaissance vocale n\'est pas supportée par ce navigateur.');
  }
}

// Fonction pour tester le microphone et afficher le niveau sonore
function testMicrophone() {
  try {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        log('✅ Microphone autorisé, test de volume en cours...');
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
        
        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;
        
        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);
        
        const volumeDiv = document.createElement('div');
        volumeDiv.style.padding = '10px';
        volumeDiv.style.margin = '10px 0';
        volumeDiv.style.backgroundColor = '#f0f0f0';
        volumeDiv.innerText = 'Niveau sonore: 0';
        document.body.appendChild(volumeDiv);
        
        const meterDiv = document.createElement('div');
        meterDiv.style.height = '20px';
        meterDiv.style.width = '100%';
        meterDiv.style.backgroundColor = '#e0e0e0';
        meterDiv.style.position = 'relative';
        document.body.appendChild(meterDiv);
        
        const levelDiv = document.createElement('div');
        levelDiv.style.height = '100%';
        levelDiv.style.width = '0%';
        levelDiv.style.backgroundColor = 'green';
        levelDiv.style.position = 'absolute';
        meterDiv.appendChild(levelDiv);
        
        let testCount = 0;
        const TEST_DURATION = 30; // 30 iterations ≈ 15 secondes
        
        javascriptNode.onaudioprocess = function() {
          testCount++;
          
          if (testCount > TEST_DURATION) {
            javascriptNode.onaudioprocess = null;
            javascriptNode.disconnect();
            analyser.disconnect();
            microphone.disconnect();
            
            log('Test du microphone terminé.');
            
            const retryButton = document.createElement('button');
            retryButton.innerText = 'Réessayer avec nouveau paramètres';
            retryButton.style.padding = '10px';
            retryButton.style.margin = '10px 0';
            retryButton.onclick = () => {
              const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
              if (SpeechRecognition) {
                const newLang = prompt('Entrez une langue à tester (par ex. "en-US", "fr-FR", "es-ES"):', 'en-US');
                if (newLang) {
                  recognitionAttempts = 0;
                  recognition.lang = newLang;
                  log(`Langue changée à ${newLang}`);
                  runRecognition();
                }
              }
            };
            document.body.appendChild(retryButton);
            
            return;
          }
          
          const array = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(array);
          let values = 0;
          
          const length = array.length;
          for (let i = 0; i < length; i++) {
            values += array[i];
          }
          
          const average = values / length;
          volumeDiv.innerText = `Niveau sonore: ${Math.round(average)}`;
          
          // Mise à jour de la visualisation
          const percentage = Math.min(100, average * 3);
          levelDiv.style.width = `${percentage}%`;
          
          if (average < 5) {
            levelDiv.style.backgroundColor = '#ff0000';
            volumeDiv.innerHTML += ' <span style="color:red">(Trop faible!)</span>';
          } else if (average < 15) {
            levelDiv.style.backgroundColor = '#ff9900';
            volumeDiv.innerHTML += ' <span style="color:orange">(Faible)</span>';
          } else {
            levelDiv.style.backgroundColor = '#00cc00';
          }
        };
      })
      .catch((error) => {
        log(`❌ Microphone refusé: ${error}`);
      });
  } catch (error) {
    log(`❌ Erreur lors de l'accès au microphone: ${error}`);
  }
}

// Fonction initiale
function init() {
  log('🧪 Test de reconnaissance vocale');
  
  // Vérification de la compatibilité
  if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
    log("❌ Votre navigateur ne supporte pas la reconnaissance vocale.");
    log("Navigateurs compatibles: Chrome, Edge, Safari (iOS 14.5+)");
    return;
  }
  
  log("✅ L'API SpeechRecognition est disponible");
  log('Vérification des droits microphone...');
  
  // Vérification des droits microphone
  try {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        log("✅ Microphone autorisé");
        
        // Informations sur le navigateur
        const userAgent = navigator.userAgent;
        log(`📱 Navigateur: ${userAgent}`);
        
        // Langue du navigateur
        log(`🌐 Langue navigateur: ${navigator.language}`);
        
        // Démarrage de la reconnaissance
        recognitionAttempts = 0;
        runRecognition();
      })
      .catch((error) => {
        log(`❌ Microphone refusé: ${error}`);
      });
  } catch (error) {
    log(`❌ Erreur lors de l'accès au microphone: ${error}`);
  }
}

async function selectMicrophone() {
  try {
    // Afficher tous les appareils audio disponibles
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter(device => device.kind === 'audioinput');
    
    if (audioInputs.length === 0) {
      log("❌ Aucun microphone détecté sur l'appareil!");
      return null;
    }
    
    log(`📢 Microphones disponibles (${audioInputs.length}) :`);
    audioInputs.forEach((device, index) => {
      log(`${index + 1}. ${device.label || 'Microphone ' + (index + 1)}`);
    });
    
    // Créer des boutons pour chaque microphone
    const microphoneSelectionDiv = document.createElement('div');
    microphoneSelectionDiv.style.margin = '10px 0';
    document.body.appendChild(microphoneSelectionDiv);
    
    audioInputs.forEach((device, index) => {
      const button = document.createElement('button');
      button.innerText = `Utiliser ${device.label || 'Microphone ' + (index + 1)}`;
      button.style.display = 'block';
      button.style.margin = '5px';
      button.style.padding = '10px';
      button.onclick = async () => {
        log(`Tentative d'utilisation du microphone: ${device.label || 'Microphone ' + (index + 1)}`);
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {deviceId: {exact: device.deviceId}}
          });
          log(`✅ Microphone sélectionné avec succès`);
          testMicrophone(stream);
        } catch (error) {
          log(`❌ Erreur lors de la sélection du microphone: ${error}`);
        }
      };
      microphoneSelectionDiv.appendChild(button);
    });
    
    // Bouton pour utiliser le microphone par défaut
    const defaultButton = document.createElement('button');
    defaultButton.innerText = 'Utiliser le microphone par défaut';
    defaultButton.style.display = 'block';
    defaultButton.style.margin = '5px';
    defaultButton.style.padding = '10px';
    defaultButton.onclick = async () => {
      log(`Tentative d'utilisation du microphone par défaut`);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        log(`✅ Microphone par défaut sélectionné avec succès`);
        testMicrophone(stream);
      } catch (error) {
        log(`❌ Erreur lors de la sélection du microphone par défaut: ${error}`);
      }
    };
    microphoneSelectionDiv.appendChild(defaultButton);
    
  } catch (error) {
    log(`❌ Erreur lors de l'énumération des appareils: ${error}`);
    return null;
  }
}

// Modifiez votre fonction init pour appeler celle-ci
function initMic() {
  log('🧪 Test des microphones disponibles');
  selectMicrophone();
}
// Démarrer l'application
// init();
initMic();
