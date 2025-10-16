<?php $title = 'Créer un compte'; include __DIR__.'/partials/head.php'; include __DIR__.'/partials/header.php'; ?>
<section class="card" style="max-width:560px;margin:0 auto;">
  <h1 style="margin:0 0 14px 0;">Créer un compte</h1>
  <form id="register-form" action="/server/auth.php?action=register" method="post" class="form-grid" autocomplete="off">
    <input type="hidden" name="_csrf" />
    <label class="label">Prénom
      <input class="input" id="register-first-name" name="first_name" type="text" required />
    </label>
    <label class="label">Nom
      <input class="input" id="register-last-name" name="last_name" type="text" required />
    </label>
    <label class="label">Email
      <input class="input" id="register-email" name="email" type="email" required />
    </label>
    <label class="label">Téléphone
      <input class="input" id="register-phone" name="phone" type="tel" required />
    </label>
    <label class="label">Région
      <input class="input" id="register-region" name="region" type="text" required />
    </label>
    <label class="label">Mot de passe
      <input class="input" id="register-password" name="password" type="password" minlength="8" required />
    </label>
    <button class="btn primary" type="submit">Créer le compte</button>
  </form>
  <p id="register-message" class="text-sm" aria-live="polite"></p>
</section>
<?php include __DIR__.'/partials/footer.php'; ?>
