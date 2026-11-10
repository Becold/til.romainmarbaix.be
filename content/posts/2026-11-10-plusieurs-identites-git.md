---
title: "Plusieurs utilisateurs Git sur la même machine"
description: "Forcer Git à refuser un commit sans identité, choisir perso/pro en une commande, et automatiser les cas évidents avec includeIf."
publishDate: 2026-11-10
lang: fr
translationKey: git-multiple-identities
tags: [git]
---

J'utilise la même machine pour mes projets perso (GitHub) et pro. Le risque : commiter avec la mauvaise adresse e-mail.

Git ne sait pas demander « quelle identité ? » de lui-même. Mais une option native s'en approche : il **refuse de commiter** tant que le dépôt n'a pas d'identité définie.

## 1. Forcer le choix (natif)

Supprimer l'identité globale et activer `user.useConfigOnly` :

```sh
git config --global --unset user.name
git config --global --unset user.email
git config --global user.useConfigOnly true
```

Dans un dépôt sans identité, `git commit` s'arrête alors avec une erreur du type :

```text
fatal: no email was given and auto-detection is disabled
```

Rien n'est commité tant qu'aucune identité n'est choisie. Sans `useConfigOnly`, Git devinerait un nom et un e-mail à partir du nom d'utilisateur et du nom de la machine.

## 2. Choisir en une commande

Deux alias globaux écrivent l'identité dans la config **locale** du dépôt :

```sh
git config --global alias.perso "!git config user.name 'Prénom Nom' && git config user.email '12345678+pseudo@users.noreply.github.com' && echo 'Identité : perso'"
git config --global alias.pro "!git config user.name 'Prénom Nom' && git config user.email 'prenom.nom@entreprise.com' && echo 'Identité : pro'"
```

À la première erreur dans un dépôt, je tape `git perso` ou `git pro`. Le choix est enregistré dans `.git/config` pour ce dépôt seulement, et Git ne redemande plus.

> L'adresse `…@users.noreply.github.com` se trouve dans GitHub › Settings › Emails. Elle évite d'exposer ton vrai e-mail dans l'historique public.

## 3. Bonus : choix automatique dans les cas évidents

Avec `includeIf`, l'identité peut dépendre du **dossier** du dépôt ou de l'**URL du remote**. Dans `~/.gitconfig` :

```ini
[includeIf "hasconfig:remote.*.url:git@github.com:pseudo/**"]
    path = ~/.gitconfig-perso
[includeIf "gitdir/i:C:/Lab/Personal/"]
    path = ~/.gitconfig-perso
```

Et `~/.gitconfig-perso` contient simplement :

```ini
[user]
    name = Prénom Nom
    email = 12345678+pseudo@users.noreply.github.com
```

Un `~/.gitconfig-pro` suit le même principe, par exemple pour les remotes Azure DevOps de l'entreprise (`hasconfig:remote.*.url:https://dev.azure.com/entreprise/**`).

Les dépôts qui ne correspondent à aucune règle restent bloqués par l'étape 1 : pas de commit silencieux avec la mauvaise identité.

Points d'attention :

- `hasconfig:remote.*.url:` demande **Git 2.36+**.
- `gitdir/i:` ignore la casse (utile sous Windows). Le chemin doit finir par `/` pour inclure tous les sous-dossiers.
- **Cas du fork** : quand je contribue à un projet tiers via mon fork, `origin` pointe sur `pseudo/…`. La règle `hasconfig` s'applique donc aussi, ce qui est voulu.

## Vérifier

```sh
git config user.email                         # identité effective
git config --show-origin --get user.email     # quel fichier l'a définie
```
