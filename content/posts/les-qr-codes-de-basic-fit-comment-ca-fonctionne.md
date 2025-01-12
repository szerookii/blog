---
title: "Les QR Codes de Basic Fit : Comment ça fonctionne ?"
description: Comment ça marche ces QR Codes qu’on scanne à l’entrée des salles Basic Fit ? C’est la question que je me suis posé. Dans ce post, on va parler QR Codes, appli mobile, un peu de tech, et de reverse engineering.
pubDate: 01/10/2025
image: /blog-img/les-qr-codes-de-basic-fit-comment-ca-fonctionne/header.webp
tags: ["reverse engineering", "salle de sport", "qr code"]
slug: les-qr-codes-de-basic-fit-comment-ca-fonctionne
published: true
---

# Introduction

Comment ça marche ces QR Codes qu’on scanne à l’entrée des salles Basic Fit ? C’est la question que je me suis posé y a pas si longtemps en passant le tourniquet de Basic Fit. Donc, j'ai décidé de me pencher sur le sujet et de voir comment ça fonctionne.

⚠️ Ce post ne vous apprendra pas comment frauder votre abonnement Basic Fit. C'est juste une analyse technique pour comprendre comment fonctionne le système de QR Code de Basic Fit, rien de plus. ⚠️

# 1. Une analyse initiale : ce que révèle un simple scan

Pour commencer, j'ai scanné un QR Code avec mon téléphone pour voir ce qu'il contenait. J'ai utilisé une application de lecture de QR Code pour scanner le code. Voici ce que j'ai obtenu :

```plaintext
GM2:V00347833:2L8:1720878864:E587E5E8
```

À partir de ça, j'ai fouiller un peu sur l'application Basic Fit pour voir si je pouvais trouver quelque chose, voici ce que j'ai pu en déduire :

- GM2 : Sûrement un identifiant de version pour le format du QR Code
- V00347833 : En regardant sur l'écran du QR Code, on peut voir que c'est un identifiant de carte
- 1720878864 : Un timestamp ?
- E587E5E8 : Un checksum ?

On a déjà pas mal d'informations, mais on peut faire mieux. On va creuser un peu plus et voir ce qu'on peut trouver en analysant l'application Basic Fit plus en détail.

# 2. En creusant : à l'intérieur de l'appli Basic Fit

Ne trouvant pas plus d'informations sur l'application en elle-même, j'ai décidé de regarder un peu plus en profondeur et décidé de reverse engineer l'application. Pour cela j'ai utilisé [Jadx](https://github.com/skylot/jadx) qui est un outil open-source pour décompiler des applications Android, il permet notamment d'avoir un aperçu du code source de l'application en générant du code Java à partir du bytecode Dalvik.

En analysant la structure de l'application, on peut remarqué quelque chose d'intéréssant : un fichier nommé `main.jsbundle` ce qui laisse penser que l'application utilise React Native & le moteur Hermes Engine.

## 2.1. React Native & Hermes Engine

React Native est un framework développé par Meta qui permet de créer des applications mobiles en utilisant JavaScript et React.

Cependant, ce qui rend cette application encore plus intéressante, c’est l’utilisation de Hermes, un moteur JavaScript également développé par Meta. Hermes compile le code JavaScript en bytecode, permettant de réduire les temps de démarrage et d’optimiser les performances des applications, ce qui va nous compliquer un peu la tâche pour comprendre le fonctionnement de l'application, mais on va s'en sortir.

### Pourquoi Hermes complique un peu l’analyse ?

- Contrairement à du simple JavaScript ou du code interprété, le bytecode Hermes n’est pas directement lisible.
- Bien que Jadx m’ait donné une idée de la structure et des technologies utilisées, la logique exacte de certains mécanismes, comme le QR Code ou le hash, n’est pas directement visible dans le code.

## 2.2. Analyse du bytecode Hermes Engine

En analysant le bytecode généré par Hermes, on y découvre plusieurs choses intéressantes :

- GM2 est bien un identifiant pour permettre aux tourniquets de reconnaître le format du QR Code.
- V00347833 est bien l’identifiant de la carte.
- 2L8 est un identifiant généré de façon aléatoire pour chaque scan.
- 1720878864 est un timestamp Unix **(en secondes)**.
- E587E5E8 est un checksum sous forme de hash.

## 2.3. Hash et deviceId

Le deviceId semble être la clé manquante pour comprendre la génération du hash. Si celui-ci est essentiel pour valider le QR Code, il est difficile d’en savoir plus en l’absence de détails explicites dans le bytecode.

Cependant, après avoir analysé plus en profondeur, le processus de génération du hash devient plus clair : pour généré le hash, l'application fait un hash SHA256 de la concaténation des informations suivantes : `V00347833:2L8:1720878864:deviceId` puis renvoies les 8 derniers caractères du hash.

### Pourquoi c’est important :

En comprenant comment le deviceId et ces autres valeurs sont combinés pour générer ce hash, on réalise qu’ils jouent un rôle crucial dans la validation du QR Code. Chaque paramètre est indispensable pour garantir que le QR Code est à la fois unique et sécurisé.

# 3. Analyse du trafic réseau : décryptage des échanges entre l’application et le serveur

Malgré la richesse des informations contenues dans le bytecode, il restait une dernière pièce à découvrir : d’où vient exactement ce deviceId et comment il s’intègre dans la logique du QR Code ? Pour résoudre cette énigme, il fallait aller plus loin. Dans un dernier effort, je décide de lancer l'outil d'analyse réseau [Charles Proxy](https://www.charlesproxy.com) afin de mieux comprendre ce qui se passe entre l’application et les serveurs de Basic Fit.

Après quelques scans, on peut observer que l’application utilise OAuth 2.0 pour l’authentification, avec un ajout de sécurité supplémentaire via PKCE (Proof Key for Code Exchange). Cette méthode protège contre les attaques par interception de code en générant un code d’échange unique pour sécuriser les tokens d’accès.

![PKCE](/blog-img/les-qr-codes-de-basic-fit-comment-ca-fonctionne/pkce.webp)

Bien que cela améliore la sécurité générale de l’application, ce qui nous intéresse ici, c’est la manière dont l’application récupère et gère le deviceId à travers ce processus. Après l’authentification, l’application effectue plusieurs requêtes pour récupérer des informations sur l’utilisateur.

On constate que le deviceId est récupéré à chaque lancement de l’application et stocké en local sur le téléphone, avec plusieurs autres informations :

```json
{
  "member": {
    "cardnumber": "V00347833",
    "country": "FR",
    "homeClub": "Basic-Fit Paris Avenue des Champs-Élysées",
    "deviceId": "8d20fc96-1b0e-4982-8292-e97caed114ec"
  }
}
```

# Générer un QR Code

Maintenant que nous avons toutes les informations nécessaires pour générer un QR Code valide, on peut le faire en utilisant un simple script JavaScript :

```javascript
import QRCode from "qrcode";
import * as crypto from "crypto";

const CARD_NUMBER = "V00347833";
const DEVICE_ID = "8d20fc96-1b0e-4982-8292-e97caed114ec";

// cf. 2.3. Hash et deviceId
function generateHash(cardNr, guid, iat, deviceId) {
  const dataToHash = cardNr + guid + iat + deviceId;
  const hash = crypto.createHash("sha256").update(dataToHash).digest("hex");
  const hashLast8 = hash.slice(-8).toUpperCase();
  return hashLast8;
}

const timestamp = Math.floor(Date.now() / 1000);
const hash = generateHash(CARD_NUMBER, "2L8", timestamp, DEVICE_ID);

const qrCodeData = `GM2:${CARD_NUMBER}:2L8:${timestamp}:${hash}`;

QRCode.toString(qrCodeData, { type: "terminal" }, function (err, url) {
  console.log(url);
});
```

Ce qui nous donne :

![QR Code](/blog-img/les-qr-codes-de-basic-fit-comment-ca-fonctionne/resultat.webp){ width="50%" }

Ce QR Code étant valide, il peut être scanné à l’entrée d’une salle Basic Fit pour accéder à la salle de sport. (Si vous avez un abonnement valide bien sûr 😉)

# Conclusion

Le processus de génération et de validation des QR Codes de Basic Fit repose sur un système sécurisé qui combine des données utilisateur, un identifiant unique de l’appareil et un hash SHA-256. Grâce à des technologies comme React Native, Hermes Engine, et OAuth 2.0 avec PKCE.

L’application garantit que chaque QR Code est lié à l’utilisateur et à l’appareil qu’il a choisi pour accéder au club. Cela assure que seul cet appareil pourra être utilisé pour entrer, renforçant ainsi la sécurité.

_(Et j’ai pu tester le processus par moi-même, et cela fonctionne parfaitement bien !)_
