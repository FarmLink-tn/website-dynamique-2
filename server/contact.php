<?php
// contact.php (page)
// Requiert partials/head.php et partials/header.php/pied pour le design global.
$title = 'Contact';
include __DIR__ . '/partials/head.php';
include __DIR__ . '/partials/header.php';
?>
<section class="card" style="max-width:560px;margin:0 auto;">
  <h1 style="margin:0 0 14px 0;">Contact</h1>
  <form id="contact-form" action="/contact_submit.php" method="post" class="form-grid" autocomplete="off">
    <input type="hidden" name="_csrf" />
    <label class="label">Nom
      <input class="input" name="name" type="text" required />
    </label>
    <label class="label">Email
      <input class="input" name="email" type="email" required />
    </label>
    <label class="label">Message
      <textarea class="textarea" name="message" rows="5" required></textarea>
    </label>
    <button class="btn primary" type="submit">Envoyer</button>
  </form>
</section>
<script>
// Client minimal pour CSRF + soumission avec fetch (credentials)
(function () {
  const form = document.getElementById('contact-form');

  async function loadCsrf() {
    const res = await fetch('/csrf.php', { method: 'GET', credentials: 'include', headers: { 'Accept': 'application/json' }});
    if (!res.ok) return;
    const { csrfToken } = await res.json();
    const hidden = form.querySelector('input[name="_csrf"]');
    if (hidden) hidden.value = csrfToken || '';
    window.__CSRF__ = csrfToken || '';
  }

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(form);
    if (!fd.get('_csrf') && window.__CSRF__) fd.set('_csrf', window.__CSRF__);

    try {
      let res = await fetch(form.action, { method:'POST', credentials:'include', headers:{'Accept':'application/json'}, body: fd });
      if (res.status === 403) { await loadCsrf(); if (!fd.get('_csrf') && window.__CSRF__) fd.set('_csrf', window.__CSRF__); res = await fetch(form.action, { method:'POST', credentials:'include', headers:{'Accept':'application/json'}, body: fd }); }
      if (res.ok) { alert('Message envoyé.'); form.reset(); }
      else { let m='Échec'; try{const j=await res.json(); m=j?.error||m;}catch{} alert(m); }
    } catch { alert('Erreur réseau.'); }
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', loadCsrf); else loadCsrf();
  form.addEventListener('submit', onSubmit);
})();
</script>
<?php include __DIR__ . '/partials/footer.php'; ?>
