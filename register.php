<?php $title = 'Créer un compte'; include __DIR__.'/partials/head.php'; include __DIR__.'/partials/header.php'; ?>
<section class="card" style="max-width:560px;margin:0 auto;">
  <h1 style="margin:0 0 14px 0;">Créer un compte</h1>
  <form id="register-form" action="/auth.php?action=register" method="post" class="form-grid" autocomplete="off">
    <input type="hidden" name="_csrf" />
    <label class="label">Prénom
      <input class="input" name="firstName" type="text" required />
    </label>
    <label class="label">Nom
      <input class="input" name="lastName" type="text" required />
    </label>
    <label class="label">Email
      <input class="input" name="email" type="email" required />
    </label>
    <label class="label">Téléphone
      <input class="input" name="phone" type="tel" />
    </label>
    <label class="label">Pays
      <input class="input" name="country" type="text" />
    </label>
    <label class="label">Nom d’utilisateur
      <input class="input" name="username" type="text" required />
    </label>
    <label class="label">Mot de passe
      <input class="input" name="password" type="password" minlength="6" required />
    </label>
    <button class="btn primary" type="submit">Créer le compte</button>
  </form>
</section>
<?php include __DIR__.'/partials/footer.php'; ?>
